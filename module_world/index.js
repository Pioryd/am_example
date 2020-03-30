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
      am_forms_map: {},
      am_programs_map: {},
      am_scripts_map: {},
      am_systems_map: {},
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
      virtual_worlds: new Manager.VirtualWorlds(this),
      mam: new Manager.MAM(this),
      am_data: new Manager.AM_Data(this)
    };
    // The order is important for logic
    this.__order = {
      initialize: [
        "database",
        "world_server",
        "admin_server",
        "characters",
        "main_world",
        "virtual_worlds",
        "mam",
        "am_data"
      ],
      terminate: [
        "world_server",
        "admin_server",
        "main_world",
        "characters",
        "database",
        "virtual_worlds",
        "mam",
        "am_data"
      ],
      poll: [
        "database",
        "world_server",
        "admin_server",
        "characters",
        "main_world",
        "virtual_worlds",
        "mam",
        "am_data"
      ]
    };

    this.ready = false;
    this.terminate = false;
  }

  // Async
  on_initialize() {
    this.terminate = false;
    try {
      for (const manager_name of this.__order.initialize)
        this.managers[manager_name].initialize();
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

      for (const manager_name of this.__order.terminate)
        this.managers[manager_name].terminate();
    } catch (e) {
      logger.error(e, e.stack);
    }

    this.ready = false;
  }

  _poll(_this) {
    for (const manager_name of this.__order.poll)
      this.managers[manager_name].poll();
  }
}

module.exports = { ModuleWorld };
