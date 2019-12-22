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

// Parse functions

function accept_connection(connection, received_data, manager) {
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
}

function data_full(connection, received_data, manager) {
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
}
function data_character(connection, received_data, manager) {
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
}
function data_world(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  const land = manager.lands_list[character.position.land_id];

  send_data = {
    land: land
  };

  return {
    packet_id: "data_character",
    data: send_data
  };
}
function data_character_change_position(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  character.position.x = received_data.position_x;

  return data_character(connection, received_data, manager);
}
function data_character_change_land(connection, received_data, manager) {
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
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  character.position.land_id = received_data.land_id;

  return data_character(connection, received_data, manager);
}
function data_character_add_friend(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }
  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  const friend_name = received_data.name;

  if (
    friend_name == null ||
    !manager.is_character_exist(friend_name)
    // ||
    // friend_name == character.name
  ) {
    handle_error(connection, received_data);
    return;
  }

  if (character.friends_list.includes(friend_name)) return;
  character.friends_list.push(friend_name);

  return data_character(connection, received_data, manager);
}
function data_character_remove_friend(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  const friend_name = received_data.name;

  if (friend_name == null) {
    handle_error(connection, received_data);
    return;
  }

  if (!character.friends_list.includes(friend_name)) return;
  character.friends_list.splice(character.friends_list.indexOf(friend_name), 1);

  return data_character(connection, received_data, manager);
}
function data_character_change_state(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  const state_name = received_data.name;

  character.state = state_name;

  return data_character(connection, received_data, manager);
}
function data_character_change_action(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  const action_name = received_data.name;

  character.action = action_name;

  return data_character(connection, received_data, manager);
}
function data_character_change_activity(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.characters_map[character_id];
  if (character == null) {
    handle_error(connection, received_data);
    return;
  }

  const activity_name = received_data.name;

  character.activity = activity_name;

  return data_character(connection, received_data, manager);
}

function action_message(connection, received_data, manager) {
  const character_id = connection.user_data.character_id;

  if (is_admin(character_id)) {
    handle_error(connection, received_data);
    return;
  }

  const from_character = manager.get_character_by_id(character_id);
  const to_character = manager.get_character_by_id(received_data.name);
  const text = received_data.text;

  if (text == null || from_character == null || to_character == null) {
    handle_error(connection, received_data);
    return;
  }

  const send_data = {
    name: from_character.name,
    text: text
  };

  manager.server.send(to_character.socket_id, "action_message", send_data);
}

module.exports = {
  ParsePacket: {
    accept_connection: accept_connection,
    data_full: data_full,
    data_character: data_character,
    data_world: data_world,
    data_character_change_position: data_character_change_position,
    data_character_change_land: data_character_change_land,
    data_character_add_friend: data_character_add_friend,
    data_character_remove_friend: data_character_remove_friend,
    data_character_change_state: data_character_change_state,
    data_character_change_action: data_character_change_action,
    data_character_change_activity: data_character_change_activity,
    action_message: action_message
  }
};
