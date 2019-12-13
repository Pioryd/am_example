const { Util } = require("../../framework/util.js");

class Character {
  constructor(id) {
    this.id = id;
    this.name = "";
    this.position = { land_id: 0, object_id: 0, x: 0 };

    this.current_state = {};
    this.current_action = {};
    this.current_activity = {};

    this.states_list = ["happy", "sad", "bored"];
    this.actions_list = ["walking", "thinking", "searching"];
    this.activities_list = ["working", "cleaning", "shopping"];

    this.friends_list = ["Bot_1", "Bot_2", "Bot_3"];

    this.update_statistics();
    setInterval(() => {
      this.update_statistics();
    }, 100);
  }

  update_statistics() {
    this.current_state = this.states_list[Util.get_random_int(0, 2)];
    this.current_action = this.actions_list[Util.get_random_int(0, 2)];
    this.current_activity = this.activities_list[Util.get_random_int(0, 2)];
  }
}

module.exports = { Character };
