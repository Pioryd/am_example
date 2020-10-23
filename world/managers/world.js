const path = require("path");
const { create_logger, Action } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename,
  world_module: "world"
});

const DEFAULT_CONFIG = {
  force_create: false
};

const API = {
  foo(world, { object_id, key, value }) {
    const { data } = world.root_module;
    const object = data.world.objects[object_id];
    object.data[key] = value;
  }
};

class World {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.root_action = new Action();

    this.created = false;
    this.loading = false;

    this.api = API;

    this.data_to_load = {
      objects: { collection: "object", loaded: false }
    };
  }

  initialize() {
    const try_create = () => {
      if (!this.created) {
        this._create();
        setTimeout(() => try_create(), 100);
      }
    };

    try_create();
  }

  terminate() {}

  poll() {}

  _create() {
    this.__load_db_async();

    if (!this._is_loaded() || this.created) return;

    this.__create_objects();
    this.created = true;
    logger.info("World created.");
  }

  __load_db_async() {
    const { managers } = this.root_module;

    if (
      this._is_loaded() ||
      this.loading === true ||
      !managers.core_editor.is_connected() ||
      !managers.core_backup.restored
    )
      return;

    this.loading = true;

    if ("world" in this.root_module.data && !this.config.force_create) {
      this.created = true;
      return;
    }
    this.root_module.data.world = {};

    for (const [data_name, data_info] of Object.entries(this.data_to_load)) {
      this.root_module.data.world[data_name] = {};

      managers.core_editor.get_data(
        data_info.collection,
        (objects_list, message) => {
          if (objects_list == null) return;
          for (const object of objects_list)
            this.root_module.data.world[data_name][object.id] = object;
          this.data_to_load[data_name].loaded = true;
        }
      );
    }
  }

  _is_loaded() {
    for (const data_info of Object.values(this.data_to_load))
      if (!data_info.loaded) return false;
    return true;
  }

  __create_objects() {
    for (const [id, object] of Object.entries(
      this.root_module.data.world.objects
    ))
      if (
        object.data != null &&
        object.data.aml != null &&
        object.data.aml.modules != null
      ) {
        this.root_module.managers.core_ai.add_object(
          id,
          Object.keys(object.data.aml.modules)
        );
      } else {
        this.root_module.managers.core_ai.add_object(id, null);
      }
  }
}

module.exports = World;
