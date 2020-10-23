const path = require("path");
const { AML, create_logger, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_aml",
  file_name: __filename
});

const DEFAULT_CONFIG = { process_delay: 0, process_debug: false };

/**
 * [objects_to_register] is sent  to server, by manager [world_client] as packet
 * "accept_connection".
 * Server return packet "accept_connection" with [registered_objects].
 */
class Roots {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.root_map = {};
    this.registered_objects = {};

    this.stopwatch_process_delay = new Stopwatch(this.config.process_delay);
  }

  initialize() {}

  terminate() {
    for (const root of Object.values(this.root_map)) root.terminate();
    this.root_map = {};
  }

  poll() {
    if (this.root_map == null) return;

    if (this.stopwatch_process_delay.is_elapsed()) {
      for (const root of Object.values(this.root_map)) root.process();

      this.stopwatch_process_delay.reset();
    }
  }

  process_return_data(object_id, data) {
    if (this.root_map[object_id] != null)
      this.root_map[object_id].parse_return_data(data);
  }

  set_registered_objects(registered_objects) {
    this.registered_objects = registered_objects;
  }

  update_objects_data(objects_data) {
    if (objects_data == null) return;

    for (const object_id of this.registered_objects) {
      if (objects_data[object_id] == null)
        throw new Error(`Not found object id[${object_id}] in mirror`);

      if (this.root_map[object_id] == null) {
        const root = new AML.Root(
          (data) => {
            this.root_module.managers.world_client.send("process_api", {
              object_id,
              ...data
            });
          },
          (...args) => this._get_aml_source_async(...args)
        );

        root.options.debug_enabled = this.config.process_debug;

        this.root_map[object_id] = root;
      }
      this.root_map[object_id].update_mirror({
        ...objects_data[object_id]
      });
    }
  }

  /**
   * Return first found source that matching the pattern .
   */
  _get_aml_source_async({ type, id, name }, callback) {
    this.root_module.managers.core_editor.get_data(
      `am_${type}`,
      (objects_list, message) => {
        try {
          if (objects_list == null || objects_list.length === 0) return;

          for (const object of objects_list) {
            let source =
              type !== "script"
                ? object
                : AML.script_to_json(object.id, object.source);

            if (Array.isArray(id)) {
              if (id.includes(object.id) && source.name === name) {
                callback(source);
                return;
              }
            } else {
              if (object.id === id && (name == null || source.name === name)) {
                callback(source);
                return;
              }
            }
          }
        } catch (e) {
          logger.error(`Unable to get data [am_${type}]. \n${e}\n${e.stack}`);
        }
      }
    );
  }
}

module.exports = Roots;
