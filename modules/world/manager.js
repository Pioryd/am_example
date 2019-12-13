const { ParsePacket } = require("./parse_packet");
const { Land } = require("./land");

class Manager {
  constructor() {
    this.lands_list = [new Land(1), new Land(2), new Land(3)];
    this.character = { name: "player", position: 0, land_id: 0 };
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
