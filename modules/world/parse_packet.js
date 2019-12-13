class ParsePacket {
  static update(packet, manager) {
    let data = {};
    data.command = "update";
    data.characters_map = manager.characters_map;
    data.lands_list = manager.lands_list;
    return data;
  }

  static change_position(packet, manager) {
    for (const [name, character] of Object.entries(manager.characters_map))
      if (packet.character_id === character.id)
        for (const land of manager.lands_list)
          if (packet.position <= land.size && packet.position > 0)
            manager.characters_map[character.id].position.x = packet.position;
  }

  static change_land(packet, manager) {
    for (const [name, character] of Object.entries(manager.characters_map))
      if (packet.character_id === character.id)
        for (const land of manager.lands_list)
          if (packet.land_id === land.id)
            manager.characters_map[character.id].position.land_id =
              packet.land_id;
  }
}

module.exports = { ParsePacket };
