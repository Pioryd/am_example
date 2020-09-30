const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));
const Creator = require("./creator");

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename,
  world_module: "world"
});

const DEFAULT_CONFIG = {
  force_create: false
};

class World {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this._creator = new Creator(this.root_module, this.config);
  }

  initialize() {}

  terminate() {}

  poll() {
    if (!this._creator.created) this._creator.create();
  }

  get_object_property(object_id, name) {
    return this.root_module.data.world.objects[object_id].properties[name];
  }

  process_api(object_id, api, data) {
    this.root_module.data.api[api](this.root_module, object_id, data);
    this._add_action(object_id, api, data);
  }

  _add_action(object_id, api, data) {
    const { area } = this.root_module.data.world.objects[object_id];
    const time = new Date().toUTCString();
    const { actions } = this.root_module.data.world;
    actions.push({ time, area, object_id, api, data });
  }
}

module.exports = World;
