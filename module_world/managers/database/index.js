const path = require("path");
const { Database, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const log = require(path.join(
  global.node_modules_path,
  "simple-node-logger"
)).createSimpleLogger();
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
    this.models = {
      land: new Models.Land(),
      character: new Models.Character(),
      environment_object: new Models.EnvironmentObject(),
      settings: new Models.Settings(),
      virtual_world: new Models.VirtualWorld()
    };
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
        log.info("Server is running...");
      },
      on_error: () => {
        on_terminate();
      },
      manager: this
    });
  }

  terminate() {
    save_data({
      step: "connect",
      on_success: () => {
        setTimeout(() => {
          try {
            this.module_world.managers.database.close();
          } catch (e) {
            console.error(e);
          }
        }, 1000);
      },
      on_error: () => {
        setTimeout(() => {
          try {
            this.module_world.managers.database.close();
          } catch (e) {
            console.error(e);
          }
        }, 1000);
      },
      manager: this
    });
  }

  poll() {
    if (!this.ready) return;

    if (this.stopwatches_map.database_save.is_elapsed()) {
      // TODO
      // log.info("Auto save to database");
      // this.save_data();
      this.stopwatches_map.database_save.reset();
    }
  }

  close() {
    this.database.close();
  }
}

module.exports = DatabaseManager;
