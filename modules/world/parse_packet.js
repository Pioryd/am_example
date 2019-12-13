class ParsePacket {
  static update(packet, manager) {
    let data = {};
    data.command = "update";
    data.character = manager.character;
    return data;
  }

  static change_position(packet, manager) {
    for (const land of manager.lands_list)
      if (packet.position > land.size) return;
    if (packet.position <= 0) return;

    manager.character.position = packet.position;
  }

  static change_land(packet, manager) {
    for (const land of manager.lands_list) {
      if (packet.id === land.id) {
        manager.character.land_id = packet.id;
        break;
      }
    }
  }
}

module.exports = { ParsePacket };
