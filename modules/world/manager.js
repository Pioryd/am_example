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

    this.insert_bots();
  }

  create_parse_dict() {
    return {
      world: packet => {
        if (packet.command in ParsePacket)
          return ParsePacket[packet.command](packet, this);
      }
    };
  }

  insert_bots() {
    for (let i = 1; i <= 3; i++) {
      const bot = new Character(i);
      bot.name = `bot_${i}`;
      this.characters_map[i] = bot;
    }
  }
}

module.exports = { Manager };
