const { Util } = require("../../framework/util.js");

class Character {
  constructor(id) {
    this.id = id;
    this.name = "";
    this.position = { land_id: 0, object_id: 0, x: 0 };

    // Send from AM to server as id/string
    // On AM side is all logic
    this.current_state = {};
    // Send from server to AM as id/string
    // On server side is all logic
    this.current_action = {};
    // Send from AM to server as id/string
    // On AM side is all logic
    this.current_activity = {};

    // Move to AM
    this.states_list = ["happy", "sad", "bored"];
    // Stay here
    this.actions_list = ["walking", "thinking", "searching"];
    // Move to AM
    this.activities_list = ["working", "cleaning", "shopping"];

    // Move to AM
    this.friends_list = [];

    // Move to AM
    // this.update_statistics();
    // setInterval(() => {
    //   this.update_statistics();
    //   this.update_position();
    // }, 100);
  }

  update_statistics() {
    this.current_state = this.states_list[Util.get_random_int(0, 2)];
    this.current_action = this.actions_list[Util.get_random_int(0, 2)];
    this.current_activity = this.activities_list[Util.get_random_int(0, 2)];
  }

  // Move to Manager
  update_position() {
    // not player
    if (this.id != 0)
      if (Util.get_random_int(1, 10) > 5)
        this.position = Util.get_random_int(1, 20);
  }
}

module.exports = { Character };
