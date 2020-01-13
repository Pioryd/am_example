const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const { Server } = require(path.join(global.node_modules_path, "am_framework"));
const { ParsePacket } = require("./parse_packet");
const { SendPacket } = require("./send_packet");
/*
  Responsible for:
    - parse/send packets
*/
class ServerManager {
  constructor(module_world) {
    this.send_packet = SendPacket;
    this.module_world = module_world;
    this.config = this.module_world.config;

    this.server = new Server({
      port: this.config.module_world.admin_server.port
    });
  }

  initialize() {
    if (this.server == null) {
      logger.info("Unable to set server");
      return;
    }

    this.server.add_parse_packet_dict(this.create_parse_packet_dict());

    this.server.start();
  }

  terminate() {
    if (this.server != null) {
      this.server.stop();
      this.server = null;
    }
  }

  poll() {
    this.server.poll();
  }

  send(connection_id, packet_id, data) {
    this.server.send(connection_id, packet_id, data);
  }

  create_parse_packet_dict() {
    let parse_packet_dict = {};
    for (const [packet_id] of Object.entries(ParsePacket)) {
      parse_packet_dict[packet_id] = (connection, data) => {
        return ParsePacket[packet_id](
          connection,
          data,
          this.module_world.managers
        );
      };
    }
    return parse_packet_dict;
  }
}

module.exports = ServerManager;
