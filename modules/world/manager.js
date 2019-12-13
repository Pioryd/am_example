const { ParsePacket } = require("./parse_packet");
const { Land, generate_random_land } = require("./land");
const { Character } = require("./character");

class Manager {
  constructor() {
    this.lands_list = generate_random_land(5);
    this.characters_map = {};

    // Create player
    let player = new Character(0);
    player.name = "player";
    this.characters_map.player = player;
  }

  create_parse_dict() {
    return {
      world: packet => {
        if (packet.command in ParsePacket)
          return ParsePacket[packet.command](packet, this);
      }
    };
  }

  change_character_land(character_id, land_id) {
    let found = false;
    for (const [name, character] of Object.entries(this.characters_map))
      if (character.id === character_id) found = true;
    if (!found) return;

    found = false;
    for (const land of this.lands_list) if (land_id === land.id) found = true;
    if (!found) return;

    manager.characters_map[character_id].position.land_id = land_id;
  }
}

module.exports = { Manager };
