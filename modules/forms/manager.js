const { Util } = require("../../framework/util.js");
const { ParsePacket } = require("./parse_packet");
const data_directory = "./data/forms/forms.json";

class Manager {
  constructor() {
    this.forms = {};
    this.map_size = { width: 1000, height: 1000 };
  }

  load_forms() {
    const forms_json = Util.read_from_json(data_directory);
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

    Util.write_to_json(data_directory, Object.values(this.forms));
  }

  move_forms() {
    for (const [name, form] of Object.entries(this.forms)) {
      if (form.type !== "actor") continue;

      this.random_move(form);

      const correct_rect = rect => {
        if (form.x < rect.x) form.x = rect.x;
        if (form.x > rect.x + rect.height) form.x = rect.x + rect.height;
        if (form.y < rect.y) form.y = rect.y;
        if (form.y > rect.y + rect.width) form.y = rect.y + rect.width;
      };

      correct_rect({ x: 100, y: 100, width: 300, height: 300 });
    }
  }

  create_parse_dict() {
    return {
      radar: packet => {
        if (packet.command in ParsePacket)
          return ParsePacket[packet.command](packet, this);
      }
    };
  }

  random_move(form) {
    const directions_move = {
      "1": obj => this.move_up(obj),
      "2": obj => this.move_down(obj),
      "3": obj => this.move_left(obj),
      "4": obj => this.move_right(obj)
    };
    const random_direction = Math.floor(Math.random() * 4 + 1);
    directions_move[random_direction](form);
  }

  move_up(form, count_steps = 1) {
    form.x += count_steps;
  }
  move_down(form, count_steps = 1) {
    form.x -= count_steps;
  }
  move_left(form, count_steps = 1) {
    form.y -= count_steps;
  }
  move_right(form, count_steps = 1) {
    form.y += count_steps;
  }
}

module.exports = { Manager };
