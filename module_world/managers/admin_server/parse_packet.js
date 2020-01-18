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
    managers.main_world.module_world.application.commands_map;

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

function scripts_list(connection, received_data, managers) {
  const app = managers.main_world.module_world.application;

  const scripts_list = app.get_scripts_list();
  SendPacket.scripts_list(connection.get_id(), managers, {
    scripts_list
  });
}

module.exports = {
  ParsePacket: {
    accept_connection: accept_connection,
    process_script: process_script,
    scripts_list: scripts_list
  }
};
