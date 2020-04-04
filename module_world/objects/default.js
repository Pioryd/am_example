const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

class Default {
  constructor(data) {
    this._data = data;
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }
}

module.exports = { Default };
