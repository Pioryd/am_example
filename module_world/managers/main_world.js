const path = require("path");
const { Util, Stopwatch, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const ObjectID = require(path.join(global.node_modules_path, "bson-objectid"));

const Objects = require("../objects");

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

/*
Responsible for:
  - world logic between object
*/
class MainWorld {
  constructor(root_module) {
    this.root_module = root_module;

    this.stopwatches_map = {
      energy: new Stopwatch(1 * 1000),
      stress: new Stopwatch(1 * 1000)
    };

    this.actions_map = {
      enter_virtual_world: (static_args, dynamic_args) => {
        const { virtual_world_id } = static_args;
        const { character_id } = dynamic_args;

        this.root_module.managers.characters.enter_virtual_world(
          character_id,
          virtual_world_id
        );
      }
    };
  }

  initialize() {}

  terminate() {}

  poll() {
    if (this.stopwatches_map.energy.is_elapsed()) {
      const decrease_energy = () => {
        for (const [id, character] of Object.entries(
          this.root_module.data.characters_map
        )) {
          if (character.get_virtual_world_id() === "") {
            this.root_module.managers.characters.change_energy(
              id,
              character.get_energy() - 5
            );
          }
        }
      };
      const increase_energy = () => {
        for (const [id, character] of Object.entries(
          this.root_module.data.characters_map
        )) {
          if (character.get_virtual_world_id() != "") {
            this.root_module.managers.characters.change_energy(
              id,
              character.get_energy() + 10
            );
          }
        }
      };

      decrease_energy();
      increase_energy();
      this.stopwatches_map.energy.reset();
    }

    if (this.stopwatches_map.stress.is_elapsed()) {
      const decrease_stress = () => {
        for (const [id, character] of Object.entries(
          this.root_module.data.characters_map
        )) {
          if (character.get_virtual_world_id() === "") {
            this.root_module.managers.characters.change_stress(
              id,
              character.get_stress() - 5
            );
          }
        }
      };
      const increase_stress = () => {
        for (const [id, character] of Object.entries(
          this.root_module.data.characters_map
        )) {
          if (character.get_virtual_world_id() != "") {
            this.root_module.managers.characters.change_stress(
              id,
              character.get_stress() + 5
            );
          }
        }
      };

      decrease_stress();
      increase_stress();
      this.stopwatches_map.stress.reset();
    }
  }

  process_action(object_id, action_id, dynamic_args) {
    if (!(object_id in this.root_module.data.environment_objects_map)) return;

    const environment_object = this.root_module.data.environment_objects_map[
      object_id
    ];

    environment_object.process_action_script(
      action_id,
      dynamic_args,
      this.root_module.managers
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
      this.root_module.managers.virtual_worlds
    );

    this.root_module.data.virtual_worlds_map[
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
        this.root_module
      );
      const land_size = Util.get_random_int(7, 12);
      for (let i = 0; i < land_size; i++)
        land._data.map.push({ characters_list: [], objects_list: [] });
      this.root_module.data.lands_map[land.get_id()] = land;

      // Create character
      const character = new Objects.Character({
        id: ObjectID().toHexString(),
        name: "AM_" + id,
        password: "123",
        // Character is 0 with own human outfit
        outfit: id === 0 ? 0 : Util.get_random_int(1, 3),
        default_land_id: land.get_id(),
        default_system_id: "5e6fc6c870d8fc264068c143",
        virtual_world_id: "",
        state: "",
        action: "",
        activity: "",
        energy: 100,
        stress: 0,
        friends_list: []
      });
      this.root_module.data.characters_map[character.get_id()] = character;

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
      this.root_module.data.environment_objects_map[
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
        this.root_module.data.environment_objects_map[
          environment_object.get_id()
        ] = environment_object;

        land._data.map[pos].objects_list.push(environment_object.get_id());
      }
    }

    // Set global settings
    this.root_module.data.settings.generated = true;
    this.root_module.data.settings.admin_login = "admin";
    this.root_module.data.admin_password = "123";
  }
}

module.exports = MainWorld;
