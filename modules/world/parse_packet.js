const ParsePacket = {
  accept_connection: (connection, data, manager) => {
    const error = manager.authenticate(
      connection.socket.id,
      data.login,
      data.password
    );
    if (error != null) {
      console.log("Unable to authenticate. Error: " + error);
      return;
    }

    const character_id = manager.get_character_id_by_name(data.login);
    if (character_id == null) return;

    connection.user_data.login = data.login;
    connection.user_data.password = data.password;
    connection.user_data.character_id = character_id;
    connection.on_close = connection => {
      manager.log_off_character(connection.id);
    };

    const character_name = manager.get_character_name_by_id(character_id);
    if (character_name == null) return;

    return {
      packet_id: "login",
      data: { character_name: character_name }
    };
  },

  disconnect_connection: (connection, data, manager) => {},

  login: (connection, data, manager) => {},

  update: (connection, data, manager) => {
    const character_data = manager.get_character_data_by_id(
      connection.user_data.character_id
    );

    return {
      packet_id: "update",
      data: { ...character_data }
    };
  },
  change_position: (connection, data, manager) => {
    for (const [id, character] of Object.entries(manager.characters_map))
      if (character_id === character.id)
        for (const land of manager.lands_list)
          if (position <= land.size && position > 0)
            (manager.characters_map[character.id].position.x = data), position;
  },
  change_land: (connection, data, manager) => {
    for (const [id, character] of Object.entries(manager.characters_map))
      if (character_id === character.id)
        for (const land of manager.lands_list)
          if (land_id === land.id)
            (manager.characters_map[character_id].position.land_id = data),
              land_id;
  },
  add_friend: (connection, data, manager) => {
    let found = false;
    for (const [id, character] of Object.entries(manager.characters_map))
      if (character_id === character.id) found = true;
    if (!found) return;

    for (const [id, character] of Object.entries(manager.characters_map))
      if (friend_name === character.name)
        if (
          !manager.characters_map[character_id].friends_list.includes(
            data,
            friend_name
          )
        )
          manager.characters_map[character_id].friends_list.push(
            data,
            friend_name
          );
  },
  chat_message: (connection, data, manager) => {
    return {
      packet_id: "chat_message",
      data: {
        message: "message received: " + data.message,
        from_character_id: data.from_character_id,
        to_character_id: data.to_character_id
      }
    };
  }
};

module.exports = { ParsePacket };
