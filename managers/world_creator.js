const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

class WorldCreator {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = config;

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
    this._load_async();
    if (!this.__is_loaded() || this.created) return;

    this._check_objects_locations();
    this.created = true;
    logger.info("World creator: created.");
  }

  _load_async() {
    const { managers } = this.root_module;

    if (
      this.__is_loaded() ||
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

  _check_objects_locations() {
    for (const object of Object.values(this.root_module.data.world.objects)) {
      if (object.area === "") continue;
      const area = this.root_module.data.world[object.area];
      if (area == null || !area.properties.includes("area")) object.area = "";
    }
  }

  __is_loaded() {
    for (const data_info of Object.values(this.data_to_load))
      if (!data_info.loaded) return false;
    return true;
  }
}

module.exports = WorldCreator;
