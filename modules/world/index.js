const Manager = require("./managers");
const EventEmitter = require("events");
const log = require("simple-node-logger").createSimpleLogger();

/* 
  ModuleWorld === EventEmiter
  But:
    - managers should use it as ModuleWorld
    - data objects should use it as EventEmiter
*/
class ModuleWorld extends EventEmitter {
  constructor({ application }) {
    super();
    this.application = application;
    this.data = {
      lands_map: {},
      characters_map: {},
      environment_objects_map: {},
      settings: { generated: false, admin_login: "", admin_password: "" }
    };
    this.managers = {
      characters: new Manager.Characters(this),
      database: new Manager.Database(this),
      main_world: new Manager.MainWorld(this),
      server: new Manager.Server(this)
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
      this.managers.main_world.initialize();
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
      this.managers.main_world.poll();
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
      this.managers.main_world.terminate();
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
      this.managers.main_world.terminate();
      this.managers.characters.terminate();
      this.managers.database.terminate();
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = { ModuleWorld };
