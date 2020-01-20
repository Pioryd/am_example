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

    this.actions_map = {
      enter_virtual_world: (static_args, dynamic_args) => {
        const { virtual_world_id } = static_args;
        const { character_id } = dynamic_args;

        this.module_world.managers.characters.enter_virtual_world(
          character_id,
          virtual_world_id
        );
      }
    };
  }

  initialize() {}

  terminate() {}

  poll() {}

  process_action(object_id, action_id, dynamic_args) {
    if (!(object_id in this.module_world.data.environment_objects_map)) return;

    const environment_object = this.module_world.data.environment_objects_map[
      object_id
    ];

    environment_object.process_action_script(
      action_id,
      dynamic_args,
      this.module_world.managers
    );
  }

  create_action_script_as_string(action_id, static_args) {
    if (!(action_id in this.actions_map)) {
      logger.error("Wrong action ID:", action_id);
      return;
    }

    return `(dynamic_args, managers) => {
      managers.main_world.actions_map["${action_id}"](
        ${JSON.stringify(static_args)}, 
        dynamic_args
      );
    }`;
  }

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

    // Only 1 world for testing needs
    // Create virtual world
    const virtual_world = new Objects.VirtualWorld(
      {
        id: ObjectID().toHexString(),
        name: "virtual_world_1",
        url: "http://localhost:4001",
        characters_list: []
      },
      this.module_world.managers.virtual_worlds
    );

    this.module_world.data.virtual_worlds_map[
      virtual_world.get_id()
    ] = virtual_world;

    for (let id = 0; id < 5; id++) {
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

      // Create character
      const character = new Objects.Character({
        id: ObjectID().toHexString(),
        name: "AM_" + id,
        password: "123",
        default_land_id: land.get_id(),
        virtual_world_id: "",
        state: "",
        action: "",
        activity: "",
        friends_list: []
      });
      this.module_world.data.characters_map[character.get_id()] = character;

      // Place character at land
      const character_position = Util.get_random_int(0, land_size - 1);
      land._data.map[character_position].characters_list.push(
        character.get_id()
      );

      // Place portal at land
      const environment_object = new Objects.EnvironmentObject({
        id: ObjectID().toHexString(),
        type: "portal",
        name: "portal_" + id,
        action_scripts_list: [
          {
            id: "enter_virtual_world",
            script: this.create_action_script_as_string("enter_virtual_world", {
              virtual_world_id: virtual_world.get_id()
            })
          }
        ]
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

      // Place some objects
      const objects_types_list = [
        "cactus",
        "rock",
        "mushroom_red",
        "spikes",
        "bush",
        "plant",
        "mushroom_brown"
      ];
      for (let pos = 0; pos < land_size; pos++) {
        if (pos === portal_position) continue;

        const object_type =
          objects_types_list[
            Util.get_random_int(0, objects_types_list.length - 1)
          ];

        const environment_object = new Objects.EnvironmentObject({
          id: ObjectID().toHexString(),
          type: object_type,
          name: object_type.replace("_", " "),
          action_scripts_list: []
        });
        this.module_world.data.environment_objects_map[
          environment_object.get_id()
        ] = environment_object;

        land._data.map[pos].objects_list.push(environment_object.get_id());
      }
    }

    // Set global settings
    this.module_world.data.settings.generated = true;
    this.module_world.data.settings.admin_login = "admin";
    this.module_world.data.admin_password = "123";
  }
}

module.exports = MainWorld;
