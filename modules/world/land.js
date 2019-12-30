class Land {
  constructor(data, event_manager) {
    this._data = data;
    this.event_manager = event_manager;
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  get_map_size() {
    return this._data.map.length;
  }

  // Return copy of list if exist or null if not
  get_characters_list_at(index) {
    if (this._data.map.length <= 0) return;

    return [...this._data.map[index].characters_list];
  }

  // Return copy of list if exist or null if not
  get_objects_list_at(index) {
    if (this._data.map.length <= 0) return;

    return [...this._data.map[index].objects_list];
  }

  get_characters_count_at(index) {
    if (this._data.map.length <= 0) return;

    return this._data.map[index].characters_list.length;
  }

  get_objects_count_at(index) {
    if (this._data.map.length <= 0) return;

    return this._data.map[index].objects_list.length;
  }

  get_character_position(name) {
    for (let i = 0; i < this._data.map.length; i++)
      if (this._data.map[i].characters_list.includes(name)) return i;
  }

  get_object_position(id) {
    for (let i = 0; i < this._data.map.length; i++)
      if (this._data.map[i].objects_list.includes(id)) return i;
  }

  change_character_position(name, new_position) {
    const current_position = this.get_character_position(name);

    if (current_position == null || new_position > this._data.map.length)
      return;

    const current_point = this._data.map[current_position];
    current_point.characters_list.splice(
      current_point.characters_list.indexOf(name),
      1
    );

    if (current_point.objects_list.length > 0) {
      this.event_manager.emit("character_leave_object", name, {
        ...current_point.objects_list
      });
    }

    const new_point = this._data.map[new_position];
    new_point.characters_list.push(name);

    if (new_point.objects_list.length > 0) {
      this.event_manager.emit("character_enter_object", name, {
        ...new_point.objects_list
      });
    }
  }

  insert_character(name, position = 0) {
    position = position < this._data.map.length ? position : 0;
    const point = this._data.map[position];
    point.characters_list.push(name);

    if (point.objects_list.length > 0) {
      this.event_manager.emit("character_enter_object", name, {
        ...point.objects_list
      });
    }
  }

  remove_character(name) {
    for (let i = 0; i < this._data.map; i++) {
      const point = this._data.map[i];
      if (point.characters_list.includes(name)) {
        point.characters_list.splice(point.characters_list.indexOf(name), 1);

        if (point.objects_list.length > 0) {
          this.event_manager.emit("character_leave_object", name, {
            ...point.objects_list
          });
        }
      }
    }
  }
}

module.exports = { Land };
