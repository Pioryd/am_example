const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

const repair_data = ({ manager }) => {
  logger.log("Repair data...");

  manager.module_world.data.settings.corrupted = false;
};

module.exports = { repair_data };
