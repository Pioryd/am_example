const { Manager } = require("./manager.js");
const log = require("simple-node-logger").createSimpleLogger();

class World {
  constructor({ application }) {
    this.manager = new Manager({ application: application });
    this.application = application;
    this.web_server = null;
  }

  on_prepare(web_server) {
    this.web_server = web_server;
    this.web_server.add_parse_packet_dict(
      this.manager.create_parse_packet_dict()
    );
    this.manager.database_load_data({ step: "connect" });
  }

  on_tick() {
    try {
      this.manager.poll();
    } catch (error) {
      log.error(error);
    }
  }

  on_exit() {
    this.manager.database.close();
  }

  on_close() {
    console.log("emited onclose");
    if (this.web_server != null) this.web_server.stop();
    this.application.removeAllListeners();

    // safe save data to database after close all previous listeners
    console.log("Saving data to database before exit application");
    this.manager.database_save_data({
      on_success: () => {
        process.exit(0);
      }
    });
  }
}

module.exports = { World };
