class ParsePacket {
  static update(packet, manager) {
    let data = {};
    data.command = "update";
    data.position = manager.position;
    return data;
  }

  static change_position(packet, manager) {
    if (manager.land_size > packet.position && packet.position > 0)
      manager.position = packet.position;
  }
}

module.exports = { ParsePacket };
