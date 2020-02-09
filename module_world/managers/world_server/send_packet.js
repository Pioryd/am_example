const SendPacket = {
  error: (connection_id, managers, { received_data, error }) => {
    managers.world_server.send(connection_id, "error", {
      connection_id,
      received_data,
      error
    });
  },
  login: (connection_id, managers, { character_name }) => {
    managers.world_server.send(connection_id, "login", {
      character_name
    });
  },
  data_character: (
    connection_id,
    managers,
    {
      id,
      name,
      password,
      outfit,
      default_land_id,
      virtual_world_id,
      state,
      action,
      activity,
      energy,
      stress,
      friends_list
    }
  ) => {
    managers.world_server.send(connection_id, "data_character", {
      id,
      name,
      password,
      outfit,
      default_land_id,
      virtual_world_id,
      state,
      action,
      activity,
      energy,
      stress,
      friends_list
    });
  },
  data_land: (connection_id, managers, { id, map }) => {
    managers.world_server.send(connection_id, "data_land", { id, map });
  },
  data_world: (
    connection_id,
    managers,
    { lands_map, characters_map, environment_objects_map, virtual_worlds_map }
  ) => {
    managers.world_server.send(connection_id, "data_world", {
      lands_map,
      characters_map,
      environment_objects_map,
      virtual_worlds_map
    });
  },
  action_message: (connection_id, managers, { name, text }) => {
    managers.world_server.send(connection_id, "action_message", { name, text });
  },
  virtual_world: (connection_id, managers, { packet_id, data }) => {
    managers.world_server.send(connection_id, "virtual_world", {
      packet_id,
      data
    });
  }
};

module.exports = { SendPacket };
