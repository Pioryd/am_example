const CharactersManager = require("./manager/characters");
const DatabaseManager = require("./manager/database");
const EventsManager = require("./manager/world");
const ServerManager = require("./manager/server");

const log = require("simple-node-logger").createSimpleLogger();

class ModuleWorld {
  constructor({ application }) {
    this.application = application;
    this.web_server = null;
    this.event_emitter = application;
    this.data = {
      lands_map: {},
      characters_map: {},
      environment_objects_map: {},
      settings: { generated: false, admin_login: "", admin_password: "" }
    };
    this.managers = {
      characters: new CharactersManager(this),
      database: new DatabaseManager(this),
      world: new EventsManager(this),
      server: new ServerManager(this)
    };

    this.ready = false;
  }

  // Async
  on_prepare(web_server) {
    this.web_server = web_server;
    this.web_server.add_parse_packet_dict(
      this.managers.server.create_parse_packet_dict()
    );
    this.managers.database.load_data({
      step: "connect",
      on_success: () => {
        if (this.data.settings.generated === false)
          this.managers.world.generate_world();
        this.ready = true;
        log.info("Server is running...");
      },
      on_error: () => {
        on_close();
      }
    });
  }

  // Async
  on_tick() {
    if (!this.ready) return;

    try {
      this.managers.characters.poll();
      this.managers.database.poll();
      this.managers.world.poll();
      this.managers.server.poll();
    } catch (error) {
      log.error(error);
    }
  }

  // Async
  on_exit() {
    this.managers.database.close();
  }

  // Async
  on_close() {
    if (this.web_server != null) this.web_server.stop();
    this.application.removeAllListeners();

    // safe save data to database after close all previous listeners
    console.log("Saving data to database before exit application");
    this.managers.database.save_data({
      on_success: () => {
        process.exit(0);
      },
      on_error: () => {
        process.exit(0);
      }
    });
  }
}

module.exports = { ModuleWorld };
