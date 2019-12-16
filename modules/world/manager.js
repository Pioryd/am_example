const { ParsePacket } = require("./parse_packet");
const { Land, generate_random_land } = require("./land");
const { Character } = require("./character");

class Manager {
  constructor() {
    this.lands_list = generate_random_land(5);
    this.characters_map = {};

    // insert ams
    for (let i = 0; i <= 5; i++) {
      const bot = new Character(i);
      bot.name = `AM_${i}`;
      this.characters_map[i] = bot;
    }
  }

  get_character_by_id(id) {
    return id in this.characters_map;
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
}

module.exports = { Manager };
