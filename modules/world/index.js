const CharactersManager = require("./manager/characters");
const DatabaseManager = require("./manager/database");
const EventsManager = require("./manager/world");
const Server = require("./manager/server");

const log = require("simple-node-logger").createSimpleLogger();

class ModuleWorld {
  constructor({ application }) {
    this.application = application;
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
      server: new Server(this)
    };

    this.ready = false;
  }

  // Async
  on_prepare(web_server) {
    try {
      // The order is important for logic
      this.managers.database.initialize();
      this.managers.server.initialize();
      this.managers.characters.initialize();
      this.managers.world.initialize();
    } catch (e) {
      console.error(e);
    }
  }

  // Async
  on_tick() {
    if (!this.ready) return;

    try {
      // The order is important for logic
      this.managers.database.poll();
      this.managers.server.poll();
      this.managers.characters.poll();
      this.managers.world.poll();
    } catch (e) {
      console.error(e);
    }
  }

  // Async
  on_force_close() {
    try {
      console.error(
        "Closing forced, unexpected behavior.\n" +
          "Check data before run [World] module again."
      );
      this.application.removeAllListeners();

      // The order is important for logic
      this.managers.server.terminate();
      this.managers.world.terminate();
      this.managers.characters.terminate();
      this.managers.database.terminate();
    } catch (e) {
      console.error(e);
    }
  }

  // Async
  on_close() {
    try {
      log.info("Close [World] module...");
      this.application.removeAllListeners();

      // The order is important for logic
      this.managers.server.terminate();
      this.managers.world.terminate();
      this.managers.characters.terminate();
      this.managers.database.terminate();
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = { ModuleWorld };
