const path = require("path");
const { Managers } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const { db_objects_map } = require("./db_objects_map");
const Objects = require("../../objects");

class DatabaseWorldManager extends Managers.DatabaseStatic {
  constructor({ root_module, config }) {
    super({
      root_module,
      config,
      db_objects_map,
      initialize_on_success: () => {
        if (root_module.data.settings.generated !== true)
          root_module.managers.main_world.generate_world();
      },
      objects_classes: Objects
    });
  }
}

module.exports = DatabaseWorldManager;
