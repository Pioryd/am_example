const { Util } = require("./framework/util.js");
const fw_server = require("./framework/server.js");
const fw_modules_manager = require("./framework/modules_manager.js");
const { setup_exit_handlers } = require("./framework/application.js");
const EventEmitter = require("events");

const Directories = { modules_dir: "./modules", config_file: "config.json" };
const Events_list = [
  "on_init",
  "on_terminate",
  "on_prepare",
  "on_tick",
  "on_exit"
];

class App extends EventEmitter {
  constructor() {
    super();
    this.config = Util.read_from_json(Directories.config_file);
    this.web_server = new fw_server.Server({ port: this.config.port });
    this.modules_manager = new fw_modules_manager.ModulesManager({
      event_emiter: this,
      modules_directory: Directories.modules_dir,
      events_list: Events_list,
      disabled_modules: this.config.disabled_modules
    });
  }

  main_loop(_this) {
    _this.emit("on_tick");
    setTimeout(() => {
      _this.main_loop(_this);
    }, 10);
  }

  run() {
    this.modules_manager.load_modules();

    setup_exit_handlers(
      () => {
        this.emit("on_exit");
      },
      () => {
        this.emit("on_exit");
      }
    );

    this.emit("on_prepare", this.web_server);

    this.web_server.start();

    this.main_loop(this);
  }
}

const app = new App();
app.run();
