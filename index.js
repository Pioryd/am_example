const logger = require("am_framework").create_logger({
  module_name: "module_animal",
  file_name: __filename
});
const { Application } = require("am_framework");

const config_file_rel_name = "config.json";
const scripts_folder_rel_name = "scripts";

function main() {
  const application = new Application({
    root_full_name: String(__dirname),
    config_file_rel_name,
    scripts_folder_rel_name,
    command_map: {}
  });

  application.run();
}

try {
  main();
} catch (e) {
  logger.error(e.stack);
}
