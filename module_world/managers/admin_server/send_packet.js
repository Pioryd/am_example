const SendPacket = {
  error: (connection_id, managers, { received_data, error }) => {
    managers.world_server.send(connection_id, "error", {
      connection_id,
      received_data,
      error
    });
  }
};

module.exports = { SendPacket };
