const ParsePacket = {
  accept_connection: (socket_id, data, manager) => {
    return {
      id: "login",
      data: {}
    };
  },

  disconnect_connection: (socket_id, data, manager) => {
    console.log("From parse_packet-on_disconnect: hello");
  },
  login: (socket_id, data, manager) => {},

  update: (socket_id, data, manager) => {
    return {
      id: "update",
      data: {
        characters_map: manager.characters_map,
        lands_list: manager.lands_list
      }
    };
  },
  change_position: (socket_id, data, manager) => {
    for (const [id, character] of Object.entries(manager.characters_map))
      if ((data, character_id === character.id))
        for (const land of manager.lands_list)
          if ((data, position <= land.size && data, position > 0))
            (manager.characters_map[character.id].position.x = data), position;
  },
  change_land: (socket_id, data, manager) => {
    for (const [id, character] of Object.entries(manager.characters_map))
      if ((data, character_id === character.id))
        for (const land of manager.lands_list)
          if ((data, land_id === land.id))
            (manager.characters_map[
              (data, character_id)
            ].position.land_id = data),
              land_id;
  },
  add_friend: (socket_id, data, manager) => {
    let found = false;
    for (const [id, character] of Object.entries(manager.characters_map))
      if ((data, character_id === character.id)) found = true;
    if (!found) return;

    for (const [id, character] of Object.entries(manager.characters_map))
      if ((data, friend_name === character.name))
        if (
          !manager.characters_map[(data, character_id)].friends_list.includes(
            data,
            friend_name
          )
        )
          manager.characters_map[(data, character_id)].friends_list.push(
            data,
            friend_name
          );
  },
  chat_message: (socket_id, data, manager) => {
    return {
      id: "chat_message",
      data: {
        message: "message received: " + data.message,
        from_character_id: data.from_character_id,
        to_character_id: data.to_character_id
      }
    };
  }
};

module.exports = { ParsePacket };
