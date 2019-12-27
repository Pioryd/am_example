const { Manager } = require("./manager.js");

class World {
  constructor({ application }) {
    this.manager = new Manager({ application: application });
  }

  on_prepare(web_server) {
    web_server.add_parse_packet_dict(this.manager.create_parse_packet_dict());
    this.manager.load_data_from_database();
  }

  on_tick() {
    this.manager.poll();
  }

  on_exit() {
    this.manager.database.close();
  }
}

module.exports = { World };
