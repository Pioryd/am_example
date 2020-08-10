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

const DEFAULT_CONFIG = { debug: false };
class MAM_Register {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.mam_map = {};
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
      cannot_be_am: (object) => {
        if (!object.properties.includes("am"))
          throw new Error(`Object[${JSON.stringify(object)}] cannot be AM`);
      },
      is_taken: (object) => {
        const mam_id = this._get_mam_id_by_object_id(object.id);
        if (mam_id != null)
          throw new Error(
            `Object[${JSON.stringify(
              object
            )}] is connected to another MAM[${mam_id}]`
          );
      }
    };

    if (objects_to_register == null) return;
    if (connection_id in this.mam_map)
      throw new Error(`Mam with id[${connection_id}] is already registered.`);

    const mam = { objects_list: [] };
    if (
      "included" in objects_to_register &&
      objects_to_register.included.length > 0
    ) {
      for (const id of objects_to_register.included) {
        const object = this.root_module.data.world.objects[id];
        try {
          throw_if.not_found(object);
          throw_if.cannot_be_am(object);
          throw_if.is_taken(object);
          mam.objects_list.push(id);
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
          throw_if.cannot_be_am(object);
          throw_if.is_taken(object);
          mam.objects_list.push(id);
        } catch (e) {
          if (this.config.debug) logger.debug(e, e.stack);
        }
      }
    } else {
      for (const [id, object] of Object.entries(
        this.root_module.data.world.objects
      )) {
        try {
          throw_if.cannot_be_am(object);
          throw_if.is_taken(object);
          mam.objects_list.push(id);
        } catch (e) {
          if (this.config.debug) logger.debug(e, e.stack);
        }
      }
    }

    this.mam_map[connection_id] = mam;

    return mam;
  }

  unregister(mam_id) {
    delete this.mam_map[mam_id];
  }

  get_connection_id_object_id(object_id) {
    return this._get_mam_id_by_object_id(object_id);
  }

  _get_mam_id_by_object_id(id) {
    for (const [connection_id, mam] of Object.entries(this.mam_map))
      if (mam.objects_list.includes(id)) return connection_id;
  }
}

module.exports = MAM_Register;
