const { Util } = require("am_framework");

class Character {
  constructor(name) {
    this.name = name;
    this.password = "";
    this.connection_id = undefined;

    this.position = { land_id: 0, object_id: 0, x: 0 };

    this.state = "";
    this.action = "";
    this.activity = "";

    // Move to AM
    this.friends_list = [];
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
