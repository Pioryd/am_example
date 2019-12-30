const { Land } = require("../land");
const { Character } = require("../character");
const { EnvironmentObject } = require("../environment_object");
const { Util } = require("am_framework");
const ObjectID = require("bson-objectid");
const log = require("simple-node-logger").createSimpleLogger();
/*
Responsible for:
  - world logic between object
*/
class World {
  constructor(module_world) {
    this.module_world = module_world;

    this.module_world.event_emitter.on(
      "character_leave_object",
      this.on_character_leave_object
    );
    this.module_world.event_emitter.on(
      "character_enter_object",
      this.on_character_enter_object
    );
  }

  poll() {}

  get_lands() {
    return this.module_world.data.lands_map;
  }

  get_characters() {
    return this.module_world.data.characters_map;
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
    log.info("Generating new world...");

    for (let id = 0; id < 5; id++) {
      // Create character
      const character = new Character({
        name: "AM_" + id,
        password: "123",
        state: "",
        action: "",
        activity: "",
        friends_list: []
      });
      this.module_world.data.characters_map[character.get_name()] = character;

      // Create land
      const land = new Land(
        {
          id: ObjectID().toHexString(),
          name: "land_" + id,
          map: []
        },
        this.event_emiter
      );
      const land_size = Util.get_random_int(10, 20);
      for (let i = 0; i < land_size; i++)
        land._data.map.push({ characters_list: [], objects_list: [] });
      this.module_world.data.lands_map[land.get_id()] = land;

      // Place character at land
      const character_position = Util.get_random_int(0, land_size - 1);
      land._data.map[character_position].characters_list.push(
        character._data.name
      );

      // Place portal at land
      const environment_object = new EnvironmentObject({
        id: ObjectID().toHexString(),
        type: "portal",
        name: "portal_" + id
      });
      this.module_world.data.environment_objects_map[
        environment_object.get_id()
      ] = environment_object;

      const portal_position = Util.get_random_int(0, land_size - 1);
      if (portal_position === character_position)
        if (portal_position - 1 < 0) portal_position++;
      land._data.map[portal_position].objects_list.push(
        environment_object.get_id()
      );

      // Place some trees
      let number_of_trees = Util.get_random_int(1, 4);

      for (let i = 0; i < number_of_trees; i++) {
        const environment_object = new EnvironmentObject({
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

    this.module_world.data.settings.generated = true;
    this.module_world.data.settings.admin_login = "admin";
    this.module_world.data.admin_password = "123";
  }

  on_character_enter_object(name, objects_list) {}

  on_character_leave_object(name, objects_list) {}
}

module.exports = World;
