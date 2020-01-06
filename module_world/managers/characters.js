class Characters {
  constructor(module_world) {
    this.module_world = module_world;
  }

  initialize() {}

  terminate() {}

  poll() {}

  get_character_connection_id(id) {
    const character = this._get_character_by_id(id);
    if (character == null) return;
    return character.get_connection_id();
  }

  get_character_id_by_name(character_name) {
    const character = this._get_character_by_name(character_name);
    if (character != null) return character.get_id();
  }

  get_character_land(id) {
    const character = this._get_character_by_id(id);
    if (!character) return;

    for (const land of Object.values(this.module_world.data.lands_map))
      if (land.get_character_position(character.get_id()) != null) return land;
  }

  change_character_position(id, position) {
    const character = this._get_character_by_id(id);
    if (!character) return;

    for (const land of Object.values(this.module_world.data.lands_map))
      land.change_character_position(character.get_id(), position);
  }

  change_character_land(id, land_id) {
    if (!(land_id in this.module_world.data.lands_map)) return;

    const character = this._get_character_by_id(id);
    if (!character) return;

    for (const land of Object.values(this.module_world.data.lands_map)) {
      if (land.get_character_position(character.get_id()) != null) {
        land.remove_character(character.get_id());
        break;
      }
    }

    const new_land = this.module_world.data.lands_map[land_id];
    new_land.insert_character(character.get_id());
  }

  add_character_friend_if_exist(id, friend_name) {
    const character = this._get_character_by_id(id);
    const friend = this._get_character_by_name(friend_name);
    console.log("test", id, friend_name);
    console.log(character == null, friend == null);
    console.log("test", character == null || friend == null);
    if (character == null || friend == null) return;

    character._add_friend(friend_name);
  }

  add_character_remove_if_exist(id, friend_name) {
    const character = this._get_character_by_id(id);
    const friend = this._get_character_by_name(friend_name);

    if (character == null || friend == null) return;

    character._remove_friend(friend_name);
  }

  log_off_character(id) {
    const character = this._get_character_by_id(id);
    if (character == null) return;

    character._set_connection_id(null);
  }

  log_in_character(connection_id, login, password) {
    if (connection_id == null || login == null || password == null) return;

    // Admin
    // Many accounts(sockets) can be logged as admin,
    // for example for multi-screen
    if (
      this.module_world.data.settings.admin_login.toLowerCase() ===
        login.toLowerCase() &&
      this.module_world.data.settings.admin_password === password.toLowerCase()
    )
      return;

    // Characters
    // Only one account per character
    for (const character of Object.values(
      this.module_world.data.characters_map
    )) {
      if (
        character.get_name().toLowerCase() === login.toLowerCase() &&
        character.get_password().toLowerCase() === password.toLowerCase()
      ) {
        if (character.get_connection_id() != null)
          return (
            "Another socket is logged in: " + character.get_connection_id()
          );

        character._set_connection_id(connection_id);
        return;
      }
    }
    return "Wrong authentication data";
  }

  _get_character_by_name(name) {
    for (const character of Object.values(
      this.module_world.data.characters_map
    )) {
      if (character.get_name() === name) {
        return character;
      }
    }
  }

  _get_character_by_id(id) {
    if (id in this.module_world.data.characters_map)
      return this.module_world.data.characters_map[id];
    else {
      console.log("EE", id, this.module_world.data.characters_map);
    }
  }
}

module.exports = Characters;
