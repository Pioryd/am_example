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

  if (
    managers.admin_server.module_world.data.settings.admin_login.toLowerCase() !==
      login.toLowerCase() ||
    managers.admin_server.module_world.data.settings.admin_password !==
      password.toLowerCase()
  ) {
    handle_error(
      connection,
      received_data,
      managers,
      "Unable to character_authenticate. Login:" +
        login +
        "Password:" +
        password
    );
    return false;
  }

  connection.user_data.character_name = login;
  connection.user_data.password = password;
  connection.on_close = connection => {};

  // Command
  const { command, args } = received_data;
  const commands_map =
    managers.main_world.module_world.application.commands_map;

  if (!(command in commands_map)) {
    logger.error("Command does not exist:", command, "with args:", args);
    return false;
  }

  logger.log(`Executing command[${command}] with args[${args[0]}]`);
  commands_map[command](args[0]);

  return false;

  //  return true;
}

module.exports = {
  ParsePacket: {
    accept_connection: accept_connection
  }
};
