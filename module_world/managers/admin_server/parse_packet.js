const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const { SendPacket } = require("./send_packet");
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

  SendPacket.error(connection.get_id(), managers, {
    received_data: received_data,
    error: message != null ? message : ""
  });
}

// Parse functions

function accept_connection(connection, received_data, managers) {
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

  SendPacket.login(connection.get_id(), managers, {
    character_name: login
  });
  return true;
}

function process_script(connection, received_data, managers) {
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
}

function module_data(connection, received_data, managers) {
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

  SendPacket.module_data(connection.get_id(), managers, {
    lands_map,
    characters_map,
    environment_objects_map,
    virtual_worlds_map
  });
}

function scripts_list(connection, received_data, managers) {
  const app = managers.admin_server.module_world.application;

  const scripts_list = app.get_scripts_list();
  SendPacket.scripts_list(connection.get_id(), managers, {
    scripts_list
  });
}

function get_am_data(connection, received_data, managers) {
  const form_list = [];
  const system_list = [];
  const script_list = [];
  const api_list = [];

  SendPacket.get_am_data(connection.get_id(), managers, {
    form_list,
    system_list,
    script_list,
    api_list
  });
}

function update_am_data(connection, received_data, managers) {
  const form_list = [];
  const system_list = [];
  const script_list = [];
  const api_list = [];

  SendPacket.update_am_data(connection.get_id(), managers, {
    form_list,
    system_list,
    script_list,
    api_list
  });
}
module.exports = {
  ParsePacket: {
    accept_connection: accept_connection,
    module_data: module_data,
    process_script: process_script,
    scripts_list: scripts_list,
    get_am_data,
    update_am_data
  }
};
