class VirtualWorld {
  constructor(data) {
    this._data = data;
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  contains_character(name) {
    return name in this._data.characters_list;
  }

  character_enter(character_name) {
    if (!this._data.characters_list.contains(character_name))
      this._data.characters_list.push(character_name);
  }

  character_leave(character_name) {
    if (!this._data.characters_list.contains(character_name))
      this._data.characters_list.push(character_name);
  }
}

module.exports = { VirtualWorld };
