const path = require("path");
const log = require(path.join(
  global.node_modules_path,
  "simple-node-logger"
)).createSimpleLogger();

const save_data = ({
  step = "connect",
  error = null,
  results = [],
  on_success = () => {},
  on_error = () => {},
  manager
}) => {
  const recurrency_callback = (...args) => {
    save_data(
      Object.assign(...args, {
        on_success,
        on_error,
        manager
      })
    );
  };

  log.info("Save data to database, step:", step);

  if (error != null) {
    console.error(error);
    on_error();
    return;
  }

  switch (step) {
    case "connect":
      manager.database.connect(() => {
        save_data({
          step: "connected",
          on_success,
          on_error,
          manager
        });
      });
      break;
    case "connected":
      manager.models.settings.save(
        manager.module_world.data.settings,
        recurrency_callback
      );
      break;
    case "settings.save":
      manager.models.character.save(
        Object.values(manager.module_world.data.characters_map),
        recurrency_callback
      );
      break;
    case "character.save":
      manager.models.land.save(
        Object.values(manager.module_world.data.lands_map),
        recurrency_callback
      );
      break;
    case "land.save":
      manager.models.environment_object.save(
        Object.values(manager.module_world.data.environment_objects_map),
        recurrency_callback
      );
      break;
    case "environment_object.save":
      on_success();
      break;
  }
};

module.exports = { save_data };
