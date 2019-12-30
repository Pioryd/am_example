class EnvironmentObject {
  constructor(data) {
    this._data = data;
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }
}

module.exports = { EnvironmentObject };
