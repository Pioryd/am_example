const { ParsePacket } = require("./parse_packet");
const { Server } = require("am_framework");
/*
  Responsible for:
    - parse/send packets
*/
class ServerManager {
  constructor(module_world) {
    this.module_world = module_world;
    this.config = this.module_world.application.config.data;

    this.web_server = new Server({
      port: this.config.module_world.server.port
    });
  }

  initialize() {
    if (this.web_server == null) {
      log.info("Unable to set web_server");
      return;
    }

    this.web_server.add_parse_packet_dict(this.create_parse_packet_dict());
  }

  terminate() {
    if (this.web_server != null) {
      this.web_server.stop();
      this.web_server = null;
    }
  }

  poll() {
    this.web_server.poll();
  }

  send(connection_id, packet_id, data) {
    this.module_world.web_server.send(connection_id, packet_id, data);
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
