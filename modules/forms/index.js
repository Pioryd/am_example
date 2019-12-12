const { Manager } = require("./manager.js");

class Forms {
  constructor() {
    this.manager = new Manager();
  }

  on_prepare(web_server) {
    this.manager.load_forms();
    web_server.add_parse_dict(this.manager.create_parse_dict_());
  }

  on_tick() {
    this.manager.move_forms();
  }

  on_exit() {
    this.manager.save_forms();
  }
}

module.exports = { Forms };
