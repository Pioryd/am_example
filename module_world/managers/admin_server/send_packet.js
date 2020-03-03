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
  module_data: (connection_id, managers, data) => {
    managers.admin_server.send(connection_id, "module_data", data);
  },
  scripts_list: (connection_id, managers, { scripts_list }) => {
    managers.admin_server.send(connection_id, "scripts_list", {
      scripts_list
    });
  },
  get_am_data: (connection_id, managers, data) => {
    managers.admin_server.send(connection_id, "get_am_data", data);
  },
  update_am_data: (connection_id, managers, data) => {
    managers.admin_server.send(connection_id, "update_am_data", data);
  }
};

module.exports = { SendPacket };
