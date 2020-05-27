const path = require("path");
const { Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_mam",
  file_name: __filename
});

const parse_packets = {
  accept_connection(data, managers) {
    const { objects_list } = data;
    managers.world_client.root_module.data.objects_list = objects_list;

    managers.world_client.send("data_mirror", {});
  },
  data_mirror(data, managers) {
    const { mirror } = data;
    managers.world_client.root_module.data.mirror = mirror;
  },
  process_api(data, managers) {
    const { script_id, query_id, value } = data;
    managers.aml_roots.process_return_value({ script_id, query_id, value });
  }
};

const ParsePacket = {
  root(data, managers) {
    const { packet_id, packet_data } = data;
    parse_packets[packet_id](packet_data, managers);
  }
};

class WorldClient extends Managers.client {
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
