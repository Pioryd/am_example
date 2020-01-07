const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const { Util } = require(path.join(global.node_modules_path, "am_framework"));
const ObjectID = require(path.join(global.node_modules_path, "bson-objectid"));

const Objects = require("../objects");

/*
Responsible for:
  - world logic between object
*/
class MainWorld {
  constructor(module_world) {
    this.module_world = module_world;
  }

  initialize() {}

  terminate() {}

  poll() {}

  /*
  NOTE:
    Currently the form of this function  cannot use object/manager functions,
    because it force create and place objects in fast way,
    without deal with world logic.

  TODO:
    Create generating world logic based on world logic with using 
    methods of manager and objects.
  */
  generate_world() {
    logger.info("Generating new world...");

    for (let id = 0; id < 5; id++) {
      // Create character
      const character = new Objects.Character({
        id: ObjectID().toHexString(),
        name: "AM_" + id,
        password: "123",
        state: "",
        action: "",
        activity: "",
        friends_list: []
      });
      this.module_world.data.characters_map[character.get_id()] = character;

      // Create land
      const land = new Objects.Land(
        {
          id: ObjectID().toHexString(),
          name: "land_" + id,
          map: []
        },
        this.module_world
      );
      const land_size = Util.get_random_int(7, 12);
      for (let i = 0; i < land_size; i++)
        land._data.map.push({ characters_list: [], objects_list: [] });
      this.module_world.data.lands_map[land.get_id()] = land;

      // Place character at land
      const character_position = Util.get_random_int(0, land_size - 1);
      land._data.map[character_position].characters_list.push(
        character.get_id()
      );

      // Place portal at land
      const environment_object = new Objects.EnvironmentObject({
        id: ObjectID().toHexString(),
        type: "portal",
        name: "portal_" + id
      });
      this.module_world.data.environment_objects_map[
        environment_object.get_id()
      ] = environment_object;

      let portal_position = Util.get_random_int(0, land_size - 1);
      if (portal_position === character_position)
        if (portal_position - 1 < 0) portal_position++;
      land._data.map[portal_position].objects_list.push(
        environment_object.get_id()
      );

      // Place some trees
      let number_of_trees = Util.get_random_int(1, 3);

      for (let i = 0; i < number_of_trees; i++) {
        const environment_object = new Objects.EnvironmentObject({
          id: ObjectID().toHexString(),
          type: "tree",
          name: "tree"
        });
        this.module_world.data.environment_objects_map[
          environment_object.get_id()
        ] = environment_object;

        const tree_position = Util.get_random_int(0, land_size - 1);
        if (tree_position === character_position)
          if (tree_position - 1 < 0) tree_position++;
        land._data.map[tree_position].objects_list.push(
          environment_object.get_id()
        );
      }
    }

    // Add virtual worlds
    const vw_manager = this.module_world.managers.virtual_worlds;
    const virtual_world = new Objects.VirtualWorld(
      {
        id: ObjectID().toHexString(),
        name: "test",
        url: "http://localhost:4001",
        characters_list: []
      },
      vw_manager.process_packet_received_from_user,
      vw_manager.process_user_packet_received_from_virtual_world
    );
    this.module_world.data.virtual_worlds_map[
      virtual_world.get_id()
    ] = virtual_world;

    this.module_world.data.settings.generated = true;
    this.module_world.data.settings.admin_login = "admin";
    this.module_world.data.admin_password = "123";
  }
}

module.exports = MainWorld;
