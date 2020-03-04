const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

const save_data = ({
  step = "connect",
  error = null,
  results = [],
  on_success = () => {},
  on_error = () => {},
  manager
}) => {
  const save_db_object = last_step => {
    let db_object = null;
    let collection_name = null;
    let next_db_object = null;
    let next_collection_name = null;

    if (Object.keys(manager.db_objects_map).length === 0) {
      db_object = null;
    } else if (last_step === "") {
      collection_name = Object.keys(manager.db_objects_map)[0];
      db_object = Object.values(manager.db_objects_map)[0];
    } else {
      collection_name = last_step.split(".")[0];
      db_object = manager.db_objects_map[collection_name];
    }

    const keys = Object.keys(manager.db_objects_map);
    if (keys.indexOf(collection_name) < keys.length - 1) {
      next_collection_name = keys.indexOf(collection_name) + 1;
      next_db_object = manager.db_objects_map[next_collection_name];
    }

    if (next_db_object != null) {
      manager.db_objects[next_collection_name].model[
        next_db_object.model_save_fn
      ]((...args) => {
        save_data(
          Object.assign(...args, {
            on_success,
            on_error,
            manager
          })
        );
      });
    } else {
      save_data({
        step: "db_object_loaded",
        on_success,
        on_error,
        manager
      });
    }
  };

  if (error != null) {
    logger.error(error);
    on_error();
    return;
  }

  if (step === "connect") {
    manager.database.connect(() => {
      save_data({
        step: "connected",
        on_success,
        on_error,
        manager
      });
    });
  } else if (step === "connected") {
    save_db_object("");
  } else if (step === "db_object_loaded") {
    on_success();
  } else {
    save_db_object(step);
  }
};

module.exports = { save_data };
