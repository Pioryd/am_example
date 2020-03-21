const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const { Validator, AML } = require(path.join(
  global.node_modules_path,
  "am_framework"
)).ScriptingSystem;
const ObjectID = require(path.join(global.node_modules_path, "bson-objectid"));

const Objects = require("../../objects");

const RULES = {
  form: {
    id: { type: "string", required: true, empty: false },
    name: { type: "string", required: true, empty: false },
    rules: {
      type: "array",
      required: true,
      object_type: "object",
      object_rules: {
        type: { type: "string", required: true, empty: false },
        triggers: {
          type: "array",
          required: true,
          object_type: "object",
          object_empty: false,
          object_rules: {}
        },
        actions: {
          type: "array",
          required: true,
          object_type: "object",
          object_empty: false,
          object_rules: {}
        }
      }
    },
    scripts: {
      type: "array",
      required: true,
      object_type: "string",
      object_empty: false
    }
  },
  program: {
    id: { type: "string", required: true, empty: false },
    name: { type: "string", required: true, empty: false },
    rules: {
      type: "array",
      required: true,
      object_type: "object",
      object_rules: {
        type: { type: "string", required: true, empty: false },
        triggers: {
          type: "array",
          required: true,
          object_type: "object",
          object_empty: false,
          object_rules: {}
        },
        actions: {
          type: "array",
          required: true,
          object_type: "object",
          object_empty: false,
          object_rules: {}
        }
      }
    },
    forms: {
      type: "array",
      required: true,
      object_type: "string",
      object_empty: false
    }
  },
  system: {
    id: { type: "string", required: true, empty: false },
    name: { type: "string", required: true, empty: false },
    programs: {
      type: "array",
      required: true,
      object_type: "string",
      object_empty: false
    }
  }
};
const validator_map = {
  form: new Validator(RULES.form),
  program: new Validator(RULES.program),
  system: new Validator(RULES.system)
};

/*
NOTE!
Classes instances like: [Character], [Land], etc use only as read only. 
To change any data of them use [managers] methods.
*/
function handle_error(connection, received_data, managers, message) {
  if (message != null) logger.error("Error:", message);
  logger.error(
    "Connection ID:",
    connection.get_id(),
    "Received_data:",
    received_data
  );

  managers.admin_server.send(connection.get_id(), "error", {
    connection_id: connection.get_id(),
    received_data: received_data,
    error: message != null ? message : ""
  });
}

module.exports = {
  accept_connection: (connection, received_data, managers) => {
    const login = received_data.login;
    const password = received_data.password;

    const config = managers.admin_server.config;
    if (
      login == null ||
      password == null ||
      config.module_world.admin_server.login.toLowerCase() !==
        login.toLowerCase() ||
      config.module_world.admin_server.password !== password.toLowerCase()
    ) {
      handle_error(
        connection,
        received_data,
        managers,
        `Unable to accept connection. Login[${login}] Password[${password}]`
      );
      return false;
    }

    connection.on_close = connection => {};
    managers.admin_server.send(connection.get_id(), "accept_connection", {
      user_name: login
    });
    return true;
  },
  module_data: (connection, received_data, managers) => {
    const lands_map = {};
    const characters_map = {};
    const environment_objects_map = {};
    const virtual_worlds_map = {};

    for (const land of Object.values(
      managers.admin_server.module_world.data.lands_map
    )) {
      lands_map[land.get_id()] = land._data;
    }

    for (const character of Object.values(
      managers.admin_server.module_world.data.characters_map
    )) {
      characters_map[character.get_id()] = character._data;
    }

    for (const environment_object of Object.values(
      managers.admin_server.module_world.data.environment_objects_map
    )) {
      environment_objects_map[environment_object.get_id()] =
        environment_object._data;
    }

    for (const virtual_world of Object.values(
      managers.admin_server.module_world.data.virtual_worlds_map
    )) {
      virtual_worlds_map[virtual_world.get_id()] = virtual_world._data;
    }

    managers.admin_server.send(connection.get_id(), "module_data", {
      lands_map,
      characters_map,
      environment_objects_map,
      virtual_worlds_map
    });
  },
  process_script: (connection, received_data, managers) => {
    const { script } = received_data;
    const command = "script";
    const commands_map =
      managers.admin_server.module_world.application._commands_map;

    if (!(command in commands_map)) {
      logger.error("Command does not exist:", command, "with args:", args);
      return false;
    }

    logger.log(
      `Executing command[${command}] with arg[${
        script.length >= 10 ? `${script.substr(0, 10)}...` : script
      }]`
    );
    commands_map[command](script);
  },
  scripts_list: (connection, received_data, managers) => {
    const app = managers.admin_server.module_world.application;

    const scripts_list = app.get_scripts_list();

    managers.admin_server.send(connection.get_id(), "scripts_list", {
      scripts_list
    });
  },
  data_am_form: (connection, received_data, managers) => {
    const { action_id } = received_data;
    const module_data = managers.admin_server.module_world.data;

    const list = [];

    for (const value of Object.values(module_data.am_forms_map))
      list.push(value._data);

    managers.admin_server.send(connection.get_id(), "data_am_form", {
      action_id,
      list,
      rules: RULES.form
    });
  },
  data_am_program: (connection, received_data, managers) => {
    const { action_id } = received_data;
    const module_data = managers.admin_server.module_world.data;

    const list = [];

    for (const value of Object.values(module_data.am_programs_map))
      list.push(value._data);

    managers.admin_server.send(connection.get_id(), "data_am_program", {
      action_id,
      list,
      rules: RULES.program
    });
  },
  data_am_system: (connection, received_data, managers) => {
    const { action_id } = received_data;
    const module_data = managers.admin_server.module_world.data;

    const list = [];

    for (const value of Object.values(module_data.am_systems_map))
      list.push(value._data);

    managers.admin_server.send(connection.get_id(), "data_am_system", {
      action_id,
      list,
      rules: RULES.system
    });
  },
  data_am_script: (connection, received_data, managers) => {
    const { action_id } = received_data;
    const module_data = managers.admin_server.module_world.data;

    const list = [];

    for (const value of Object.values(module_data.am_scripts_map))
      list.push(value._data);

    managers.admin_server.send(connection.get_id(), "data_am_script", {
      action_id,
      list,
      rules: RULES.system
    });
  },
  update_am_form: (connection, received_data, managers) => {
    const { action_id, id, object } = received_data;
    const module_data = managers.admin_server.module_world.data;
    const map = module_data.am_forms_map;

    let message = "Unknown";

    if (id === "") {
      const id = ObjectID().toHexString();
      map[id] = new Objects.Default({
        name: "new_" + id,
        id,
        rules: [],
        scripts: []
      });
      message = `Added id[${id}]`;
    } else if (!(id in map)) {
      message = `Wrong id[${id}]`;
    } else if (object == null) {
      delete map[id];
      message = `Removed id[${id}]`;
    } else {
      try {
        validator_map.form.validate(object);

        // "id: map[id].get_id()" to be sure id wont be override
        map[id]._data = { ...map[id]._data, ...object, id: map[id].get_id() };
        message = `Updated id[${id}]`;
      } catch (e) {
        logger.error(e);
        message = e.message;
      }
    }

    managers.admin_server.send(connection.get_id(), "update_am_form", {
      action_id,
      message
    });
  },
  update_am_program: (connection, received_data, managers) => {
    const { action_id, id, object } = received_data;
    const module_data = managers.admin_server.module_world.data;
    const map = module_data.am_programs_map;

    let message = "Unknown";

    if (id === "") {
      const id = ObjectID().toHexString();
      map[id] = new Objects.Default({
        name: "new_" + id,
        id,
        rules: [],
        forms: []
      });
      message = `Added id[${id}]`;
    } else if (!(id in map)) {
      message = `Wrong id[${id}]`;
    } else if (object == null) {
      delete map[id];
      message = `Removed id[${id}]`;
    } else {
      try {
        validator_map.program.validate(object);

        // "id: map[id].get_id()" to be sure id wont be override
        map[id]._data = { ...map[id]._data, ...object, id: map[id].get_id() };
        message = `Updated id[${id}]`;
      } catch (e) {
        logger.error(e);
        message = e.message;
      }
    }

    managers.admin_server.send(connection.get_id(), "update_am_program", {
      action_id,
      message
    });
  },
  update_am_system: (connection, received_data, managers) => {
    const { action_id, id, object } = received_data;
    const module_data = managers.admin_server.module_world.data;
    const map = module_data.am_systems_map;

    let message = "Unknown";

    if (id === "") {
      const id = ObjectID().toHexString();
      map[id] = new Objects.Default({
        name: "new_" + id,
        id,
        programs: []
      });
      message = `Added id[${id}]`;
    } else if (!(id in map)) {
      message = `Wrong id[${id}]`;
    } else if (object == null) {
      delete map[id];
      message = `Removed id[${id}]`;
    } else {
      try {
        validator_map.system.validate(object);

        // "id: map[id].get_id()" to be sure id wont be override
        map[id]._data = { ...map[id]._data, ...object, id: map[id].get_id() };
        message = `Updated id[${id}]`;
      } catch (e) {
        logger.error(e);
        message = e.message;
      }
    }

    managers.admin_server.send(connection.get_id(), "update_am_system", {
      action_id,
      message
    });
  },
  update_am_script: (connection, received_data, managers) => {
    const { action_id, id, object } = received_data;
    const module_data = managers.admin_server.module_world.data;
    const map = module_data.am_scripts_map;

    let message = "Unknown";

    if (id === "") {
      const id = ObjectID().toHexString();
      map[id] = new Objects.Default({
        id,
        source: `id ${id}\r\nname new_${id}\r\n data\r\n`
      });
      message = `Added id[${id}]`;
    } else if (!(id in map)) {
      message = `Wrong id[${id}]`;
    } else if (object == null) {
      delete map[id];
      message = `Removed id[${id}]`;
    } else {
      try {
        AML.parse(object);

        // "id: map[id].get_id()" to be sure id wont be override
        map[id]._data = {
          ...map[id]._data,
          source: object,
          id: map[id].get_id()
        };
        message = `Updated id[${id}]`;
      } catch (e) {
        logger.error(e);
        message = e.message;
      }
    }

    managers.admin_server.send(connection.get_id(), "update_am_script", {
      action_id,
      message
    });
  }
};
