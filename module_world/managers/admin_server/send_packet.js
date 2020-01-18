const SendPacket = {
  error: (connection_id, managers, { received_data, error }) => {
    managers.admin_server.send(connection_id, "error", {
      connection_id,
      received_data,
      error
    });
  },
  login: (connection_id, managers, { character_name }) => {
    managers.admin_server.send(connection_id, "login", {
      character_name
    });
  },
  scripts_list: (connection_id, managers, { scripts_list }) => {
    managers.admin_server.send(connection_id, "scripts_list", {
      scripts_list
    });
  }
};

module.exports = { SendPacket };
