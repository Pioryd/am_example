const Objects = require("../objects");
const { Database, Stopwatch } = require("am_framework");
const Models = require("../../../models");
const log = require("simple-node-logger").createSimpleLogger();

/*
Responsible for:
  - deal with database
    - load/save/backup/restore_backup
*/
class DatabaseManager {
  constructor(module_world) {
    this.module_world = module_world;
    this.config = this.module_world.application.config.data;

    this.database = new Database({
      url: this.config.module_world.database.url,
      name: this.config.module_world.database.name,
      setup_models: this.setup_models
    });
    this.ready = false;
    this.stopwatches_map = { database_save: new Stopwatch(5 * 1000) };
  }

  initialize() {
    this.load_data({
      step: "connect",
      on_success: () => {
        if (this.module_world.data.settings.generated === false)
          this.module_world.managers.main_world.generate_world();
        this.ready = true;
        log.info("Server is running...");
      },
      on_error: () => {
        on_close();
      }
    });
  }

  terminate() {
    this.save_data({
      on_success: () => {
        setTimeout(() => {
          this.managers.database.close();
        }, 1000);
      },
      on_error: () => {
        setTimeout(() => {
          this.managers.database.close();
        }, 1000);
      }
    });
  }

  poll() {
    if (!this.ready) return;

    if (this.stopwatches_map.database_save.is_elapsed()) {
      // change to backup_db
      // log.info("Auto save to database");
      // this.save_data();
      this.stopwatches_map.database_save.reset();
    }
  }

  setup_models(connection) {
    Models.Settings.setup(connection);
    Models.Character.setup(connection);
    Models.Land.setup(connection);
    Models.EnvironmentObject.setup(connection);
  }

  close() {
    this.database.close();
  }
  /* 
    Save data is NOT safe, because data can be changed while function 
    is working.  
  */
  save_data({
    step = "connect",
    error = null,
    results = [],
    on_success = () => {},
    on_error = () => {}
  }) {
    log.info("Save data to database, step:", step);

    if (error != null) {
      console.error(error);
      on_error();
      return;
    }

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          this.save_data({
            step: "connected",
            on_success: on_success,
            on_error: on_error
          });
        });
        break;
      case "connected":
        Models.Settings.save(this.module_world.data.settings, (...args) => {
          this.save_data(
            Object.assign(...args, {
              on_success: on_success,
              on_error: on_error
            })
          );
        });
        break;
      case "settings.save":
        Models.Character.save(
          Object.values(this.module_world.data.characters_map),
          (...args) => {
            console.log();
            this.save_data(
              Object.assign(...args, {
                on_success: on_success,
                on_error: on_error
              })
            );
          }
        );
        break;
      case "character.save":
        Models.Land.save(
          Object.values(this.module_world.data.lands_map),
          (...args) => {
            this.save_data(
              Object.assign(...args, {
                on_success: on_success,
                on_error: on_error
              })
            );
          }
        );
        break;
      case "land.save":
        Models.EnvironmentObject.save(
          Object.values(this.module_world.data.environment_objects_map),
          (...args) => {
            this.save_data(
              Object.assign(...args, {
                on_success: on_success,
                on_error: on_error
              })
            );
          }
        );
        break;
      case "environment_object.save":
        on_success();
        break;
    }
  }

  load_data({
    step = "connect",
    error = null,
    results = [],
    on_success = () => {},
    on_error = () => {}
  }) {
    const set_settings = results_list => {
      if (results_list.length <= 0) return;
      this.module_world.data.settings = results_list[0]._doc;
      delete this.module_world.data.settings._id;
      delete this.module_world.data.settings.__v;
    };

    const set_characters = results_list => {
      for (const result of results_list) {
        const character = new Objects.Character({ ...result._doc });
        delete character._data._id;
        delete character._data.__v;

        this.module_world.data.characters_map[character.get_name()] = character;
      }
    };

    const set_lands = results_list => {
      for (const result of results_list) {
        const land = new Objects.Land({ ...result._doc }, this.module_world);
        delete land._id;
        delete land.__v;

        this.module_world.data.lands_map[land.get_id()] = land;
      }
    };

    const set_environment_objects = results_list => {
      for (const result of results_list) {
        const environment_object = new Objects.EnvironmentObject({
          ...result._doc
        });
        delete environment_object._id;
        delete environment_object.__v;

        this.module_world.data.environment_objects_map[
          environment_object.get_id()
        ] = environment_object;
      }
    };

    const check_collections = collections => {
      const collections_names = [
        "settings",
        "character",
        "land",
        "environment_object"
      ];

      for (const collection_name of collections_names) {
        let found = false;
        for (const collection of collections) {
          if (collection_name === collection.name) {
            found = true;
            break;
          }
        }

        if (!found) {
          log.info(
            "Database does not include needed collections. Existed:",
            collections
          );

          this.load_data({
            step: "check_loaded_data",
            on_success: on_success,
            on_error: on_error
          });

          return;
        }
      }

      this.load_data({
        step: "connected",
        on_success: on_success,
        on_error: on_error
      });
    };

    const check_loaded_data = () => {
      if (this.module_world.data.settings.generated === false) return;

      this.ready =
        this.module_world.data.settings.generated === true &&
        Object.keys(this.module_world.data.lands_map).length > 0 &&
        Object.keys(this.module_world.data.characters_map).length > 0;

      log.info(`Data is ${this.ready ? "" : "NOT"} loaded correctly.`);
    };

    log.info("Load data from database, step:", step);

    if (!Array.isArray(results)) results = results == null ? [] : [results];

    if (error != null) {
      log.info("load_data error:", error);
      on_error();
      return;
    }

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          check_collections(collections);
        });
        break;
      case "connected":
        Models.Settings.load((...args) => {
          this.load_data(
            Object.assign(...args, {
              on_success: on_success,
              on_error: on_error
            })
          );
        });
        break;
      case "settings.load":
        set_settings(results);
        Models.Character.load_all((...args) => {
          this.load_data(
            Object.assign(...args, {
              on_success: on_success,
              on_error: on_error
            })
          );
        });
        break;
      case "character.load_all":
        set_characters(results);
        Models.Land.load_all((...args) => {
          this.load_data(
            Object.assign(...args, {
              on_success: on_success,
              on_error: on_error
            })
          );
        });
        break;
      case "land.load_all":
        set_lands(results);
        Models.EnvironmentObject.load_all((...args) => {
          this.load_data(
            Object.assign(...args, {
              on_success: on_success,
              on_error: on_error
            })
          );
        });
        break;
      case "environment_object.load_all":
        set_environment_objects(results);
        this.load_data({
          step: "check_loaded_data",
          on_success: on_success,
          on_error: on_error
        });
        break;
      case "check_loaded_data":
        // these must be as last functions
        check_loaded_data();
        on_success();
        break;
      default:
        break;
    }
  }
}

module.exports = DatabaseManager;
