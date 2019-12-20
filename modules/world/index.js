const { Manager } = require("./manager.js");

class World {
  constructor({ application }) {
    this.manager = new Manager({ application: application });
  }

  on_prepare(web_server) {
    web_server.add_parse_packet_dict(this.manager.create_parse_packet_dict());
  }

  on_tick() {}

  on_exit() {}
}

module.exports = { World };
