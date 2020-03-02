const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const Objects = require("../../objects");
const AM = require("../../am");
const { repair_data } = require("./repair_data");

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

      manager.module_world.data.characters_map[character.get_id()] = character;
    }
  };

  const set_lands = results_list => {
    for (const result of results_list) {
      const land = new Objects.Land({ ...result._doc }, manager.module_world);
      delete land._data._id;
      delete land._data.__v;

      manager.module_world.data.lands_map[land.get_id()] = land;
    }
  };

  const set_environment_objects = results_list => {
    for (const result of results_list) {
      const environment_object = new Objects.EnvironmentObject({
        ...result._doc
      });
      delete environment_object._data._id;
      delete environment_object._data.__v;

      manager.module_world.data.environment_objects_map[
        environment_object.get_id()
      ] = environment_object;
    }
  };

  const set_virtual_worlds = results_list => {
    for (const result of results_list) {
      const virtual_world = new Objects.VirtualWorld(
        {
          ...result._doc
        },
        manager.module_world.managers.virtual_worlds
      );
      delete virtual_world._data._id;
      delete virtual_world._data.__v;

      manager.module_world.data.virtual_worlds_map[
        virtual_world.get_id()
      ] = virtual_world;
    }
  };

  const set_am_forms = results_list => {
    for (const result of results_list) {
      const am_form = new AM.Form(
        {
          ...result._doc
        },
        manager.module_world.managers.am
      );
      delete am_form._data._id;
      delete am_form._data.__v;

      manager.module_world.data.am_forms_map[am_form.get_id()] = am_form;
    }
  };

  const set_am_programs = results_list => {
    for (const result of results_list) {
      const am_program = new AM.Program(
        {
          ...result._doc
        },
        manager.module_world.managers.am
      );
      delete am_program._data._id;
      delete am_program._data.__v;

      manager.module_world.data.am_programs_map[
        am_program.get_id()
      ] = am_program;
    }
  };

  const set_am_scripts = results_list => {
    for (const result of results_list) {
      const am_script = new AM.Script(
        {
          ...result._doc
        },
        manager.module_world.managers.am
      );
      delete am_script._data._id;
      delete am_script._data.__v;

      manager.module_world.data.am_scripts_map[am_script.get_id()] = am_script;
    }
  };

  const set_am_systems = results_list => {
    for (const result of results_list) {
      const am_system = new AM.System(
        {
          ...result._doc
        },
        manager.module_world.managers.am
      );
      delete am_system._data._id;
      delete am_system._data.__v;

      manager.module_world.data.am_systems_map[am_system.get_id()] = am_system;
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
        logger.info(
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

    if (manager.module_world.data.settings.backup === true)
      repair_data({ manager });

    if (manager.module_world.data.settings.corrupted === true) return;

    manager.ready =
      manager.module_world.data.settings.generated === true &&
      Object.keys(manager.module_world.data.lands_map).length > 0 &&
      Object.keys(manager.module_world.data.characters_map).length > 0;

    logger.info(`Data is ${manager.ready ? "" : "NOT"} loaded correctly.`);
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

  if (!Array.isArray(results)) results = results == null ? [] : [results];

  if (error != null) {
    logger.info("load_data error:", error);
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
      manager.models.am_form.load_all(recurrency_callback);
      break;
    case "am_form.load_all":
      set_am_forms(results);
      manager.models.am_program.load_all(recurrency_callback);
      break;
    case "am_program.load_all":
      set_am_programs(results);
      manager.models.am_script.load_all(recurrency_callback);
      break;
    case "am_script.load_all":
      set_am_scripts(results);
      manager.models.am_system.load_all(recurrency_callback);
      break;
    case "am_system.load_all":
      set_am_systems(results);
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
      logger.info("Load data from database finished.");
      break;
    default:
      break;
  }
};

module.exports = { load_data };
