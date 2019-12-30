const { ParsePacket } = require("./parse_packet");

class Server {
  constructor(module_world) {
    this.module_world = module_world;
  }

  poll() {}

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

module.exports = Server;
