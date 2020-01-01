const SendPacket = {
  event_world_earthquake: (connection_id, packet_id, managers) => {
    managers.server.send(connection_id, packet_id, data);
  },

  action_message: (connection_id, packet_id, data, managers) => {
    managers.server.send(connection_id, packet_id, data);
  }
};

module.exports = { SendPacket };
