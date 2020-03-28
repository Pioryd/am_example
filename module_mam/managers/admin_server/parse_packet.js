const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_mam", file_name: __filename });

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
      config.admin_server.login.toLowerCase() !== login.toLowerCase() ||
      config.admin_server.password !== password.toLowerCase()
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
  module_info: (connection, received_data, managers) => {
    const json = { "Module name": "World", "Connected count": "?" };
    managers.admin_server.send(connection.get_id(), "module_info", { json });
  },
  module_data: (connection, received_data, managers) => {
    managers.admin_server.send(connection.get_id(), "module_data", {
      json: managers.admin_server.module_mam.data
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
  }
};
