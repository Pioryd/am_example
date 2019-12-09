const lib_web_server = require("../lib/server.js");
const lib_util = require("../lib/util.js");

/**
 * @description Contains things related to GUI. Connect GUI via sockets.
 */
class UI_Server {
  constructor(world) {
    this.world = world;

    this.web_server = new lib_web_server.Server(
      this.world.config.port,
      this.create_parse_dict_()
    );
  }

  run() {
    this.web_server.start();
  }
  /**
   * @description Functions to parse incoming packets and send immediately
   *  response.
   * @returns {dict<String, Function>} Key: Packet ID, Value: Function to parse
   */
  create_parse_dict_() {
    let parse_dict = {};

    parse_dict["radar"] = packet => {
      let data = null;
      if (packet.command === "update") {
        data = {};
        data.command = "update";
        data.points = [];
        data.map_size = this.world.map_size;

        for (const [key, value] of Object.entries(this.world.forms))
          data.points.push(JSON.parse(JSON.stringify(value, null, 2)));

        return data;
      } else if (packet.command === "edit_form") {
        data = {};
        data.command = "edit_form";
        data.log =
          `Error: Unable to add form: "${packet.form.name}". ` +
          `Do not contains correct values.`;

        packet.form.x = parseInt(packet.form.x);
        packet.form.y = parseInt(packet.form.y);
        packet.form.radius = parseInt(packet.form.radius);

        if (packet.form.name in this.world.forms) {
          this.world.forms[packet.form.name] = packet.form;
          data.log = `Updated form: "${packet.form.name}".`;
          return data;
        }

        if (
          packet.form.name !== "" &&
          packet.form.x !== "" &&
          packet.form.y !== "" &&
          packet.form.radius !== ""
        ) {
          data.log = `Added new form: "${packet.form.name}".`;
          this.world.forms[packet.form.name] = packet.form;
        }

        return data;
      } else if (packet.command === "remove_form") {
        data = {};
        data.command = "remove_form";
        data.log =
          `Error: Unable to remove form: "${packet.form.name}". ` +
          `Form NOT found.`;
        if (packet.form.name in this.world.forms) {
          delete this.world.forms[packet.form.name];

          data.log = `Removed form: "${packet.form.name}".`;
        }

        return data;
      }
    };
    return parse_dict;
  }
}

class FormManager {
  static random_move(form) {
    const directions_move = {
      "1": obj => this.move_up(obj),
      "2": obj => this.move_down(obj),
      "3": obj => this.move_left(obj),
      "4": obj => this.move_right(obj)
    };
    const random_direction = Math.floor(Math.random() * 4 + 1);
    directions_move[random_direction](form);
  }

  static move_up(form, count_steps = 1) {
    form.x += count_steps;
  }
  static move_down(form, count_steps = 1) {
    form.x -= count_steps;
  }
  static move_left(form, count_steps = 1) {
    form.y -= count_steps;
  }
  static move_right(form, count_steps = 1) {
    form.y += count_steps;
  }
}

/**
 * @description Main class of program
 */
class Module {
  constructor(config) {
    this.config = config;
    this.forms = {};
    this.map_size = { width: 1000, height: 1000 };
    this.gui_server = new UI_Server(this);
  }

  run() {
    this.load_forms();

    this.gui_server.run();

    this.move_forms();
  }

  on_exit() {
    this.save_forms();
  }

  move_forms() {
    for (const [name, form] of Object.entries(this.forms)) {
      if (form.type !== "actor") continue;

      FormManager.random_move(form);

      const correct_rect = rect => {
        if (form.x < rect.x) form.x = rect.x;
        if (form.x > rect.x + rect.height) form.x = rect.x + rect.height;
        if (form.y < rect.y) form.y = rect.y;
        if (form.y > rect.y + rect.width) form.y = rect.y + rect.width;
      };

      correct_rect({ x: 100, y: 100, width: 300, height: 300 });
    }
    setTimeout(() => this.move_forms(), 10);
  }

  load_forms() {
    const forms_json = lib_util.read_from_json(this.config.forms_location);

    for (let i = 0; i < forms_json.length; i++)
      this.forms[forms_json[i].name] = forms_json[i];
  }

  save_forms() {
    for (const [name, form] of Object.entries(this.forms)) {
      if (form.type === "actor") form.color = "#8b8b8c33";
      if (form.type === "mechanical") form.color = "#03fc1333";
      if (form.type === "dynamic") form.color = "#ffab0333";
      if (form.type === "static") form.color = "#ff030333";
    }

    lib_util.write_to_json(
      this.config.forms_location,
      Object.values(this.forms)
    );
  }
}

module.exports = {
  Module
};
