const { ParsePacket } = require("./parse_packet");
const { Land } = require("./land");
const { Character } = require("./character");

class Manager {
  constructor() {
    this.lands_list = [new Land(1), new Land(2), new Land(3)];
    this.character = new Character(123);
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
