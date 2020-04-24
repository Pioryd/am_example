const path = require("path");
const { Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const QUEUE_LIMIT = 10;

const API_MAP = {
  character: {
    change_land: ({ root_module, character_id, timeout, args }) => {
      const { land_id } = args;
      root_module.managers.characters.change_land(character_id, land_id);
    },
    leave_virtual_world: ({ root_module, character_id, timeout, args }) => {
      root_module.managers.characters.leave_virtual_world(character_id);
    },
    use_doors: ({ root_module, character_id, timeout, args }) => {
      // TODO find doors id
      let doors_id = null;
      const is_door = (id) => {
        if (!(id in root_module.data.environment_objects_map)) return false;
        return (
          root_module.data.environment_objects_map[id]._data.type === "portal"
        );
      };
      const land = root_module.managers.characters.get_land(character_id);
      if (land == null) logger.error("Land is null");
      for (const point of land._data.map) {
        for (const object_id of point.objects_list) {
          if (is_door(object_id)) {
            doors_id = object_id;
            break;
          }
        }
      }

      if (doors_id == null) logger.error(`Unable to find doors`);

      const object_id = doors_id;
      const action_id = 0;
      const dynamic_args = {};

      root_module.managers.main_world.process_action(object_id, action_id, {
        character_id,
        ...dynamic_args
      });
    },
    script_action: ({ root_module, character_id, timeout, args }) => {
      const { object_id, action_id, dynamic_args } = args;

      managers.main_world.process_action(object_id, action_id, {
        character_id,
        ...dynamic_args
      });
    }
  },
  system: {
    // form_run: ({ root, timeout, args }) => {
    //   const { name } = args;
    //   root.system._current_program._run_form(name);
    // }
  },
  virtual_world: {
    // draw_choice:  ({ root, timeout, args }) => {
    //     remote_fn: ({root , timeout, args }) => {
    //     const min = 0;
    //     const max = 2;
    //     const number = Math.floor(Math.random() * (max - min + 1)) + min;
    //     return number;
    // },
    make_choice: ({ root_module, character_id, timeout, args }) => {
      const { choice } = args;
      const { data } = root_module;

      if (choice == null) return;

      // // Game in virtual world
      // if (
      //   data.characters_info[root.ext.character_id].virtual_world_data == null
      // ) {
      //   managers.virtual_worlds.process_packet_received_from_character(
      //     character_id,
      //     {
      //       character_id,
      //       packet_id: "data",
      //       packet_data: {}
      //     }
      //   );
      //   return;
      // }

      const choices = ["rock", "paper", "scissors"];
      const chosen_choice = choices[choice];

      root_module.managers.virtual_worlds.process_packet_received_from_character(
        character_id,
        {
          character_id,
          packet_id: "message",
          packet_data: { text: chosen_choice }
        }
      );
      root_module.managers.virtual_worlds.process_packet_received_from_character(
        character_id,
        {
          character_id,
          packet_id: "data",
          packet_data: {}
        }
      );
    }
  },
  enter_virtual_world: ({ root_module, character_id, timeout, args }) => {
    // TODO get virtual world by character_id
    // dodać specjalna tablice
    managers.characters.enter_virtual_world(character_id, virtual_world_id);
  }
};

const parse_packet = {
  accept_connection: function (connection, received_data, managers) {
    const { login, password, characters } = received_data;

    const config = managers.world_server.config;
    if (
      login == null ||
      password == null ||
      config.login.toLowerCase() !== login.toLowerCase() ||
      config.password !== password.toLowerCase()
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

    connection.on_close = (connection) => {
      managers.mam.unregister(connection.get_id());
    };

    managers.world_server.send(connection.get_id(), "accept_connection", {
      characters_info,
      am_data
    });
    return true;
  },
  data_mirror: function (connection, received_data, managers) {
    const { character_id } = received_data;
    const mirror = {};

    // data_character
    const character = managers.characters._get_character_by_id(character_id);
    mirror.data_character = {
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
    };

    // data_land
    const land = managers.characters.get_land(character_id);
    mirror.data_land = {};
    if (land != null) {
      mirror.data_land = {
        id: land._data.id,
        map: land._data.map
      };
    }

    // data_world
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

    mirror.data_world = {
      lands_map,
      characters_map,
      environment_objects_map,
      virtual_worlds_map
    };

    managers.world_server.send(connection.get_id(), "data_mirror", {
      character_id,
      mirror
    });
  },
  process_api: function (connection, received_data, managers) {
    const { character_id, api_name, timeout, args } = received_data;
    try {
      let api = null;
      eval(`api = API_MAP.${api_name}`);
      api({
        root_module: managers.world_server.root_module,
        character_id,
        timeout,
        args
      });
    } catch (e) {
      logger.error(
        `Unable to process api. Error: ${e.message}. Data ${JSON.stringify(
          { character_id, api_name, timeout, args },
          null,
          2
        )}`
      );
    }
  },
  character_change_position: function (connection, received_data, managers) {
    const { character_id, position_x } = received_data;

    managers.characters.change_position(character_id, position_x);
  },
  character_change_land: function (connection, received_data, managers) {
    const { character_id, land_id } = received_data;

    managers.characters.change_land(character_id, land_id);
  },
  character_add_friend: function (connection, received_data, managers) {
    const { character_id, name } = received_data;

    managers.characters.add_friend_if_exist(character_id, name);
  },
  character_remove_friend: function (connection, received_data, managers) {
    const { character_id, name } = received_data;

    managers.characters.remove_friend_if_exist(character_id, name);
  },
  character_change_state: function (connection, received_data, managers) {
    const { character_id, name } = received_data;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_state(name);
  },
  character_change_action: function (connection, received_data, managers) {
    const { character_id, name } = received_data;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_action(name);
  },
  character_change_activity: function (connection, received_data, managers) {
    const { character_id, name } = received_data;

    const character = managers.characters._get_character_by_id(character_id);
    character._change_activity(name);
  },
  action_message: function (connection, received_data, managers) {
    const { character_id, name, text } = received_data;

    const character = managers.characters._get_character_by_id(character_id);

    const from_character_name = character.get_name();
    const to_character_connection_id = managers.mam._get_mam_key_by_character_id(
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

    if (!(character_id in managers.root_module.data.action_messages_map))
      managers.root_module.data.action_messages_map[character_id] = [];

    const action_messages =
      managers.root_module.data.action_messages_map[character_id];

    action_messages.push({
      id: new Date(),
      action: { name: from_character_name, text: text }
    });
    while (action_messages.length > QUEUE_LIMIT) action_messages.pop();
  },
  virtual_world: function (connection, received_data, managers) {
    const { character_id } = received_data;

    managers.virtual_worlds.process_packet_received_from_character(
      character_id,
      received_data
    );
  }
};

class WorldServer extends Managers.Server {
  constructor({ root_module, config }) {
    super({ root_module, config, parse_packet });
  }

  send(connection_id, packet_id, packet_data) {
    super.send(connection_id, "root", { packet_id, packet_data });
  }
}

module.exports = WorldServer;
