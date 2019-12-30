const { ParsePacket } = require("./parse_packet");
const { Land } = require("./land");
const { Character } = require("./character");
const { EnvironmentObject } = require("./environment_object");
const { Database, Util, Stopwatch } = require("am_framework");
const CharacterModel = require("../../models/character");
const LandModel = require("../../models/land");
const SettingsModel = require("../../models/settings");
const EnvironmentObjectModel = require("../../models/environment_object");
const log = require("simple-node-logger").createSimpleLogger();
const ObjectID = require("bson-objectid");

class Manager {
  constructor({ application }) {
    this.database = new Database({
      url: "mongodb://127.0.0.1:27017",
      name: "am_world"
    });
    this._lands_map = {};
    this._characters_map = {};
    this._environment_objects_map = {};
    this.server = application.web_server;
    this.event_emiter = application;
    this.ready = false;
    this.settings = { generated: false, admin_login: "", admin_password: "" };

    this.stopwatches_map = { database_save: new Stopwatch(5 * 1000) };

    this.event_emiter.on(
      "character_leave_object",
      this.on_character_leave_object
    );
    this.event_emiter.on(
      "character_enter_object",
      this.on_character_enter_object
    );
  }

  poll() {
    if (!this.ready) return;

    if (this.stopwatches_map.database_save.is_elapsed()) {
      // change to backup_db
      // log.info("Auto save to database");
      // this.database_save_data();
      this.stopwatches_map.database_save.reset();
    }
  }

  create_parse_packet_dict() {
    let parse_packet_dict = {};
    for (const [packet_id] of Object.entries(ParsePacket)) {
      parse_packet_dict[packet_id] = (connection, data) => {
        return ParsePacket[packet_id](connection, data, this);
      };
    }
    return parse_packet_dict;
  }

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
      this._characters_map[character._data.name] = character;

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
      this._lands_map[id] = land;

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
      this._environment_objects_map[
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
        this._environment_objects_map[
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

    this.settings.generated = true;
    this.settings.admin_login = "admin";
    this.settings.admin_password = "123";
  }

  database_setup_models() {
    SettingsModel.setup(this.database.connection);
    CharacterModel.setup(this.database.connection);
    LandModel.setup(this.database.connection);
    EnvironmentObjectModel.setup(this.database.connection);
  }

  /* 
    Save data is NOT safe, because data can be changed while function 
    is working.  
  */
  database_save_data({
    step = "connect",
    error = null,
    results = [],
    on_success = null
  }) {
    log.info("Save data to database, step:", step);

    if (error != null) log.error(error);

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          this.database_setup_models();
          this.database_save_data({
            step: "connected",
            on_success: on_success
          });
        });
        break;
      case "connected":
        SettingsModel.save(this.settings, (...args) => {
          this.database_save_data(
            Object.assign(...args, { on_success: on_success })
          );
        });
        break;
      case "settings.save":
        CharacterModel.save(Object.values(this._characters_map), (...args) => {
          console.log();
          this.database_save_data(
            Object.assign(...args, { on_success: on_success })
          );
        });
        break;
      case "character.save":
        LandModel.save(Object.values(this._lands_map), (...args) => {
          this.database_save_data(
            Object.assign(...args, { on_success: on_success })
          );
        });
        break;
      case "land.save":
        EnvironmentObjectModel.save(
          Object.values(this._environment_objects_map),
          (...args) => {
            this.database_save_data(
              Object.assign(...args, { on_success: on_success })
            );
          }
        );
        break;
      case "environment_object.save":
        on_success();
        break;
    }
  }

  database_load_data({ step = "connect", error = null, results = [] }) {
    const set_settings = results_list => {
      if (results_list.length <= 0) return;
      this.settings = results_list[0]._doc;
      delete this.settings._id;
      delete this.settings.__v;
    };

    const set_characters = results_list => {
      for (const result of results_list) {
        const character = new Character({ ...result._doc });
        delete character._data._id;
        delete character._data.__v;

        this._characters_map[character.get_name()] = character;
      }
    };

    const set_lands = results_list => {
      for (const result of results_list) {
        const land = new Land({ ...result._doc }, this.event_emiter);
        delete land._id;
        delete land.__v;

        this._lands_map[land.get_id()] = land;
      }
    };

    const set_environment_objects = results_list => {
      for (const result of results_list) {
        const environment_object = new EnvironmentObject({ ...result._doc });
        delete environment_object._id;
        delete environment_object.__v;

        this._environment_objects_map[
          environment_object.get_id()
        ] = environment_object;
      }
    };

    const check_collections = collections => {
      this.database_setup_models();

      const collections_names = [
        "settings",
        "character",
        "land",
        "environment_object"
      ];

      for (const collection_name of collections_names) {
        let found = false;
        for (const collection of collections) {
          if (collection_name === collection.name) {
            found = true;
            break;
          }
        }

        if (!found) {
          log.info(
            "Database does not include needed collections. Existed:",
            collections
          );

          this.generate_world();

          this.database_load_data({ step: "check_loaded_data" });

          return;
        }
      }

      this.database_load_data({ step: "connected" });
    };

    const check_loaded_data = () => {
      if (this.settings.generated === false) this.generate_world();

      this.ready =
        this.settings.generated === true &&
        Object.keys(this._lands_map).length > 0 &&
        Object.keys(this._characters_map).length > 0;

      log.info(`Data is ${this.ready ? "" : "NOT"} loaded correctly.`);
    };

    log.info("Load data from database, step:", step);

    if (!Array.isArray(results)) results = results == null ? [] : [results];

    if (error != null) log.info("database_load_data error:", error);

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          check_collections(collections);
        });
        break;
      case "connected":
        SettingsModel.load((...args) => {
          this.database_load_data(...args);
        });
        break;
      case "settings.load":
        set_settings(results);
        CharacterModel.load_all((...args) => {
          this.database_load_data(...args);
        });
        break;
      case "character.load_all":
        set_characters(results);
        LandModel.load_all((...args) => {
          this.database_load_data(...args);
        });
        break;
      case "land.load_all":
        set_lands(results);
        EnvironmentObjectModel.load_all((...args) => {
          this.database_load_data(...args);
        });
        break;
      case "environment_object.load_all":
        set_environment_objects(results);
        this.database_load_data({ step: "check_loaded_data" });
        break;
      case "check_loaded_data":
        check_loaded_data(); // must be as last function
        break;
      default:
        break;
    }
  }

  character_is_exist(name) {
    return name in this._characters_map && this._characters_map[name] != null;
  }

  character_get(name) {
    if (name in this._characters_map) return this._characters_map[name];
  }

  character_get_connection_id(character_name) {
    const character = this.character_get(character_name);
    if (character == null) return;
    return character.get_connection_id();
  }

  character_get_land(character_name) {
    for (const land of Object.values(this._lands_map))
      if (land.get_character_position(character_name) != null) return land;
  }

  character_change_position(character_name, position) {
    for (const land of Object.values(this._lands_map))
      land.change_character_position(character_name, position);
  }

  character_change_land(character_name, land_id) {
    if (!(land_id in this._lands_map)) return;

    for (const land of Object.values(this._lands_map)) {
      if (land.get_character_position(character_name) != null) {
        land.remove_character(character_name);
        break;
      }
    }

    const new_land = this._lands_map[land_id];
    new_land.insert_character(character_name);
  }

  character_add_friend_if_exist(character_name, friend_name) {
    const character = this.character_get(character_name);
    const friend = this.character_get(friend_name);

    if (character == null || friend == null) return;

    character.add_friend(friend_name);
  }

  character_log_off(name) {
    if (name == null || !(name in this._characters_map)) return;

    return this._characters_map[name].set_connection_id(undefined);
  }

  character_authenticate(connection_id, login, password) {
    if (connection_id == null || login == null || password == null) return;

    // Admin
    // Many accounts(sockets) can be logged as admin,
    // for example for multi-screen
    if (
      this.settings.admin_login.toLowerCase() === login.toLowerCase() &&
      this.settings.admin_password === password.toLowerCase()
    )
      return;

    // Characters
    // Only one account per character
    for (const character of Object.values(this._characters_map)) {
      if (
        character.get_name().toLowerCase() === login.toLowerCase() &&
        character.get_password().toLowerCase() === password.toLowerCase()
      ) {
        if (character.get_connection_id() != null)
          return (
            "Another socket is logged in: " + character.get_connection_id()
          );

        character.set_connection_id(connection_id);
        return;
      }
    }
    return "Wrong authentication data";
  }

  on_character_enter_object(name, objects_list) {}

  on_character_leave_object(name, objects_list) {}
}

module.exports = { Manager };
