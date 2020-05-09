const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const ObjectID = require(path.join(global.node_modules_path, "bson-objectid"));

// const { objects_list, types_list } = require("../module_world/tmp_data");

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

class DataLoader {
  constructor(root_module) {
    this.root_module = root_module;
  }

  initialize() {
    // _load();
  }

  terminate() {}

  poll() {}

  _load() {
    const { data } = this.root_module;
    data.objects_list = objects_list;
    data.types_list = types_list;
  }
}

module.exports = DataLoader;
