const lib_module = require("./modules/core.js");
const lib_util = require("./lib/util.js");

const Application = require("./lib/application.js").Application;

class Gui {
  constructor() {
    this.application = new Application();
    this.config = lib_util.read_from_json("./config.json");

    this.module = new lib_module.Module(this.config.module);
  }

  run() {
    this.application.setup_exit_handlers(
      () => {
        this.module.on_exit();
      },
      () => {
        this.module.on_exit();
      }
    );

    this.module.run();
  }
}

const gui = new Gui();
gui.run();
