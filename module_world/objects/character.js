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

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  get_password() {
    return this._data.password;
  }

  get_default_land_id() {
    return this._data.default_land_id;
  }

  get_virtual_world_id() {
    return this._data.virtual_world_id;
  }

  get_state() {
    return this._data.state;
  }

  get_action() {
    return this._data.action;
  }

  get_activity() {
    return this._data.activity;
  }

  get_friends_list() {
    return [...this._data.friends_list];
  }

  get_connection_id() {
    return this._connection_id;
  }

  _change_state(state) {
    this._data.state = state;
  }

  _change_action(action) {
    this._data.action = action;
  }

  _change_activity(activity) {
    this._data.activity = activity;
  }

  _change_default_land_id(default_land_id) {
    this._data.default_land_id = default_land_id;
  }

  _change_virtual_world_id(virtual_world_id) {
    this._data.virtual_world_id = virtual_world_id;
  }

  _set_connection_id(connection_id) {
    this._connection_id = connection_id;
  }

  _add_friend(name) {
    if (this._data.friends_list.includes(name)) return;
    this._data.friends_list.push(name);
  }

  _remove_friend(name) {
    if (!this._data.friends_list.includes(name)) return;
    this._data.friends_list.splice(this._data.friends_list.indexOf(name), 1);
  }
}

module.exports = { Character };
