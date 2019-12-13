class ParsePacket {
  static update(packet, manager) {
    let data = {};
    data.command = "update";
    data.characters_map = manager.characters_map;
    data.lands_list = manager.lands_list;
    return data;
  }

  static change_position(packet, manager) {
    for (const [id, character] of Object.entries(manager.characters_map))
      if (packet.character_id === character.id)
        for (const land of manager.lands_list)
          if (packet.position <= land.size && packet.position > 0)
            manager.characters_map[character.id].position.x = packet.position;
  }

  static change_land(packet, manager) {
    for (const [id, character] of Object.entries(manager.characters_map))
      if (packet.character_id === character.id)
        for (const land of manager.lands_list)
          if (packet.land_id === land.id)
            manager.characters_map[packet.character_id].position.land_id =
              packet.land_id;
  }

  static add_friend(packet, manager) {
    let found = false;
    for (const [id, character] of Object.entries(manager.characters_map))
      if (packet.character_id === character.id) found = true;
    if (!found) return;

    for (const [id, character] of Object.entries(manager.characters_map))
      if (packet.friend_name === character.name)
        if (
          !manager.characters_map[packet.character_id].friends_list.includes(
            packet.friend_name
          )
        )
          manager.characters_map[packet.character_id].friends_list.push(
            packet.friend_name
          );
  }

  static chat_message(packet, manager) {
    let data = {};
    data.command = "chat_message";
    data.message = "message received: " + packet.message;
    data.from_character_id = packet.from_character_id;
    data.to_character_id = packet.to_character_id;
    return data;
  }
}

module.exports = { ParsePacket };
