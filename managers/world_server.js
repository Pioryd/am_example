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
    const { login, password, mam_data } = received_data;
    const { config } = managers.world_server;

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

    const { objects_list } = managers.mam_register.register(
      mam_data,
      connection.get_id()
    ).mam;

    connection.on_close = (connection) => {
      managers.mam_register.unregister(connection.get_id());
    };

    managers.world_server.send(connection.get_id(), "accept_connection", {
      objects_list
    });

    return true;
  },
  data_mirror: function (connection, received_data, managers) {
    const { object_id } = received_data;

    const mirror = this.root_module.data.world;

    managers.world_server.send(connection.get_id(), "data_mirror", {
      object_id,
      mirror
    });
  },
  process_api: function (connection, received_data, managers) {
    const { object_id, api, timeout, args } = received_data;

    managers.api_loader.process({ object_id, api, timeout, args });
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
