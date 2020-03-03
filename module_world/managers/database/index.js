const path = require("path");
const { Database, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const Models = require("./models");
const { load_data } = require("./load_data");
const { save_data } = require("./save_data");
/*
Responsible for:
  - deal with database
    - load/save/backup/restore_backup
*/
class DatabaseManager {
  constructor(module_world) {
    this.module_world = module_world;
    this.config = this.module_world.config;
    this.models = Models;
    this.ready = false;
    this.stopwatches_map = { database_save: new Stopwatch(5 * 1000) };
    this.database = new Database({
      url: this.config.module_world.database.url,
      name: this.config.module_world.database.name,
      models: this.models
    });
  }

  initialize() {
    load_data({
      step: "connect",
      on_success: () => {
        if (this.module_world.data.settings.generated === false)
          this.module_world.managers.main_world.generate_world();
        this.ready = true;
        logger.info("Server is running...");
      },
      on_error: () => {
        on_terminate();
      },
      manager: this
    });
  }

  terminate() {
    const close_database = () => {
      setTimeout(() => {
        try {
          this.module_world.managers.database.close();
        } catch (e) {
          logger.error(e, e.stack);
        }
      }, 1000);
    };
    const save_as_not_backup = () => {
      this.module_world.data.settings.backup = false;
      this.models.settings.save(
        this.module_world.data.settings,
        close_database
      );
    };

    save_data({
      step: "connect",
      on_success: save_as_not_backup,
      manager: this
    });
  }

  poll() {
    if (!this.ready) return;

    if (this.stopwatches_map.database_save.is_elapsed()) {
      //logger.info("Auto save to database");

      this.module_world.data.settings.backup = true;
      save_data({ step: "connect", manager: this });

      this.stopwatches_map.database_save.reset();
    }
  }

  close() {
    this.database.close();
  }

  save_backup_state(state) {
    this.database.connect(() => {});
  }
}

module.exports = DatabaseManager;
