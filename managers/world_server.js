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
    change_area: ({ root_module, character_id, timeout, args }) => {
      const { land_id } = args;
      root_module.managers.characters.change_land(character_id, land_id);
    }
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

    mirror.data_world = {
      lands_map,
      characters_map,
      environment_objects_map
    };

    // data_virtual_world
    const data_virtual_world = {};
    for (const vw_name of Object.keys(managers.virtual_worlds.vw_class_map))
      data_virtual_world[vw_name] = managers.characters.get_virtual_world_data(
        character_id,
        vw_name
      );

    mirror.data_virtual_world = data_virtual_world;

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
  }
};

class WorldServer extends Managers.server {
  constructor({ root_module, config }) {
    super({ root_module, config, parse_packet });
  }

  send(connection_id, packet_id, packet_data) {
    super.send(connection_id, "root", { packet_id, packet_data });
  }
}

module.exports = WorldServer;
