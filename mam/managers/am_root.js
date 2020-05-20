const path = require("path");
const { AM, create_logger, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_mam",
  file_name: __filename
});

const DEFAULT_CONFIG = { process_delay: 0, process_debug: false };

class AM_Root {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.last_mirror = {};
    this.root_map = {};

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

    const { am_source } = this.root_module.managers.am_data;

    for (const id of this.root_module.data.objects_list) {
      const root = new AM.Root();
      root.ext.object_id = id;

      root.install_data_getter(() => {
        return this.root_module.data.mirror.objects[id].data;
      });
      root.install_api(
        ({ root, fn_full_name, script_id, query_id, timeout, args }) => {
          this.root_module.managers.world_client.send("process_api", {
            object_id: root.ext.object_id,
            api: fn_full_name,
            timeout,
            args
          });
        }
      );

      const parsed_scripts = {};

      for (const script of Object.values(am_source.scripts))
        parsed_scripts[script.id] = AM.AML.parse(script.id, script.source);
      root.install_scripts(parsed_scripts);

      root.install_forms(am_source.forms);
      root.install_programs(am_source.programs);
      root.install_system(am_source.systems[Object.keys(am_source.systems)[0]]);
      root.install_ext({
        root_module: this.root_module
      });
      root._debug_enabled = this.config.process_debug;

      this.root_map[id] = root;
    }
  }

  emit_data() {
    if (
      this.last_mirror === this.root_module.data.mirror ||
      this.root_module.data.mirror == null
    )
      return;

    this.last_mirror = this.root_module.data.mirror;

    const signals_list = [];
    const { objects } = this.last_mirror;

    for (const [id, object] of Object.entries(objects)) {
      for (const signal_id of signals_list) {
        try {
          let signal_data = null;
          eval(`signal_data = object.${signal}`);
          const root = this.root_map[id];
          root.signals_event_emitter.emit(signal_id, signal_data);
        } catch (e) {}
      }
    }
  }

  process_return_value({ script_id, query_id, value }) {
    for (const root of Object.values(this.root_map))
      root.return_data.insert({ script_id, query_id, value });
  }

  _check_ready() {
    if (
      this.root_module.managers.am_data.is_loaded() &&
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

module.exports = AM_Root;
