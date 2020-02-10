const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_animal", file_name: __filename });

/*
Responsible for:
*/
class VirtualWorld {
  constructor(module_animal) {
    this.module_animal = module_animal;
  }

  // Only for testing needs
  // In the future in AM virtual worlds will send AI of each virtual world
}

module.exports = VirtualWorld;
