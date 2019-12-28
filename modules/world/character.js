const { Util } = require("am_framework");

/*
Data format:
  name: string
  password: string
  state: string
  action: string
  activity: string
  friends_list: array<string>
  }>
*/
class Character {
  constructor(data) {
    this._data = data;

    this._connection_id = undefined;
  }

  get_name() {
    return this._data.name;
  }

  get_password() {
    return this._data.password;
  }

  get_state() {
    return this._data.state;
  }

  change_state(state) {
    this._data.state = state;
  }

  get_action() {
    return this._data.action;
  }

  change_action(action) {
    this._data.action = action;
  }

  get_activity() {
    return this._data.activity;
  }

  change_activity(activity) {
    this._data.activity = activity;
  }

  get_friends_list() {
    return [...this._data.get_friends_list];
  }

  add_friend(name) {
    if (this._data.friends_list.includes(name)) return;
    this._data.friends_list.push(name);
  }

  remove_friend(name) {
    if (!this._data.friends_list.includes(name)) return;
    this._data.friends_list.splice(this._data.friends_list.indexOf(name), 1);
  }

  get_connection_id() {
    return this._connection_id;
  }

  set_connection_id(connection_id) {
    this._connection_id = connection_id;
  }
}

module.exports = { Character };
