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
    const { login, password, objects_to_register, admin } = received_data;
    const { config } = managers.server;
    if (
      login == null ||
      password == null ||
      config.login.toLowerCase() !== login.toLowerCase() ||
      config.password !== password.toLowerCase()
    ) {
      managers.server.handle_error(
        connection,
        received_data,
        managers,
        `Unable to accept connection. Login[${login}] Password[${password}]`
      );
      return false;
    }

    if (admin == null || admin == false) {
      const objects_list = managers.aml.register(
        objects_to_register,
        connection.get_id()
      );

      connection.on_close = (connection) => {
        managers.aml.unregister(connection.get_id());
      };

      managers.server.send(connection.get_id(), "accept_connection", {
        registered_objects: objects_list
      });
    } else {
      managers.server.send(connection.get_id(), "accept_connection", {});
    }

    return true;
  },
  data_mirror: function (connection, received_data, managers) {
    managers.server.send(connection.get_id(), "data_mirror", {
      mirror: managers.server.root_module.data.world
    });
  },
  objects_data: function (connection, received_data, managers) {
    const objects_data = {};
    for (const [id, object] of Object.entries(
      managers.world.root_module.data.world.objects
    ))
      objects_data[id] = object.data;

    managers.server.send(connection.get_id(), "objects_data", { objects_data });
  },
  process_api: function (connection, received_data, managers) {
    const { object_id, api, module, query_id, timeout, args } = received_data;
    const data = { query_id, timeout, args };
    let value = {};
    if (module != null) {
      value = managers.core_ai.process_ai_api({ object_id, module, api, data });
    } else {
      value = managers.core_ai.process_world_api(object_id, api, data);
    }

    if (value != null) {
      this.root_module.managers.server.send("process_api", {
        object_id,
        return_data: { value, query_id }
      });
    }
  }
};

class WorldServer extends Managers.core_server {
  constructor({ root_module, config }) {
    super({ root_module, config, parse_packet });
  }

  send(connection_id, packet_id, packet_data) {
    super.send(connection_id, "root", { packet_id, packet_data });
  }

  poll() {
    if (this.root_module.managers.world.created) {
      super.poll();
    }
  }
}

module.exports = WorldServer;
