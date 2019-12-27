const { ParsePacket } = require("./parse_packet");
const { Land, generate_random_land } = require("./land");
const { Character } = require("./character");
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
      name: "t"
    });
    this.lands_map = {};
    this.characters_map = {};
    this.server = application.web_server;
    this.ready = false;
    this.settings = { generated: false };

    this.stopwatches = { database_save: new Stopwatch(10 * 1000) };
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

    this.settings.generated = true;
  }

  setup_database_models() {
    SettingsModel.setup(this.database.connection);
    CharacterModel.setup(this.database.connection);
    LandModel.setup(this.database.connection);
  }

  save_data_to_database(step = "connect", error, results) {
    log.info("Save data to database, step:", step);

    if (error != null) log.error(error);

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          this.setup_database_models();
          this.save_data_to_database("connected");
        });
        break;
      case "connected":
        SettingsModel.save(this.settings, (...args) => {
          this.save_data_to_database(...args);
        });
        break;
      case "settings.save":
        CharacterModel.save(Object.values(this.characters_map), (...args) => {
          this.save_data_to_database(...args);
        });
        break;
      case "character.save":
        LandModel.save(Object.values(this.lands_map), (...args) => {
          this.save_data_to_database(...args);
        });
        break;
      case "land.save":
        break;
    }
  }

  load_data_from_database(step = "connect", error, results) {
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
      this.setup_database_models();

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

          this.load_data_from_database("check_loaded_data");

          return;
        }
      }

      this.load_data_from_database("connected");
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

    if (error != null) log.info("load_data_from_database error:", error);

    switch (step) {
      case "connect":
        this.database.connect(collections => {
          check_collections(collections);
        });
        break;
      case "connected":
        SettingsModel.load((...args) => {
          this.load_data_from_database(...args);
        });
        break;
      case "settings.load":
        set_settings(results);
        CharacterModel.load_all((...args) => {
          this.load_data_from_database(...args);
        });
        break;
      case "character.load_all":
        set_characters(results);
        LandModel.load_all((...args) => {
          this.load_data_from_database(...args);
        });
        break;
      case "land.load_all":
        set_lands(results);
        this.load_data_from_database("check_loaded_data");
        break;
      case "check_loaded_data":
        check_loaded_data(); // must be as last function
        break;
      default:
        break;
    }
  }

  is_character_exist(name) {
    return name in this.characters_map && this.characters_map[name] != null;
  }

  authenticate(connection_id, login, password) {
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

  get_character_by_id(id) {
    if (id in this.characters_map) return this.characters_map[id];
  }

  get_character_id_by_name(name) {
    if (name == null) return;

    // Admin
    if (AdminAccount.login.toLowerCase() === name.toLowerCase())
      return AdminAccount.id;

    // Characters
    for (const [id, character] of Object.entries(this.characters_map))
      if (character.name.toLowerCase() === name.toLowerCase()) return id;
  }

  get_character_name_by_id(id) {
    if (id == null) return;

    // Admin
    if (AdminAccount.id == id) return AdminAccount.login;

    // Characters
    if (id in this.characters_map) return this.characters_map[id].name;
  }

  get_character_data_by_id(id) {
    if (id == null) return;

    // Admin
    if (AdminAccount.id == id)
      return {
        lands_map: this.lands_map,
        characters_map: this.characters_map
      };

    // Characters
    if (id in this.characters_map) return this.characters_map[id];
  }

  log_off_character(id) {
    if (id == null) return;

    if (id in this.characters_map)
      return (this.characters_map[id].connection_id = undefined);
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

  poll() {
    if (!this.ready) return;

    if (this.stopwatches.database_save.is_elapsed()) {
      log.info(`[${Util.get_time_hms()}] Auto save to database`);
      this.save_data_to_database();
      this.stopwatches.database_save.reset();
    }
  }
}

module.exports = { Manager };
