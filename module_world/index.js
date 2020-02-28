const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const EventEmitter = require("events");

const Manager = require("./managers");

/* 
  ModuleWorld === EventEmiter
  But:
    - managers should use it as ModuleWorld
    - data objects should use it as EventEmiter
*/
class ModuleWorld extends EventEmitter {
  constructor({ event_emitter, config }) {
    super();
    this.event_emitter = event_emitter;
    this.application = event_emitter;
    this.config = config;
    this.data = {
      lands_map: {},
      characters_map: {},
      environment_objects_map: {},
      virtual_worlds_map: {},
      // Remember to update models if rebuild settings structure
      settings: {
        generated: false,
        backup: false,
        corrupted: false
      }
    };
    this.managers = {
      characters: new Manager.Characters(this),
      database: new Manager.Database(this),
      main_world: new Manager.MainWorld(this),
      world_server: new Manager.WorldServer(this),
      admin_server: new Manager.AdminServer(this),
      virtual_worlds: new Manager.VirtualWorlds(this)
    };

    this.ready = false;
    this.terminate = false;
  }

  // Async
  on_initialize() {
    this.terminate = false;
    try {
      // The order is important for logic
      this.managers.database.initialize();
      this.managers.world_server.initialize();
      this.managers.admin_server.initialize();
      this.managers.characters.initialize();
      this.managers.main_world.initialize();
      this.managers.virtual_worlds.initialize();
    } catch (e) {
      logger.error(e, e.stack);
    }

    this.ready = true;
  }

  // Async
  on_force_terminate() {
    if (this.terminate) return;

    logger.error(
      "Closing forced, unexpected behavior.\n" +
        "Check data before run module again."
    );

    this.on_terminate();
  }

  // Async
  on_terminate() {
    if (this.terminate) return;

    this.terminate = true;
  }

  on_run() {
    this._main_loop(this);
  }

  // Sync (self async)
  _main_loop(_this) {
    if (!_this.ready) return;

    try {
      if (_this.terminate) {
        _this._terminate(_this);
        return;
      }

      _this._poll(_this);
    } catch (e) {
      logger.error(e, e.stack);
    }

    setTimeout(() => {
      _this._main_loop(_this);
    }, 10);
  }

  _terminate(_this) {
    try {
      logger.info("Close module...");
      _this.event_emitter.removeAllListeners();

      // The order is important for logic
      _this.managers.world_server.terminate();
      _this.managers.admin_server.terminate();
      _this.managers.main_world.terminate();
      _this.managers.characters.terminate();
      _this.managers.database.terminate();
      _this.managers.virtual_worlds.terminate();
    } catch (e) {
      logger.error(e, e.stack);
    }

    this.ready = false;
  }

  _poll(_this) {
    // The order is important for logic
    _this.managers.database.poll();
    _this.managers.world_server.poll();
    _this.managers.admin_server.poll();
    _this.managers.characters.poll();
    _this.managers.main_world.poll();
    _this.managers.virtual_worlds.poll();
  }
}

module.exports = { ModuleWorld };
