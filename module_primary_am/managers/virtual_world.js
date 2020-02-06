const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_bot", file_name: __filename });

/*
Responsible for:
*/
class VirtualWorld {
  constructor(module_bot) {
    this.module_bot = module_bot;
  }

  // Only for testing needs
  // In the future in AM virtual worlds will send AI of each virtual world
}

module.exports = VirtualWorld;
