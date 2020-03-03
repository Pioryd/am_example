const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const AM = require("../../am");

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
      config.module_world.admin_server.login.toLowerCase() !==
        login.toLowerCase() ||
      config.module_world.admin_server.password !== password.toLowerCase()
    ) {
      handle_error(
        connection,
        received_data,
        managers,
        `Unable to accept connection. Login: ${login} Password: ${password}`
      );
      return false;
    }

    connection.on_close = connection => {};
    managers.admin_server.send(connection.get_id(), "login", {
      character_name: login
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
  get_am_data: (connection, received_data, managers) => {
    const module_data = managers.admin_server.module_world.data;
    const forms_list = [];
    const programs_list = [];
    const scripts_list = [];
    const systems_list = [];

    for (const id of Object.keys(module_data.am_forms_map)) forms_list.push(id);
    for (const id of Object.keys(module_data.am_programs_map))
      programs_list.push(id);
    for (const id of Object.keys(module_data.am_scripts_map))
      scripts_list.push(id);
    for (const id of Object.keys(module_data.am_systems_map))
      systems_list.push(id);

    managers.admin_server.send(connection.get_id(), "get_am_data", {
      forms_list,
      programs_list,
      scripts_list,
      systems_list
    });
  },
  update_am_data: (connection, received_data, managers) => {
    const { action_id, type, id, object } = received_data;
    const module_data = managers.admin_server.module_world.data;

    let message = "Unknown";

    const maps = {
      form: module_data.am_forms_map,
      program: module_data.am_programs_map,
      script: module_data.am_scripts_map,
      system: module_data.am_systems_map
    };
    const classes = {
      form: AM.Form,
      program: AM.Program,
      script: AM.Script,
      system: AM.System
    };

    let map = maps[type];

    if (!(type in maps)) {
      message = "Wrong type";
    } else if (id === "") {
      message = "Wrong id";
    } else if (!(id in map)) {
      map[id] = new classes[type](
        { ...object, id },
        manager.module_world.managers.am
      );
      message = `Added type[${type}] id[${id}]`;
    } else if (object == null) {
      delete map[id];
      message = `Removed type[${type}] id[${id}]`;
    } else {
      // "id: map[id].get_id()" to be sure id wont be override
      map[id]._data = { ...map[id]._data, ...object, id: map[id].get_id() };
      message = `Updated type[${type}] id[${id}]`;
    }

    managers.admin_server.send(connection.get_id(), "update_am_data", {
      action_id,
      message
    });
  }
};
