const { ParsePacket } = require("./parse_packet");
const { Land } = require("./land");
const { Character } = require("./character");
const { EnvironmentObject } = require("./environment_object");
const { Database, Util, Stopwatch } = require("am_framework");
const CharacterModel = require("../../models/character");
const LandModel = require("../../models/land");
const SettingsModel = require("../../models/settings");
const log = require("simple-node-logger").createSimpleLogger();

const Admin_Account_ID = -1;
class Manager {
  constructor({ application }) {
    this.database = new Database({
      url: "mongodb://127.0.0.1:27017",
      name: "am_world"
    });
    this._lands_map = {};
    this._characters_map = {};
    this.server = application.web_server;
    this.ready = false;
    this.settings = { generated: false, admin_login: "", admin_password: "" };

    this.stopwatches_map = { database_save: new Stopwatch(10 * 1000) };
  }

  poll() {
    if (!this.ready) return;

    if (this.stopwatches_map.database_save.is_elapsed()) {
      log.info(`[${Util.get_time_hms()}] Auto save to database`);
      this.database_save_data();
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
      const land = new Land({ id: id, name: "land_" + id, map: [] });
      const size = Util.get_random_int(10, 20);
      for (let i = 0; i < size; i++)
        land._data.map.push({ characters_list: [], objects_list: [] });
      this._lands_map[id] = land;

      // Place character at land
      land._data.map[Util.get_random_int(0, size - 1)].characters_list.push(
        character._data.name
      );

      // const EnvironmentObjectList = {
      //   house: { id: 1, size: 3 },
      //   tree: { id: 2, size: 3 }
      // };

      // // Insert environment object - house
      // if (Util.get_random_int(0, 1) === 1) {
      //   const object_name = "house";
      //   land.objects_list.push(
      //     new EnvironmentObject(
      //       EnvironmentObjectList[object_name].id,
      //       object_name,
      //       EnvironmentObjectList[object_name].size
      //     )
      //   );
      // }
      // // Insert environment object - tree
      // for (let k = 0; k < 3; k++) {
      //   if (Util.get_random_int(0, 1) === 1) {
      //     const object_name = "tree";
      //     land.objects_list.push(
      //       new EnvironmentObject(
      //         EnvironmentObjectList[object_name].id,
      //         object_name,
      //         EnvironmentObjectList[object_name].size
      //       )
      //     );
      //   }
      // }
    }

    this.settings.generated = true;
    this.settings.admin_login = "admin";
    this.settings.admin_password = "123";
  }

  database_setup_models() {
    SettingsModel.setup(this.database.connection);
    CharacterModel.setup(this.database.connection);
    LandModel.setup(this.database.connection);
  }

  database_save_data(step = "connect", error, results) {
    log.info("Save data to database, step:", step);

    if (error != null) log.error(error);

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          this.database_setup_models();
          this.database_save_data("connected");
        });
        break;
      case "connected":
        SettingsModel.save(this.settings, (...args) => {
          this.database_save_data(...args);
        });
        break;
      case "settings.save":
        CharacterModel.save(Object.values(this._characters_map), (...args) => {
          this.database_save_data(...args);
        });
        break;
      case "character.save":
        LandModel.save(Object.values(this._lands_map), (...args) => {
          this.database_save_data(...args);
        });
        break;
      case "land.save":
        break;
    }
  }

  database_load_data(step = "connect", error, results) {
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
        const land = new Land({ ...result._doc });
        delete land._id;
        delete land.__v;

        this._lands_map[land.get_id()] = land;
      }
    };

    const check_collections = collections => {
      this.database_setup_models();

      const collections_names = ["settings", "character", "land"];

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

          this.database_load_data("check_loaded_data");

          return;
        }
      }

      this.database_load_data("connected");
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
        this.database_load_data("check_loaded_data");
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

  character_get_by_id(id) {
    if (id in this._characters_map) return this._characters_map[id];
  }

  character_get_id_by_name(name) {
    if (name == null) return;

    // Admin
    if (this.settings.admin_login.toLowerCase() === name.toLowerCase())
      return Admin_Account_ID;

    // Characters
    for (const [id, character] of Object.entries(this._characters_map))
      if (character.get_name().toLowerCase() === name.toLowerCase()) return id;
  }

  character_get_name_by_id(id) {
    if (id == null) return;

    // Admin
    if (Admin_Account_ID == id) return this.settings.admin_login;

    // Characters
    const character = this.character_get_by_id(id);
    if (character == null) return;
    return character.get_name();
  }

  character_get_connection_id(id) {
    const character = this.character_get_by_id(id);
    if (character == null) return;
    return character.get_connection_id();
  }

  character_get_land(character_name) {
    for (const land of Object.values(this._lands_map))
      if (land.get_character_position(character_name) != null) return land;
  }

  character_change_position(id, position) {
    const character = this.character_get_by_id(id);
    if (character == null) return;

    for (const land of Object.values(this._lands_map))
      land.change_character_position(character.get_name(), position);
  }

  character_change_land(id, land_id) {
    if (!(land_id in this._lands_map)) return;

    const character = this.character_get_by_id(id);
    if (character == null) return;

    for (const land of Object.values(this._lands_map)) {
      if (land.get_character_position(character.get_name()) != null) {
        land.remove_character(character.get_name());
        break;
      }
    }

    const new_land = this._lands_map[land_id];
    new_land.insert_character(character.get_name());
  }

  character_add_friend_if_exist(character_name, friend_name) {
    const character = this.character_get_by_id(character_name);
    const friend = this.character_get_by_id(friend_name);

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
    for (const [id, character] of Object.entries(this._characters_map)) {
      console.log(character.get_name().toLowerCase(), login.toLowerCase());
      console.log(
        character.get_password().toLowerCase(),
        password.toLowerCase()
      );
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
}

module.exports = { Manager };
