const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_mam", file_name: __filename });
const { Client } = require(path.join(global.node_modules_path, "am_framework"));
const ParsePacket = require("./parse_packet");
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
    this.client.add_parse_packet_dict(this._create_parse_packet_dict());

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

  _create_parse_packet_dict() {
    let parse_packet_dict = {};
    for (const [packet_id] of Object.entries(ParsePacket)) {
      parse_packet_dict[packet_id] = data => {
        return ParsePacket[packet_id](data, this.module_mam.managers);
      };
    }
    return parse_packet_dict;
  }

  send(packet_id, data) {
    this.client.send(packet_id, data);
  }
}

module.exports = WorldClient;
