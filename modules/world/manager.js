const { ParsePacket } = require("./parse_packet");
const { Land, generate_random_land } = require("./land");
const { Character } = require("./character");
const { EnvironmentObject } = require("./environment_object");
const { Database, Util, Stopwatch } = require("am_framework");
const CharacterModel = require("../../models/character");
const LandModel = require("../../models/land");
const SettingsModel = require("../../models/settings");
const log = require("simple-node-logger").createSimpleLogger();

const AdminAccount = { id: -1, login: "admin", password: "123" };
class Manager {
  constructor({ application }) {
    this.database = new Database({
      url: "mongodb://127.0.0.1:27017",
      name: "am_world"
    });
    this.lands_map = {};
    this.characters_map = {};
    this.server = application.web_server;
    this.ready = false;
    this.settings = { generated: false };

    this.stopwatches = { database_save: new Stopwatch(10 * 1000) };
  }

  poll() {
    if (!this.ready) return;

    if (this.stopwatches.database_save.is_elapsed()) {
      log.info(`[${Util.get_time_hms()}] Auto save to database`);
      this.database_save_data();
      this.stopwatches.database_save.reset();
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

    // Create 5 lands
    for (let id = 0; id < 5; id++) {
      const land = new Land(id);
      land.size = Util.get_random_int(10, 20);
      land.name = "land_" + id;
      this.lands_map[id] = land;
    }

    // Create 5 characters
    for (let id = 0; id < 5; id++) {
      const character = new Character("AM_" + id);
      character.password = "123";
      character.position.land_id = id;
      this.characters_map[character.name] = character;
    }

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

    this.settings.generated = true;
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
        CharacterModel.save(Object.values(this.characters_map), (...args) => {
          this.database_save_data(...args);
        });
        break;
      case "character.save":
        LandModel.save(Object.values(this.lands_map), (...args) => {
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
        const character = { ...new Character(), ...result._doc };
        delete character._id;
        delete character.__v;

        this.characters_map[character.name] = character;
      }
    };

    const set_lands = results_list => {
      for (const result of results_list) {
        const land = { ...new Land(), ...result._doc };
        delete land._id;
        delete land.__v;

        this.lands_map[land.id] = land;
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
        Object.keys(this.lands_map).length > 0 &&
        Object.keys(this.characters_map).length > 0;

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
    return name in this.characters_map && this.characters_map[name] != null;
  }

  _character_get_by_id(id) {
    if (id in this.characters_map) return this.characters_map[id];
  }

  character_get_id_by_name(name) {
    if (name == null) return;

    // Admin
    if (AdminAccount.login.toLowerCase() === name.toLowerCase())
      return AdminAccount.id;

    // Characters
    for (const [id, character] of Object.entries(this.characters_map))
      if (character.name.toLowerCase() === name.toLowerCase()) return id;
  }

  character_get_name_by_id(id) {
    if (id == null) return;

    // Admin
    if (AdminAccount.id == id) return AdminAccount.login;

    // Characters
    const character = this._character_get_by_id(id);
    if (character == null) return;
    return character.name;
  }

  character_get_connection_id(id) {
    const character = this._character_get_by_id(id);
    if (character == null) return;
    return character.connection_id;
  }

  character_change_position(id, position_x) {
    const character = this._character_get_by_id(id);
    if (character == null) return;
    character.position.x = position_x;
  }

  character_change_land(id, land_id) {
    if (!(land_id in this.lands_map)) return;

    const character = this._character_get_by_id(id);
    if (character == null) return;

    const current_land = this.lands_map[character.position.land_id];
    delete current_land.characters_map[character.name];

    character.position.land_id = land_id;

    const new_land = this.lands_map[land_id];
    new_land.characters_map[character.name] = character;
  }

  character_add_friend(id, friend_name) {
    if (!this.character_is_exist(friend_name)) return;

    const character = this._character_get_by_id(id);
    if (character == null) return;
    if (character.friends_list.includes(friend_name)) return;
    character.friends_list.push(friend_name);
  }

  character_remove_friend(id, friend_name) {
    if (!this.character_is_exist(friend_name)) return;

    const character = this._character_get_by_id(id);
    if (character == null) return;
    if (!character.friends_list.includes(friend_name)) return;
    character.friends_list.splice(
      character.friends_list.indexOf(friend_name),
      1
    );
  }

  character_change_state(id, state) {
    const character = this._character_get_by_id(id);
    if (character == null) return;
    character.state = state;
  }

  character_change_action(id, action) {
    const character = this._character_get_by_id(id);
    if (character == null) return;
    character.action = action;
  }

  character_change_activity(id, activity) {
    const character = this._character_get_by_id(id);
    if (character == null) return;
    character.activity = activity;
  }

  character_log_off(id) {
    if (id == null) return;

    if (id in this.characters_map)
      return (this.characters_map[id].connection_id = undefined);
  }

  character_authenticate(connection_id, login, password) {
    if (connection_id == null || login == null || password == null) return;

    // Admin
    // Many accounts(sockets) can be logged as admin,
    // for example for multi-screen
    if (
      AdminAccount.login.toLowerCase() === login.toLowerCase() &&
      AdminAccount.password === password.toLowerCase()
    )
      return;

    // Characters
    // Only one account per character
    for (const [id, character] of Object.entries(this.characters_map)) {
      if (
        character.name.toLowerCase() === login.toLowerCase() &&
        character.password.toLowerCase() === password.toLowerCase()
      ) {
        if (character.connection_id != null)
          return "Another socket is logged in: " + character.connection_id;

        character.connection_id = connection_id;
        return;
      }
    }
    return "Wrong authentication data";
  }
}

module.exports = { Manager };
