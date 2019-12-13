class ParsePacket {
  static update(packet, manager) {
    let data = {};
    data.command = "update";
    data.characters_map = manager.characters_map;
    data.lands_list = manager.lands_list;
    return data;
  }

  static change_position(packet, manager) {
    for (const land of manager.lands_list)
      if (packet.position > land.size) return;
    if (packet.position <= 0) return;

    manager.character.position.x = packet.position;
  }

  static change_land(packet, manager) {
    manager.change_character_land(packet.character_id, packet.land_id);
  }
}

module.exports = { ParsePacket };
