const SendPacket = {
  event_world_earthquake: (socket_id, packet_id, manager) => {
    manager.server.send(socket_id, packet_id, data);
  },

  action_message: (socket_id, manager, packet_id, data) => {
    manager.server.send(socket_id, packet_id, data);
  }
};

module.exports = { SendPacket };
