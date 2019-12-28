/*
NOTE!
Classes instances like: [Character], [Land], etc use only as read only. 
To change any data of them use [manager] methods.
*/
function is_admin(name) {
  return name === "admin";
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
  const login = received_data.login;
  const password = received_data.password;

  const error = manager.character_authenticate(
    connection.socket.id,
    login,
    password
  );

  if (error != null) {
    handle_error(
      connection,
      received_data,
      "Unable to character_authenticate. Error: " + error
    );
    return;
  }

  if (manager.character_is_exist(login) == null) {
    handle_error(connection, received_data);
    return;
  }

  connection.user_data.character_name = login;
  connection.user_data.password = password;
  connection.on_close = connection => {
    manager.character_log_off(login);
  };

  return {
    packet_id: "login",
    data: {
      character_name: login,
      admin: is_admin(login)
    }
  };
}

function data_full(connection, received_data, manager) {
  let send_data = {};
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    send_data = {
      lands_map: manager._lands_map,
      characters_map: manager._characters_map
    };
  } else {
    const character = manager.character_get(character_name);
    const land = manager.character_get_land(character_name);
    send_data = {
      character: character._data,
      land: land._data
    };
  }
  return {
    packet_id: "data_full",
    data: send_data
  };
}

function data_character(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.character_get(character_name);

  send_data = {
    character: character._data
  };

  return {
    packet_id: "data_character",
    data: send_data
  };
}

function data_world(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const land = manager.character_get_land(character_name);
  if (land == null) {
    handle_error(connection, received_data);
    return;
  }

  send_data = {
    land: land._data
  };

  return {
    packet_id: "data_world",
    data: send_data
  };
}

function data_character_change_position(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  manager.character_change_position(character_name, received_data.position_x);

  return data_world(connection, received_data, manager);
}

function data_character_change_land(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  manager.character_change_land(character_name, received_data.land_id);

  return data_world(connection, received_data, manager);
}

function data_character_add_friend(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  manager.character_add_friend_if_exist(character_name, received_data.name);

  return data_character(connection, received_data, manager);
}

function data_character_remove_friend(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.character_get(character_name);
  character.remove_friend(received_data.name);

  return data_character(connection, received_data, manager);
}

function data_character_change_state(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.character_get(character_name);
  character.change_state(received_data.name);

  return data_character(connection, received_data, manager);
}

function data_character_change_action(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.character_get(character_name);
  character.change_action(received_data.name);

  return data_character(connection, received_data, manager);
}

function data_character_change_activity(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const character = manager.character_get(character_name);
  character.change_activity(received_data.name);

  return data_character(connection, received_data, manager);
}

function action_message(connection, received_data, manager) {
  const character_name = connection.user_data.character_name;

  if (is_admin(character_name)) {
    handle_error(connection, received_data);
    return;
  }

  const from_character_name = character_name;
  const to_character_connection_id = manager.character_get_connection_id(
    received_data.name
  );

  const text = received_data.text;

  if (
    text == null ||
    from_character_name == null ||
    to_character_connection_id == null
  ) {
    handle_error(connection, received_data);
    return;
  }

  const send_data = {
    name: from_character_name,
    text: text
  };
  manager.server.send(to_character_connection_id, "action_message", send_data);
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
