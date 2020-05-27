const path = require("path");
const { AML, create_logger, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_mam",
  file_name: __filename
});

const DEFAULT_CONFIG = { process_delay: 0, process_debug: false };

class AML_Roots {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.last_mirror = {};
    this.root_map = {};

    this.aml_source = { system: {}, program: {}, form: {}, script: {} };

    this.queue_last_id = "";

    this.process_delay_stopwatch = new Stopwatch(this.config.process_delay);

    this._ready = false;
  }

  initialize() {}

  terminate() {
    for (const root of Object.values(this.root_map)) root.terminate();

    this.root_map = {};
  }

  poll() {
    if (!this._ready) {
      this._check_ready();
      return;
    }

    if (this.process_delay_stopwatch.is_elapsed()) {
      this.emit_data();
      for (const root of Object.values(this.root_map)) root.process();
      this.process_delay_stopwatch.reset();
    }
  }

  _reload() {
    this.terminate();

    for (const id of this.root_module.data.objects_list) {
      const mirror_object = this.root_module.data.mirror.objects[id];
      if (mirror_object == null)
        throw new Error(`Not found object id[${id}] in mirror`);

      const root = new AML.Root();

      root.options.debug_enabled = this.config.process_debug;
      root.install_process_api(
        ({ root, fn_full_name, script_id, query_id, timeout, args }) => {
          this.root_module.managers.world_client.send("process_api", {
            object_id: root.ext.object_id,
            api: fn_full_name,
            timeout,
            args
          });
        }
      );
      root.install_ext({
        root_module: this.root_module,
        object_id: id
      });
      root.install_data_getter(() => {
        // must be this format because mirror is overwritten
        return this.root_module.data.mirror.objects[id].data;
      });
      root.install_source_getter_async((...args) => {
        this.get_aml_source_async(...args);
      });

      this.root_map[id] = root;
    }
  }

  emit_data() {
    const handle_aml_signal = (root, signal) => {
      if (signal.key === "root") {
        const type = "system";
        root.source_ids = signal.value;
        this.get_aml_source_async(
          { type, id: Object.values(root.source_ids.system)[0] },
          (source) => {
            root.update(type, source);
          }
        );
      } else {
        const type = signal.key;
        const id = signal.value;

        this.get_aml_source_async({ type, id }, (source) => {
          root.update(type, source);
        });
      }
    };

    if (
      this.last_mirror === this.root_module.data.mirror ||
      this.root_module.data.mirror == null
    )
      return;

    this.last_mirror = this.root_module.data.mirror;

    for (const [id, object] of Object.entries(this.last_mirror.objects)) {
      for (const [signal_id, signal_data] of Object.entries(object.data)) {
        try {
          const root = this.root_map[id];

          if (signal_id === "queue") {
            let start_queue_index = 0;
            for (let i = 0; i < signal_data.length; i++) {
              if (signal_data[i].id === this.queue_last_id) {
                start_queue_index = Math.min(i + 1, signal_data.length);
                break;
              }
            }

            for (let i = start_queue_index; i < signal_data.length; i++) {
              const signal = signal_data[i];
              this.queue_last_id = signal.id;

              if (
                ["root", "system", "program", "form", "script"].includes(
                  signal.key
                )
              ) {
                handle_aml_signal(root, signal);
              } else {
                logger.error(`Unknown queue_signal id[${signal.id}]`);
              }
            }
          } else {
            root.emit(signal_id, signal_data);
          }
        } catch (e) {
          logger.error(
            `Unable to handle signal id[${signal_id}]. \n${e}\n${e.stack}`
          );
        }
      }
    }
  }

  get_aml_source_async({ type, id }, callback) {
    const refresh_all_aml_source_async = (type, callback) => {
      this.root_module.managers.editor.get_data(
        `am_${type}`,
        (objects_list, message) => {
          try {
            if (objects_list == null || objects_list.length === 0) return;

            for (const object of objects_list) {
              let source =
                type !== "script"
                  ? object
                  : AML.script_to_json(object.id, object.source);

              this.aml_source[type][source.id] = source;
            }

            callback();
          } catch (e) {
            logger.error(`Unable to get data [am_${type}]. \n${e}\n${e.stack}`);
          }
        }
      );
    };

    if (this.aml_source[type] == null || this.aml_source[type][id] == null) {
      refresh_all_aml_source_async(type, () => {
        try {
          callback(this.aml_source[type][id]);
        } catch (e) {
          logger.error(
            `Unable to get data [am_${type}] type[${type}] id[${id}].` +
              `\n${e.stack}`
          );
        }
      });
    } else {
      callback(this.aml_source[type][id]);
    }
  }

  process_return_value({ script_id, query_id, value }) {
    for (const root of Object.values(this.root_map))
      root.return_data.insert({ script_id, query_id, value });
  }

  _check_ready() {
    if (
      this.root_module.managers.editor.is_connected() &&
      "objects_list" in this.root_module.data &&
      "objects_list" in this.root_module.data &&
      "mirror" in this.root_module.data &&
      this.last_mirror !== this.root_module.data.mirror
    ) {
      this._ready = true;
      this._reload();
    }
  }
}

module.exports = AML_Roots;
