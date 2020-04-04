const { Application, create_logger } = require("am_framework");

const logger = create_logger({
  module_name: "am_app_world",
  file_name: __filename
});

function main() {
  const application = new Application({
    root_full_name: String(__dirname)
  });

  application.run();
}

try {
  main();
} catch (e) {
  logger.error(e, e.stack);
}
