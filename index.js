const { Config, ModulesManager, setup_exit_handlers } = require("am_framework");
const EventEmitter = require("events");
const path = require("path");
const log = require("simple-node-logger").createSimpleLogger();

const Directories = {
  modules_directory: path.join(__dirname, "modules"),
  config_file_full_name: path.join(__dirname, "config.json")
};

/*
  All modules events must be listed here
*/
const Events_list = [
  "on_init",
  "on_terminate",
  "on_prepare",
  "on_tick",
  "on_force_close",
  "on_close"
];

class App extends EventEmitter {
  constructor() {
    super();
    this.config = new Config({
      file_full_name: Directories.config_file_full_name,
      on_update: () => {
        log.info("config updated");
      }
    });
    this.config.load();
    this.on("on_close", () => {
      this.config.terminate();
    });

    this.modules_manager = new ModulesManager({
      application: this,
      event_emiter: this,
      modules_directory: Directories.modules_directory,
      events_list: Events_list,
      disabled_modules: this.config.data.disabled_modules
    });

    this.init_commands();
  }

  init_commands() {
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", data => {
      const commands_map = {
        close: () => {
          this.close();
        }
      };
      try {
        const command = data.trim();

        if (!(command in commands_map)) {
          log.info(`Unknown command: ${command}`);
          return;
        }

        log.info(`Process command: ${command}`);
        commands_map[command]();
      } catch (e) {
        console.error(e);
      }
    });
  }

  main_loop(_this) {
    try {
      _this.emit("on_tick");
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      _this.main_loop(_this);
    }, 10);
  }

  run() {
    this.modules_manager.load_modules();

    setup_exit_handlers(
      () => {
        this.emit("on_force_close");
      },
      () => {
        this.emit("on_force_close");
      }
    );

    this.emit("on_prepare");

    this.main_loop(this);
  }

  close() {
    log.info(`Closing in ${this.config.data.close_app_delay / 1000} seconds`);

    this.emit("on_close");

    setTimeout(() => {
      process.exit(0);
    }, this.config.data.close_app_delay);
  }
}

const app = new App();
try {
  app.run();
} catch (e) {
  console.error(e);
}
