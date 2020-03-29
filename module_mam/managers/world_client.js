const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_mam", file_name: __filename });
const { Client } = require(path.join(global.node_modules_path, "am_framework"));
/*
Responsible for:
*/
class WorldClient {
  constructor(module_mam) {
    this.module_mam = module_mam;

    const { url } = this.module_mam.config.world_client;
    this.client = new Client({
      url,
      options: { packet_timeout: 0, send_delay: 1000 }
    });
  }

  initialize() {
    const { login, password } = this.module_mam.config.world_client;
    const { characters } = this.module_mam.config;
    this.client.events.connected = () => {
      this.send("accept_connection", { login, password, characters });
    };
    this._add_parse_packet_dict();

    this._connect();
  }

  terminate() {
    this._disconnect();
  }

  poll() {
    this.client.poll();
  }

  _connect() {
    this.client.connect();
  }

  _disconnect() {
    this.client.disconnect();
  }

  send(packet_id, data) {
    this.client.send(packet_id, data);
  }

  // parse methods
  _add_parse_packet_dict() {
    this.client.add_parse_packet_dict({
      accept_connection: data => {
        const { characters_info } = data;
        this.module_mam.data.characters_info = characters_info;

        this.module_mam.managers.am.reload();

        for (const character_id of Object.keys(
          this.module_mam.data.characters_info
        )) {
          this.send("data_character", { character_id });
          this.send("data_land", { character_id });
          this.send("data_world", { character_id });
        }
      },
      data_character: data => {
        const { character_id } = data;
        this.module_mam.data.characters_info[character_id].character_data = {
          ...data
        };
        this.send("data_character", { character_id });
      },
      data_land: data => {
        const { character_id } = data;
        this.module_mam.data.characters_info[character_id].land_data = {
          ...data
        };
        this.send("data_land", { character_id });
      },
      data_world: data => {
        const { character_id } = data;
        this.module_mam.data.characters_info[character_id].world_data = {
          ...data
        };
        this.send("data_world", { character_id });
      },
      action_message: data => {
        const { character_id } = data;
        this.module_mam.data.characters_info[
          character_id
        ].action_message_packets = [
          ...this.module_mam.data.characters_info[character_id]
            .action_message_packets,
          { ...data }
        ];
      },
      virtual_world: data => {
        const { character_id } = data;
        this.module_mam.data.characters_info[
          character_id
        ].virtual_world_packets = [
          ...this.module_mam.data.characters_info[character_id]
            .virtual_world_packets,
          { ...data }
        ];
      }
    });
  }
}

module.exports = WorldClient;
