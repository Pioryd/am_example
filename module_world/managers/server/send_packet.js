const SendPacket = {
  error: (connection_id, managers, { received_data, error }) => {
    managers.server.send(connection_id, "error", {
      connection_id,
      received_data,
      error
    });
  },
  login: (connection_id, managers, { character_name, admin }) => {
    managers.server.send(connection_id, "login", { character_name, admin });
  },
  // Admin - {lands_map, characters_map}
  // Character - {character, land}
  data_full: (connection_id, managers, data) => {
    managers.server.send(connection_id, "data_full", data);
  },
  data_character: (
    connection_id,
    managers,
    { id, name, password, state, action, activity, friends_list }
  ) => {
    managers.server.send(connection_id, "data_character", {
      id,
      name,
      password,
      state,
      action,
      activity,
      friends_list
    });
  },
  data_land: (connection_id, managers, { id, map }) => {
    managers.server.send(connection_id, "data_land", { id, map });
  },
  data_world: (
    connection_id,
    managers,
    { lands_map, characters_map, environment_objects_map }
  ) => {
    managers.server.send(connection_id, "data_world", {
      lands_map,
      characters_map,
      environment_objects_map
    });
  },
  action_message: (connection_id, managers, { name, text }) => {
    managers.server.send(connection_id, "action_message", { name, text });
  },
  virtual_world: (connection_id, managers, { packet_id, data }) => {
    managers.server.send(connection_id, "virtual_world", { packet_id, data });
  }
  // event_world_earthquake: (connection_id, packet_id) => {}
};

module.exports = { SendPacket };
