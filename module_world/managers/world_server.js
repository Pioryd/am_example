const path = require("path");
const { Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const ParsePacket = {
  accept_connection: (connection, received_data, managers) => {
    const { login, password, characters } = received_data;

    const config = managers.world_server.config;
    if (
      login == null ||
      password == null ||
      config.world_server.login.toLowerCase() !== login.toLowerCase() ||
      config.world_server.password !== password.toLowerCase()
    ) {
      managers.world_server.handle_error(
        connection,
        received_data,
        managers,
        `Unable to accept connection. Login[${login}] Password[${password}]`
      );
      return false;
    }

    const characters_info = managers.mam.register(
      characters,
      connection.get_id()
    );
    const am_data = managers.am_data.get_primary(Object.keys(characters_info));

    connection.on_close = connection => {
      managers.mam.unregister(connection.get_id());
    };

    managers.world_server.send(connection.get_id(), "accept_connection", {
      characters_info,
      am_data
    });
    return true;
  },
  data_character: (connection, received_data, managers) => {
    const { character_id } = received_data;

    const character = managers.characters._get_character_by_id(character_id);

    managers.world_server.send(connection.get_id(), "data_character", {
      character_id,
      id: character.get_id(),
      name: character.get_name(),
      password: character.get_password(),
      outfit: character.get_outfit(),
      default_land_id: character.get_default_land_id(),
      default_system_id: character.get_default_system_id(),
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
    const { character_id } = received_data;

    const packet_data = { character_id };

    const land = managers.characters.get_land(character_id);
    if (land != null) {
      packet_data.id = land._data.id;
      packet_data.map = land._data.map;
    }

    managers.world_server.send(connection.get_id(), "data_land", packet_data);
  },
  data_world: (connection, received_data, managers) => {
    const { character_id } = received_data;

    const lands_map = {};
    const characters_map = {};
    const environment_objects_map = {};
    const virtual_worlds_map = {};

    for (const land of Object.values(
      managers.world_server.root_module.data.lands_map
    )) {
      lands_map[land.get_id()] = { name: land._data.name };
    }

    for (const character of Object.values(
      managers.world_server.root_module.data.characters_map
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
      managers.world_server.root_module.data.environment_objects_map
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
      managers.world_server.root_module.data.virtual_worlds_map
    )) {
      const object_data = {
        name: virtual_world._data.name,
        characters_list: [...virtual_world._data.characters_list]
      };

      virtual_worlds_map[virtual_world.get_id()] = object_data;
    }

    managers.world_server.send(connection.get_id(), "data_world", {
      character_id,
      lands_map,
      characters_map,
      environment_objects_map,
      virtual_worlds_map
    });
  },
  character_change_position: (connection, received_data, managers) => {
    const { character_id, position_x } = received_data;

    managers.characters.change_position(character_id, position_x);

    data_world(connection, received_data, managers);
  },
  character_change_land: (connection, received_data, managers) => {
    const { character_id, land_id } = received_data;

    managers.characters.change_land(character_id, land_id);

    data_world(connection, received_data, managers);
  },
  character_add_friend: (connection, received_data, managers) => {
    const { character_id, name } = received_data;

    managers.characters.add_friend_if_exist(character_id, name);

    data_character(connection, received_data, managers);
  },
  character_remove_friend: (connection, received_data, managers) => {
    const { character_id, name } = received_data;

    managers.characters.remove_friend_if_exist(character_id, name);

    data_character(connection, received_data, managers);
  },
  character_change_state: (connection, received_data, managers) => {
    const { character_id, name } = received_data;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_state(name);

    data_character(connection, received_data, managers);
  },
  character_change_action: (connection, received_data, managers) => {
    const { character_id, name } = received_data;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_action(name);

    data_character(connection, received_data, managers);
  },
  character_change_activity: (connection, received_data, managers) => {
    const { character_id, name } = received_data;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_activity(name);

    data_character(connection, received_data, managers);
  },
  action_message: (connection, received_data, managers) => {
    const { character_id, name, text } = received_data;

    const character = managers.characters._get_character_by_id(character_id);

    const from_character_name = character.get_name();
    const to_character_connection_id = managers.characters.get_connection_id(
      managers.characters.get_id_by_name(name)
    );

    if (
      text == null ||
      from_character_name == null ||
      to_character_connection_id == null
    ) {
      managers.world_server.handle_error(
        connection,
        received_data,
        managers,
        "Wrong action message data."
      );
      return;
    }

    managers.world_server.send(connection.get_id(), "action_message", {
      character_id,
      name: from_character_name,
      text: text
    });
  },
  script_action: (connection, received_data, managers) => {
    const { character_id, object_id, action_id, dynamic_args } = received_data;

    managers.main_world.process_action(object_id, action_id, {
      character_id,
      ...dynamic_args
    });
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
    const { character_id } = received_data;

    managers.characters.leave_virtual_world(character_id);
  },
  virtual_world: (connection, received_data, managers) => {
    const { character_id } = received_data;

    managers.virtual_worlds.process_packet_received_from_character(
      character_id,
      received_data
    );
  }
};

class WorldServer extends Managers.Server {
  constructor({ root_module, config }) {
    super({ root_module, config, parse_packet: ParsePacket });
  }
}

module.exports = WorldServer;
