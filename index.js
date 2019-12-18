const {
  Util,
  Server,
  Config,
  ModulesManager,
  setup_exit_handlers
} = require("am_framework");
const EventEmitter = require("events");
const path = require("path");

const Directories = {
  modules_directory: path.join(__dirname, "modules"),
  config_file_full_name: path.join(__dirname, "config.json")
};
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
    this.config = new Config({
      file_full_name: Directories.config_file_full_name,
      on_update: () => {
        console.log("config updated");
      }
    });
    this.config.load();
    this.on("on_exit", () => {
      this.config.terminate();
    });

    this.web_server = new Server({ port: this.config.data.port });
    this.modules_manager = new ModulesManager({
      event_emiter: this,
      modules_directory: Directories.modules_directory,
      events_list: Events_list,
      disabled_modules: this.config.data.disabled_modules
    });
  }

  main_loop(_this) {
    _this.web_server.poll();
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
