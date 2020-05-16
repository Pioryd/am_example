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
    const { login, password, objects_to_register } = received_data;
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

    const mam = managers.mam_register.register(
      objects_to_register,
      connection.get_id()
    );

    connection.on_close = (connection) => {
      managers.mam_register.unregister(connection.get_id());
    };

    managers.world_server.send(connection.get_id(), "accept_connection", {
      objects_list: mam.objects_list
    });

    return true;
  },
  data_mirror: function (connection, received_data, managers) {
    managers.world_server.send(connection.get_id(), "data_mirror", {
      mirror: managers.world_server.root_module.data.world
    });
  },
  process_api: function (connection, received_data, managers) {
    const { object_id, api, timeout, args } = received_data;

    managers.api_loader.process(
      { object_id, api, timeout, args },
      ({ script_id, query_id, value }) => {
        managers.world_server.send(connection, "process_api", {
          script_id,
          query_id,
          value
        });
      }
    );
  }
};

class WorldServer extends Managers.server {
  constructor({ root_module, config }) {
    super({ root_module, config, parse_packet });
  }

  send(connection_id, packet_id, packet_data) {
    super.send(connection_id, "root", { packet_id, packet_data });
  }

  poll() {
    if (this.root_module.managers.world_creator.created) super.poll();
  }
}

module.exports = WorldServer;
