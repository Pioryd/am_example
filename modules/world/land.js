/*
Data format:
  id: string
  name: string
  map: array<{
    characters_list: array<string>, objects_list: array<string>
  }>
*/
class Land {
  constructor(data) {
    this._data = data;
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

    const new_point = this._data.map[current_position];
    new_point.characters_list.push(name);
  }

  change_object_position(id, new_position) {
    const current_position = this.get_object_position(id);
    if (current_position == null || new_position > this._data.map.length)
      return;

    const current_point = this._data.map[current_position];
    current_point.objects_list.splice(
      current_point.objects_list.indexOf(id),
      1
    );

    const new_point = this._data.map[current_position];
    new_point.objects_list.push(id);
  }

  insert_character(name, position = 0) {
    position = position < this._data.map.length ? position : 0;
    this._data.map[position].characters_list.push(name);
  }

  remove_character(name) {
    for (const point of this._data.map)
      if (point.characters_list.includes(name))
        point.characters_list.splice(point.characters_list.indexOf(name), 1);
  }
}

module.exports = { Land };
