const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_animal", file_name: __filename });
const EventEmitter = require("events");

const Manager = require("./managers");

class ModuleAnimal extends EventEmitter {
  constructor({ event_emitter, config }) {
    super();
    this.event_emitter = event_emitter;
    this.application = event_emitter;
    this.config = config;
    this.data = {
      character_data: {},
      land_data: {},
      world_data: {
        lands_map: {},
        characters_map: {},
        environment_objects_map: {},
        virtual_worlds_map: {}
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
      am: new Manager.AM(this),
      admin_server: new Manager.AdminServer(this),
      world_client: new Manager.WorldClient(this)
    };

    this.ready = false;
    this.terminate = false;
  }

  // Async
  on_initialize() {
    this.terminate = false;
    try {
      // The order is important for logic
      this.managers.am.initialize();
      this.managers.admin_server.initialize();
      this.managers.world_client.initialize();
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
      _this.managers.admin_server.terminate();
      _this.managers.world_client.terminate();
      _this.managers.am.terminate();
    } catch (e) {
      logger.error(e, e.stack);
    }

    this.ready = false;
  }

  _poll(_this) {
    // The order is important for logic
    _this.managers.admin_server.poll();
    _this.managers.world_client.poll();
    _this.managers.am.poll();
  }
}

module.exports = { ModuleAnimal };
