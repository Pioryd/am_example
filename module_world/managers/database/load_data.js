const path = require("path");
const log = require(path.join(
  global.node_modules_path,
  "simple-node-logger"
)).createSimpleLogger();
const Objects = require("../../objects");

const load_data = ({
  step = "connect",
  error = null,
  results = [],
  on_success = () => {},
  on_error = () => {},
  manager
}) => {
  const set_settings = results_list => {
    if (results_list.length <= 0) return;
    manager.module_world.data.settings = results_list[0]._doc;
    delete manager.module_world.data.settings._id;
    delete manager.module_world.data.settings.__v;
  };

  const set_characters = results_list => {
    for (const result of results_list) {
      const character = new Objects.Character({ ...result._doc });
      delete character._data._id;
      delete character._data.__v;

      manager.module_world.data.characters_map[
        character.get_name()
      ] = character;
    }
  };

  const set_lands = results_list => {
    for (const result of results_list) {
      const land = new Objects.Land({ ...result._doc }, manager.module_world);
      delete land._id;
      delete land.__v;

      manager.module_world.data.lands_map[land.get_id()] = land;
    }
  };

  const set_environment_objects = results_list => {
    for (const result of results_list) {
      const environment_object = new Objects.EnvironmentObject({
        ...result._doc
      });
      delete environment_object._id;
      delete environment_object.__v;

      manager.module_world.data.environment_objects_map[
        environment_object.get_id()
      ] = environment_object;
    }
  };

  const set_virtual_worlds = results_list => {
    for (const result of results_list) {
      const virtual_world = new Objects.VirtualWorld({
        ...result._doc
      });
      delete virtual_world._id;
      delete virtual_world.__v;

      manager.module_world.data.virtual_worlds_map[
        virtual_world.get_id()
      ] = virtual_world;
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

        load_data({
          step: "check_loaded_data",
          on_success,
          on_error,
          manager
        });

        return;
      }
    }

    load_data({
      step: "connected",
      on_success,
      on_error,
      manager
    });
  };

  const check_loaded_data = () => {
    if (manager.module_world.data.settings.generated === false) return;

    manager.ready =
      manager.module_world.data.settings.generated === true &&
      Object.keys(manager.module_world.data.lands_map).length > 0 &&
      Object.keys(manager.module_world.data.characters_map).length > 0;

    log.info(`Data is ${manager.ready ? "" : "NOT"} loaded correctly.`);
  };

  const recurrency_callback = (...args) => {
    load_data(
      Object.assign(...args, {
        on_success,
        on_error,
        manager
      })
    );
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
      manager.database.connect(collections => {
        check_collections(collections);
      });
      break;
    case "connected":
      manager.models.settings.load(recurrency_callback);
      break;
    case "settings.load":
      set_settings(results);
      manager.models.character.load_all(recurrency_callback);
      break;
    case "character.load_all":
      set_characters(results);
      manager.models.land.load_all(recurrency_callback);
      break;
    case "land.load_all":
      set_lands(results);
      manager.models.environment_object.load_all(recurrency_callback);
      break;
    case "environment_object.load_all":
      set_environment_objects(results);
      manager.models.virtual_world.load_all(recurrency_callback);
      break;
    case "virtual_world.load_all":
      set_virtual_worlds(results);
      load_data({
        step: "check_loaded_data",
        on_success,
        on_error,
        manager
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
};

module.exports = { load_data };
