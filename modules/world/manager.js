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

  create_parse_packet_dict() {
    let parse_packet_dict = {};
    for (const [packet_id] of Object.entries(ParsePacket)) {
      parse_packet_dict[packet_id] = (socket_id, data) => {
        return ParsePacket[packet_id](socket_id, data, this);
      };
    }
    return parse_packet_dict;
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
