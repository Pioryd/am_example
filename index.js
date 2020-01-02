const { Config, ModulesManager, setup_exit_handlers } = require("am_framework");
const EventEmitter = require("events");
const path = require("path");
const log = require("simple-node-logger").createSimpleLogger();

const Directories = {
  modules_directory: path.join(__dirname, "modules"),
  config_file_full_name: path.join(__dirname, "config.json")
};

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

    this.modules_manager = new ModulesManager({
      application: this,
      event_emiter: this,
      modules_directory: Directories.modules_directory,
      disabled_modules: this.config.data.disabled_modules
    });
  }

  _init_commands() {
    const commands_map = {
      close: () => {
        this.close();
      }
    };

    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", data => {
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

  // Should be called only once
  run() {
    this._init_commands();
    this.modules_manager.load_modules();

    setup_exit_handlers(
      () => {
        this.emit("on_force_terminate");
      },
      () => {
        this.emit("on_force_terminate");
      }
    );

    this.emit("on_initialize");

    this.emit("on_run");
  }

  // Should be called only once
  close() {
    log.info(`Closing in ${this.config.data.close_app_delay / 1000} seconds`);

    this.config.terminate();

    this.emit("on_terminate");

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
