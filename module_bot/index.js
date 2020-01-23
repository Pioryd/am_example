const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_bot", file_name: __filename });
const EventEmitter = require("events");

const Manager = require("./managers");

/* 
  ModuleBot === EventEmiter
  But:
    - managers should use it as ModuleBot
    - data objects should use it as EventEmiter
*/
class ModuleBot extends EventEmitter {
  constructor({ event_emitter, config }) {
    super();
    this.event_emitter = event_emitter;
    this.application = event_emitter;
    this.config = config;
    this.data = {
      character_data: { character_data: "test" },
      land_data: { land_data: "test" },
      world_data: {
        lands_map: { lands_map: "test" },
        characters_map: { characters_map: "test" },
        environment_objects_map: { environment_objects_map: "test" },
        virtual_worlds_map: { virtual_worlds_map: "test" }
      },
      action_message_packets: [],
      virtual_world_packets: [],
      // Remember to update models if rebuild settings structure
      settings: {
        generated: false,
        backup: false,
        corrupted: false
      }
    };
    this.managers = {
      //character: new Manager.Character(this),
      //database: new Manager.Database(this),
      world: new Manager.World(this),
      admin_server: new Manager.AdminServer(this)
      //virtual_world: new Manager.VirtualWorld(this)
    };

    this.ready = false;
    this.terminate = false;
  }

  // Async
  on_initialize() {
    this.terminate = false;
    try {
      // The order is important for logic
      //this.managers.database.initialize();
      this.managers.admin_server.initialize();
      //this.managers.character.initialize();
      this.managers.world.initialize();
      //this.managers.virtual_world.initialize();
    } catch (e) {
      logger.error(e.stack);
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
      logger.error(e.stack);
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
      _this.managers.admin_server.terminate();
      _this.managers.world.terminate();
      //_this.managers.character.terminate();
      //_this.managers.database.terminate();
      //_this.managers.virtual_world.terminate();
    } catch (e) {
      logger.error(e.stack);
    }

    this.ready = false;
  }

  _poll(_this) {
    // The order is important for logic
    //_this.managers.database.poll();
    _this.managers.admin_server.poll();
    //_this.managers.character.poll();
    _this.managers.world.poll();
    //_this.managers.virtual_world.poll();
  }
}

module.exports = { ModuleBot };
