class Characters {
  constructor(module_world) {
    this.module_world = module_world;
  }

  initialize() {}

  terminate() {}

  poll() {}

  get_connection_id(id) {
    const character = this._get_character_by_id(id);
    if (character == null) return;
    return character.get_connection_id();
  }

  get_id_by_name(character_name) {
    const character = this._get_character_by_name(character_name);
    if (character != null) return character.get_id();
  }

  get_name(id) {
    const character = this._get_character_by_id(id);
    if (character != null) return character.get_name();
  }

  get_land(id) {
    const character = this._get_character_by_id(id);
    if (!character) return;

    for (const land of Object.values(this.module_world.data.lands_map))
      if (land.get_character_position(character.get_id()) != null) return land;
  }

  change_position(id, position) {
    const character = this._get_character_by_id(id);
    if (!character) return;

    for (const land of Object.values(this.module_world.data.lands_map))
      land.change_position(character.get_id(), position);
  }

  change_land(id, land_id) {
    if (!(land_id in this.module_world.data.lands_map)) return;

    const character = this._get_character_by_id(id);
    if (!character) return;

    for (const land of Object.values(this.module_world.data.lands_map))
      if (land.get_character_position(character.get_id()) != null)
        land.remove_character(character.get_id());

    const new_land = this.module_world.data.lands_map[land_id];
    new_land.insert_character(character.get_id());
  }

  add_friend_if_exist(id, friend_name) {
    const character = this._get_character_by_id(id);
    const friend = this._get_character_by_name(friend_name);

    if (character == null || friend == null) return;

    character._add_friend(friend_name);
  }

  remove_friend_if_exist(id, friend_name) {
    const character = this._get_character_by_id(id);
    const friend = this._get_character_by_name(friend_name);

    if (character == null || friend == null) return;

    character._remove_friend(friend_name);
  }

  enter_virtual_world(id, virtual_world_id) {
    const character = this._get_character_by_id(id);

    for (const land of Object.values(this.module_world.data.lands_map))
      land.remove_character(character.get_id());

    character._change_virtual_world_mode(true);

    this.module_world.managers.insert_character(id, virtual_world_id);
  }

  leave_virtual_world(id) {
    this.module_world.managers.remove_character(id);

    character._change_virtual_world_mode(false);

    const character = this._get_character_by_id(id);
    this.change_land(id, character.get_default_land_id());
  }

  log_off(id) {
    const character = this._get_character_by_id(id);
    if (character == null) return;

    character._set_connection_id(null);
  }

  log_in(connection_id, login, password) {
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
  }
}

module.exports = Characters;
