const path = require("path");
const { Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const parse_packet = {
  accept_connection: function (connection, received_data, managers) {
    const { login, password, characters } = received_data;

    const config = managers.world_server.config;
    if (
      login == null ||
      password == null ||
      config.login.toLowerCase() !== login.toLowerCase() ||
      config.password !== password.toLowerCase()
    ) {
      managers.world_server.handle_error(
        connection,
        received_data,
        managers,
        `Unable to accept connection. Login[${login}] Password[${password}]`
      );
      return false;
    }

    const characters_info = managers.mam_register.register(
      characters,
      connection.get_id()
    );

    connection.on_close = (connection) => {
      managers.mam_register.unregister(connection.get_id());
    };

    managers.world_server.send(connection.get_id(), "accept_connection", {
      characters_info
    });
    return true;
  },
  data_mirror: function (connection, received_data, managers) {
    const { character_id } = received_data;

    const mirror = this.root_module.data.characters[character_id];

    managers.world_server.send(connection.get_id(), "data_mirror", {
      character_id,
      mirror
    });
  },
  process_api: function (connection, received_data, managers) {
    const { character_id, api_name, timeout, args } = received_data;

    managers.api_loader({ character_id, api_name, timeout, args });
  }
};

class WorldServer extends Managers.server {
  constructor({ root_module, config }) {
    super({ root_module, config, parse_packet });
  }

  send(connection_id, packet_id, packet_data) {
    super.send(connection_id, "root", { packet_id, packet_data });
  }
}

module.exports = WorldServer;
