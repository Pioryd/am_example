const { ParsePacket } = require("./parse_packet");

class Manager {
  constructor() {
    this.land_size = 7;
    this.position = 0;
  }

  create_parse_dict() {
    return {
      world: packet => {
        if (packet.command in ParsePacket)
          return ParsePacket[packet.command](packet, this);
      }
    };
  }
}

module.exports = { Manager };
