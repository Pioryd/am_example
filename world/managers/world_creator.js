const path = require("path");
const fs = require("fs");
const { create_logger, Util } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const DEFAULT_CONFIG = {
  force_create: false,
  api_folder: "api",
  events_folder: "api"
};

class WorldCreator {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.created = false;
    this.loading = false;

    this.data_to_load = {
      type: { data_name: "types", loaded: false },
      object: { data_name: "objects", loaded: false }
    };
  }

  initialize() {}

  terminate() {}

  poll() {
    if (!this.created) this._create();
  }

  _create() {
    this.__load_api();
    this.__load_events();
    this.__load_async();
    if (!this._is_loaded() || this.created) return;

    this.__create_objects_from_types();
    this.__check_objects_locations();
    this.__run_events();
    this.created = true;
    logger.info("World creator: created.");
  }

  _is_loaded() {
    for (const data_info of Object.values(this.data_to_load))
      if (!data_info.loaded) return false;
    return true;
  }

  __load_api() {
    this.root_module.data.api = {};

    const folder_full_name = path.join(
      this.root_module.application.root_full_name,
      this.config.api_folder
    );

    if (folder_full_name != null && fs.existsSync(folder_full_name)) {
      for (const file of Util.get_files(folder_full_name)) {
        const file_name_without_extension = file
          .split(".")
          .slice(0, -1)
          .join(".");
        this.root_module.data.api[
          file_name_without_extension
        ] = require(path.join(folder_full_name, file));
      }
    }
  }

  __load_events() {
    this.root_module.data.events = {};

    const folder_full_name = path.join(
      this.root_module.application.root_full_name,
      this.config.events_folder
    );

    if (folder_full_name != null && fs.existsSync(folder_full_name)) {
      for (const file of Util.get_files(folder_full_name)) {
        const file_name_without_extension = file
          .split(".")
          .slice(0, -1)
          .join(".");
        this.root_module.data.events[
          file_name_without_extension
        ] = require(path.join(folder_full_name, file));
      }
    }
  }

  __load_async() {
    const { managers } = this.root_module;

    if (
      this._is_loaded() ||
      this.loading === true ||
      !managers.editor.is_connected() ||
      !managers.backup.restored
    )
      return;

    this.loading = true;

    if ("world" in this.root_module.data && !this.config.force_create) {
      this.created = true;
      return;
    }

    this.root_module.data["world"] = {};

    for (const [data_name, data_info] of Object.entries(this.data_to_load)) {
      this.root_module.data.world[data_info.data_name] = {};

      managers.editor.get_data(data_name, (objects_list, message) => {
        if (objects_list == null) return;
        for (const object of objects_list)
          this.root_module.data.world[data_info.data_name][object.id] = object;
        this.data_to_load[data_name].loaded = true;
      });
    }
  }

  __run_events() {
    for (const [namespace, events_map] of Object.entries(
      this.root_module.data.events
    )) {
      for (const [name, event] of Object.entries(events_map)) {
        this.root_module.data.events[namespace][name].data = {};
        if (event.interval === 0) event.fn(this.root_module);
        else setInterval(() => event.fn(this.root_module), event.interval);
      }
    }
  }

  __create_objects_from_types() {
    const merge_with_type = (object, type_id) => {
      if (type_id === "") return object;
      const type = this.root_module.data.world.types[type_id];
      object = _.merge(
        { data: type.data, properties: type.properties },
        object
      );
      return JSON.parse(JSON.stringify(merge_with_type(object, type.extends)));
    };

    const world_objects = this.root_module.data.world.objects;
    for (const [id, object] of Object.entries(world_objects))
      world_objects[id] = merge_with_type(object, object.type);
  }

  __check_objects_locations() {
    for (const object of Object.values(this.root_module.data.world.objects)) {
      if (object.area === "") continue;
      const area_object = this.root_module.data.world.objects[object.area];
      if (area_object == null || !area_object.properties.includes("area"))
        object.area = "";
    }
  }
}

module.exports = WorldCreator;
