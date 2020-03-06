const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

/*
NOTE!
Classes instances like: [Character], [Land], etc use only as read only. 
To change any data of them use [managers] methods.
*/
function handle_error(connection, received_data, managers, message) {
  if (message != null) logger.error("Error:", message);
  logger.error(
    "Connection ID:",
    connection.get_id(),
    "Received_data:",
    received_data
  );

  managers.world_server.send(connection.get_id(), "error", {
    connection_id: connection.get_id(),
    received_data: received_data,
    error: message != null ? message : ""
  });
}

module.exports = {
  accept_connection: (connection, received_data, managers) => {
    const login = received_data.login;
    const password = received_data.password;
    const error = managers.characters.log_in(
      connection.get_id(),
      login,
      password
    );

    if (error != null) {
      handle_error(
        connection,
        received_data,
        managers,
        "Unable to character_authenticate. Error: " + error
      );
      return false;
    }

    const character = managers.characters._get_character_by_name(login);
    if (character == null) {
      handle_error(connection, received_data, managers, "Character not found.");
      return;
    }

    connection.user_data.character_id = character.get_id();
    connection.on_close = connection => {
      managers.characters.log_off(character.get_id());
    };

    managers.world_server.send(connection.get_id(), "accept_connection", {
      user_name: login
    });
    return true;
  },
  data_character: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const character = managers.characters._get_character_by_id(character_id);

    managers.world_server.send(connection.get_id(), "data_character", {
      id: character.get_id(),
      name: character.get_name(),
      password: character.get_password(),
      outfit: character.get_outfit(),
      default_land_id: character.get_default_land_id(),
      virtual_world_id: character.get_virtual_world_id(),
      state: character.get_state(),
      action: character.get_action(),
      activity: character.get_activity(),
      energy: character.get_energy(),
      stress: character.get_stress(),
      friends_list: character.get_friends_list()
    });
  },
  data_land: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const packet_data = {};

    const land = managers.characters.get_land(character_id);
    if (land != null) {
      packet_data.id = land._data.id;
      packet_data.map = land._data.map;
    }

    managers.world_server.send(connection.get_id(), "data_land", packet_data);
  },
  data_world: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const lands_map = {};
    const characters_map = {};
    const environment_objects_map = {};
    const virtual_worlds_map = {};

    for (const land of Object.values(
      managers.world_server.module_world.data.lands_map
    )) {
      lands_map[land.get_id()] = { name: land._data.name };
    }

    for (const character of Object.values(
      managers.world_server.module_world.data.characters_map
    )) {
      characters_map[character.get_id()] = {
        name: character._data.name,
        outfit: character._data.outfit,
        state: character._data.state,
        action: character._data.action,
        activity: character._data.activity,
        energy: character._data.energy,
        stress: character._data.stress
      };
    }

    for (const environment_object of Object.values(
      managers.world_server.module_world.data.environment_objects_map
    )) {
      const object_data = {
        type: environment_object._data.type,
        name: environment_object._data.name,
        actions_list: []
      };

      if ("action_scripts_list" in environment_object._data) {
        object_data.actions_list = Object.keys(
          environment_object._data.action_scripts_list
        );
      }

      environment_objects_map[environment_object.get_id()] = object_data;
    }

    for (const virtual_world of Object.values(
      managers.world_server.module_world.data.virtual_worlds_map
    )) {
      const object_data = {
        name: virtual_world._data.name,
        characters_list: [...virtual_world._data.characters_list]
      };

      virtual_worlds_map[virtual_world.get_id()] = object_data;
    }

    managers.world_server.send(connection.get_id(), "data_world", {
      lands_map,
      characters_map,
      environment_objects_map,
      virtual_worlds_map
    });
  },
  character_change_position: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.characters.change_position(character_id, received_data.position_x);

    data_world(connection, received_data, managers);
  },
  character_change_land: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.characters.change_land(character_id, received_data.land_id);

    data_world(connection, received_data, managers);
  },
  character_add_friend: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.characters.add_friend_if_exist(character_id, received_data.name);

    data_character(connection, received_data, managers);
  },
  character_remove_friend: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.characters.remove_friend_if_exist(
      character_id,
      received_data.name
    );

    data_character(connection, received_data, managers);
  },
  character_change_state: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_state(received_data.name);

    data_character(connection, received_data, managers);
  },
  character_change_action: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_action(received_data.name);

    data_character(connection, received_data, managers);
  },
  character_change_activity: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_activity(received_data.name);

    data_character(connection, received_data, managers);
  },
  action_message: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    const character = managers.characters._get_character_by_id(character_id);

    const from_character_name = character.get_name();
    const to_character_connection_id = managers.characters.get_connection_id(
      managers.characters.get_id_by_name(received_data.name)
    );

    const text = received_data.text;

    if (
      text == null ||
      from_character_name == null ||
      to_character_connection_id == null
    ) {
      handle_error(
        connection,
        received_data,
        managers,
        "Wrong action message data."
      );
      return;
    }

    managers.world_server.send(connection.get_id(), "action_message", {
      name: from_character_name,
      text: text
    });
  },
  process_script_action: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.main_world.process_action(
      received_data.object_id,
      received_data.action_id,
      { character_id, ...received_data.dynamic_args }
    );
  },
  enter_virtual_world: (connection, received_data, managers) => {
    logger.error(
      "Currently is not used",
      "(Server logic allow only enter by object - action message)"
    );
    // const character_id = connection.user_data.character_id;

    // const virtual_world_id = received_data.id;

    // managers.characters.enter_virtual_world(character_id, virtual_world_id);
  },
  leave_virtual_world: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.characters.leave_virtual_world(character_id);
  },
  virtual_world: (connection, received_data, managers) => {
    const character_id = connection.user_data.character_id;

    managers.virtual_worlds.process_packet_received_from_character(
      character_id,
      received_data
    );
  }
};
