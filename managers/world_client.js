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
  accept_connection: (data, managers) => {
    const { characters_info, am_data } = data;
    managers.world_client.root_module.data.characters_info = characters_info;

    managers.am.am_data = am_data;

    for (const character_id of Object.keys(
      managers.world_client.root_module.data.characters_info
    )) {
      managers.world_client.send("data_mirror", { character_id });
    }
  },
  data_mirror: (data, managers) => {
    const { character_id, mirror } = data;

    // To not override [character_info] object
    for (const [key, value] of Object.entries(mirror))
      managers.world_client.root_module.data.characters_info[character_id][
        key
      ] = value;

    managers.world_client.send("data_mirror", { character_id });
  },
  process_api: (data, managers) => {
    const { script_id, query_id, value } = data;

    for (const root of Object.values(managers.am.containers_map))
      root.return_data.insert({ script_id, query_id, value });
  }
};
const ParsePacket = {
  root: (data, managers) => {
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
        const { login, password } = config;
        const { characters } = root_module.config;
        this.send("accept_connection", { login, password, characters });
      }
    });
  }
}

module.exports = WorldClient;
