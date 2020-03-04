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
  const recurrency_callback = (...args) => {
    save_data(
      Object.assign(...args, {
        on_success,
        on_error,
        manager
      })
    );
  };

  if (error != null) {
    logger.error(error);
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
        manager.module_world.data.characters_map,
        recurrency_callback
      );
      break;
    case "character.save":
      manager.models.land.save(
        manager.module_world.data.lands_map,
        recurrency_callback
      );
      break;
    case "land.save":
      manager.models.environment_object.save(
        manager.module_world.data.environment_objects_map,
        recurrency_callback
      );
      break;
    case "environment_object.save":
      manager.models.virtual_world.save(
        manager.module_world.data.virtual_worlds_map,
        recurrency_callback
      );
      break;
    case "virtual_world.save":
      manager.models.am_form.save(
        manager.module_world.data.am_forms_map,
        recurrency_callback
      );
      break;
    case "am_form.save":
      manager.models.am_program.save(
        manager.module_world.data.am_programs_map,
        recurrency_callback
      );
      break;
    case "am_program.save":
      manager.models.am_script.save(
        manager.module_world.data.am_scripts_map,
        recurrency_callback
      );
      break;
    case "am_script.save":
      manager.models.am_system.save(
        manager.module_world.data.am_systems_map,
        recurrency_callback
      );
      break;
    case "virtual_world.save":
      manager.models.am_form.save(
        manager.module_world.data.am_form_map,
        recurrency_callback
      );
      break;
    case "am_form.save":
      on_success();
      break;
  }
};

module.exports = { save_data };
