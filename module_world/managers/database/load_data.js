const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const Objects = require("../../objects");
const AM = require("../../am");
const { repair_data } = require("./repair_data");

const db_objects_map = {
  settings: {
    model_load_fn: "load",
    collection_key: null,
    data: "settings",
    object_class: null,
    manager: null
  },
  character: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "characters_map",
    object_class: Objects.Character,
    manager: null
  },
  land: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "lands_map",
    object_class: Objects.Land,
    manager: "module_world"
  },
  environment_object: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "environment_objects_map",
    object_class: Objects.EnvironmentObject,
    manager: null
  },
  virtual_world: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "virtual_worlds_map",
    object_class: Objects.VirtualWorld,
    manager: "virtual_worlds"
  },
  am_form: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "am_forms_map",
    object_class: AM.Form,
    manager: "am"
  },
  am_program: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "am_programs_map",
    object_class: AM.Program,
    manager: "am"
  },
  am_script: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "am_scripts_map",
    object_class: AM.Script,
    manager: "am"
  },
  am_system: {
    model_load_fn: "load_all",
    collection_key: "id",
    data: "am_systems_map",
    object_class: AM.System,
    manager: "am"
  }
};

const load_data = ({
  step = "connect",
  error = null,
  results = [],
  on_success = () => {},
  on_error = () => {},
  manager
}) => {
  const check_collections = collections => {
    for (const collection_name of Object.keys(db_objects_map)) {
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

  const load_db_object = last_step => {
    const load_object = (results_list, db_object) => {
      const model_load_fn_list = {
        load: () => {
          if (results_list.length <= 0) return;

          if (db_object.object_class == null) {
            db_object.data = { ...results_list[0]._doc };
          } else if (db_object.manager != null) {
            db_object.data = new db_object.object_class(
              {
                ...results_list[0]._doc
              },
              manager.module_world.managers[db_object.manager]
            );
          } else {
            db_object.data = new db_object.object_class({
              ...results_list[0]._doc
            });
          }

          delete db_object._id;
          delete db_object.__v;
        },
        load_all: () => {
          for (const result of results_list) {
            let new_object = {};
            if (db_object.object_class == null) {
              new_object = { ...result._doc };
            } else if (db_object.manager != null) {
              new_object = new db_object.object_class(
                { ...result._doc },
                manager.module_world.managers[db_object.manager]
              );
            } else {
              new_object = new db_object.object_class({ ...result._doc });
            }

            delete new_object._data._id;
            delete new_object._data.__v;

            db_object.data[result._doc[db_object.collection_key]] = new_object;
          }
        }
      };

      model_load_fn_list[db_object.model_load_fn]();
    };

    let db_object = null;
    let collection_name = null;
    let next_db_object = null;
    let next_collection_name = null;

    if (Object.keys(db_objects_map).length === 0) {
      db_object = null;
    } else if (last_step === "") {
      collection_name = Object.keys(db_objects_map)[0];
      db_object = Object.values(db_objects_map)[0];
    } else {
      collection_name = last_step.split(".")[0];
      db_object = db_objects_map[collection_name];
    }

    const keys = Object.keys(db_objects_map);
    if (keys.indexOf(collection_name) < keys.length - 1) {
      next_collection_name = keys.indexOf(collection_name) + 1;
      next_db_object = db_objects_map[next_collection_name];
    }

    if (db_object != null) load_object(results, db_object);

    if (next_db_object != null) {
      manager.models[next_collection_name][next_db_object.model_load_fn](
        (...args) => {
          load_data(
            Object.assign(...args, {
              on_success,
              on_error,
              manager
            })
          );
        }
      );
    } else {
      load_data({
        step: "check_loaded_data",
        on_success,
        on_error,
        manager
      });
    }
  };

  if (!Array.isArray(results)) results = results == null ? [] : [results];

  if (error != null) {
    logger.info("load_data error:", error);
    on_error();
    return;
  }

  if (step === "connect") {
    manager.database.connect(collections => {
      check_collections(collections);
    });
  } else if (step === "connected") {
    load_db_object("");
  } else if (step === "check_loaded_data") {
    check_loaded_data();
    on_success();
    logger.info("Load data from database finished.");
  } else {
    load_db_object(step);
  }
};

module.exports = { load_data };
