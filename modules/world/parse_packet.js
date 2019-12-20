function is_admin(id) {
  return id < 0;
}

function handle_error(connection, received_data, message) {
  if (message != null) console.error("Error:", message);
  console.error("Connection ID:", connection.get_id());
  console.error("received_data:", received_data);
  console.trace();

  const send_data = {
    connection_id: connection.get_id(),
    received_data: received_data
  };
  if (message != null) send_data.error = message;

  return {
    packet_id: "error",
    data: send_data
  };
}
const ParsePacket = {
  accept_connection: (connection, received_data, manager) => {
    const error = manager.authenticate(
      connection.socket.id,
      received_data.login,
      received_data.password
    );
    if (error != null) {
      handle_error(
        connection,
        received_data,
        "Unable to authenticate. Error: " + error
      );
      return;
    }

    const character_id = manager.get_character_id_by_name(received_data.login);
    if (character_id == null) {
      handle_error(connection, received_data);
      return;
    }

    connection.user_data.login = received_data.login;
    connection.user_data.password = received_data.password;
    connection.user_data.character_id = character_id;
    connection.on_close = connection => {
      manager.log_off_character(character_id);
    };

    const character_name = manager.get_character_name_by_id(character_id);
    if (character_name == null) {
      handle_error(connection, received_data);
      return;
    }

    return {
      packet_id: "login",
      data: { character_name: character_name, admin: is_admin(character_id) }
    };
  },

  data_full: (connection, received_data, manager) => {
    let send_data = {};
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      send_data = {
        lands_list: manager.lands_list,
        characters_map: manager.characters_map
      };
    } else {
      const character = manager.characters_map[character_id];
      const land = manager.lands_list[character.position.land_id];
      send_data = {
        character: character,
        land: land
      };
    }
    return {
      packet_id: "data_full",
      data: send_data
    };
  },
  data_character: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];

    send_data = {
      character: character
    };

    return {
      packet_id: "data_character",
      data: send_data
    };
  },
  data_world: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    const land = manager.lands_list[character.position.land_id];

    send_data = {
      land: land
    };

    return {
      packet_id: "data_character",
      data: send_data
    };
  },

  data_character_change_position: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    character.position.x = received_data.position_x;

    return data_character(connection, received_data, manager);
  },
  data_character_change_land: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    if (!(received_data.land_id in manager.lands_list)) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    character.position.land_id = received_data.land_id;

    return data_character(connection, received_data, manager);
  },
  data_character_add_friend: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }
    const character = manager.characters_map[character_id];
    const friend_name = received_data.name;

    if (friend_name == null) {
      handle_error(connection, received_data);
      return;
    }

    if (friend_name in character.friends_list) return;
    character.friends_list.push(friend_name);

    return data_character(connection, received_data, manager);
  },
  data_character_remove_friend: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    const friend_name = received_data.friend;

    if (friend_name == null) {
      handle_error(connection, received_data);
      return;
    }

    if (!(friend_name in character.friends_list)) return;
    delete character.friends_list[friend_name];

    return data_character(connection, received_data, manager);
  },
  data_character_change_state: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    if (received_data.state == null) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    const state_name = received_data.name;

    character.state = state_name;

    return data_character(connection, received_data, manager);
  },
  data_character_change_action: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    if (received_data.action == null) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    const action_name = received_data.name;

    character.action = action_name;

    return data_character(connection, received_data, manager);
  },
  data_character_change_activity: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    if (received_data.activity == null) {
      handle_error(connection, received_data);
      return;
    }

    const character = manager.characters_map[character_id];
    const activity_name = received_data.name;

    character.activity = activity_name;

    return data_character(connection, received_data, manager);
  },

  action_message: (connection, received_data, manager) => {
    const character_id = connection.user_data.character_id;

    if (is_admin(character_id)) {
      handle_error(connection, received_data);
      return;
    }

    const from = {
      connection: connection,
      character: manager.get_character_name_by_id(from.character_id)
    };
    const to = {
      character: manager.get_character_id_by_name(received_data.character_name)
    };
    const message = received_data.message;
    const date = new Date();

    if (message == null || from.character == null || to.character == null) {
      handle_error(connection, received_data);
      return;
    }

    to.connection = manager.server.get_connection_by_id(to.character.socket_id);

    if (to.connection == null) {
      handle_error(connection, received_data);
      return;
    }

    const send_data = {
      date: date,
      from_user: from.character.name,
      to_user: to.character.name,
      message: message
    };

    manager.server.send(dest_connection.socket.id, "action_message", send_data);
  }
};

module.exports = { ParsePacket };
