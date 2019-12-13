class Character {
  constructor(id) {
    this.id = id;
    this.name = "";
    // this.current_state = {};
    // this.current_action = {};
    // this.current_activity = {};
    this.position = { land_id: 0, object_id: 0, x: 0 };
    // this.states_list = [];
    // this.actions_list = [];
    // this.activities_list = [];
  }
}

module.exports = { Character };
