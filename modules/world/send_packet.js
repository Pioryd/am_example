const SendPacket = {
  event_world_earthquake: (connection_id, packet_id, manager) => {
    manager.server.send(connection_id, packet_id, data);
  },

  action_message: (connection_id, manager, packet_id, data) => {
    manager.server.send(connection_id, packet_id, data);
  }
};

module.exports = { SendPacket };
