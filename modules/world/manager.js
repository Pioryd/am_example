const { ParsePacket } = require("./parse_packet");
const { Land, generate_random_land } = require("./land");
const { Character } = require("./character");

class Manager {
  constructor() {
    this.lands_list = generate_random_land(5);
    this.characters_map = {};

    // Create player
    let id = 0;
    let player = new Character(id);
    player.name = "player";
    this.characters_map[id] = player;
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
