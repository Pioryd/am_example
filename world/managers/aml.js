const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const DEFAULT_CONFIG = {
  debug: false
};

class AML {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.aml_map = {};
  }

  initialize() {}

  terminate() {}

  poll() {}

  register(objects_to_register, connection_id) {
    const throw_if = {
      not_found: (object) => {
        if (object == null)
          throw new Error(`Object[${JSON.stringify(object)}] not found`);
      },
      is_taken: (object) => {
        const aml_id = this._get_aml_id_by_object_id(object.id);
        if (aml_id != null)
          throw new Error(
            `Object[${JSON.stringify(
              object
            )}] is connected to another AML[${aml_id}]`
          );
      }
    };

    if (objects_to_register == null) return;
    if (connection_id in this.aml_map)
      throw new Error(`AML with id[${connection_id}] is already registered.`);

    const objects_list = [];
    if (
      "included" in objects_to_register &&
      objects_to_register.included.length > 0
    ) {
      for (const id of objects_to_register.included) {
        const object = this.root_module.data.world.objects[id];
        try {
          throw_if.not_found(object);
          throw_if.is_taken(object);
          objects_list.push(id);
        } catch (e) {
          if (this.config.debug) logger.debug(e, e.stack);
        }
      }
    } else if (
      "excluded" in objects_to_register &&
      objects_to_register.excluded.length > 0
    ) {
      for (const [id, object] of Object.entries(
        this.root_module.data.world.objects
      )) {
        if (objects_to_register.excluded.includes(id)) continue;
        try {
          throw_if.is_taken(object);
          objects_list.push(id);
        } catch (e) {
          if (this.config.debug) logger.debug(e, e.stack);
        }
      }
    } else {
      for (const [id, object] of Object.entries(
        this.root_module.data.world.objects
      )) {
        try {
          throw_if.is_taken(object);
          objects_list.push(id);
        } catch (e) {
          if (this.config.debug) logger.debug(e, e.stack);
        }
      }
    }

    this.aml_map[connection_id] = objects_list;
    return objects_list;
  }

  unregister(aml_id) {
    delete this.aml_map[aml_id];
  }

  get_connection_id_object_id(object_id) {
    return this._get_aml_id_by_object_id(object_id);
  }

  _get_aml_id_by_object_id(id) {
    for (const [connection_id, objects_list] of Object.entries(this.aml_map))
      if (objects_list.includes(id)) return connection_id;
  }
}

module.exports = AML;
