const path = require("path");
const { Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_mam",
  file_name: __filename
});

const ParsePacket = {
  accept_connection: (data, managers) => {
    const { characters_info, am_data } = data;
    managers.world_client.module_mam.data.characters_info = characters_info;

    managers.am.am_data = am_data;

    for (const character_id of Object.keys(
      managers.world_client.module_mam.data.characters_info
    )) {
      managers.world_client.send("data_character", { character_id });
      managers.world_client.send("data_land", { character_id });
      managers.world_client.send("data_world", { character_id });
    }
  },
  data_character: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].character_data = {
      ...data
    };
    managers.world_client.send("data_character", { character_id });
  },
  data_land: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].land_data = {
      ...data
    };
    managers.world_client.send("data_land", { character_id });
  },
  data_world: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].world_data = {
      ...data
    };
    managers.world_client.send("data_world", { character_id });
  },
  action_message: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].action_message_packets = [
      ...managers.world_client.module_mam.data.characters_info[character_id]
        .action_message_packets,
      { ...data }
    ];
  },
  virtual_world: (data, managers) => {
    const { packet_data } = data;
    const { character_id } = packet_data;
    const character_info =
      managers.world_client.module_mam.data.characters_info[character_id];

    if (Array.isArray(character_info.virtual_world_packets))
      character_info.virtual_world_packets = [
        ...character_info.virtual_world_packets,
        { ...packet_data }
      ];
    else character_info.virtual_world_packets = [{ ...packet_data }];
  }
};

class WorldClient extends Managers.Client {
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
