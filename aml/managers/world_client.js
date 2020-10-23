const path = require("path");
const { Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_aml",
  file_name: __filename
});

const parse_packets = {
  accept_connection(data, managers) {
    const { registered_objects } = data;
    managers.roots.set_registered_objects(registered_objects);
    managers.world_client.send("objects_data", {});
  },
  objects_data(data, managers) {
    const { objects_data } = data;
    managers.roots.update_objects_data(objects_data);
    managers.world_client.send("objects_data", {});
  },
  process_api(data, managers) {
    const { return_data, object_id } = data;
    managers.roots.process_return_data(object_id, return_data);
  }
};

const ParsePacket = {
  root(data, managers) {
    const { packet_id, packet_data } = data;
    parse_packets[packet_id](packet_data, managers);
  }
};

class WorldClient extends Managers.core_client {
  constructor({ root_module, config }) {
    super({
      root_module,
      config,
      parse_packet: ParsePacket,
      on_connected: () => {
        try {
          const { login, password, objects_to_register } = config;
          this.send("accept_connection", {
            login,
            password,
            objects_to_register
          });
        } catch (e) {
          logger.error(e, e.stack);
        }
      }
    });
  }
}

module.exports = WorldClient;
