class Characters {
  constructor(module_world) {
    this.module_world = module_world;
  }

  initialize() {}

  terminate() {}

  poll() {}

  is_character_exist(name) {
    return (
      name in this.module_world.data.characters_map &&
      this.module_world.data.characters_map[name] != null
    );
  }

  get_character(name) {
    if (name in this.module_world.data.characters_map)
      return this.module_world.data.characters_map[name];
  }

  get_character_connection_id(character_name) {
    const character = this.get_character(character_name);
    if (character == null) return;
    return character.get_connection_id();
  }

  get_character_dimension(character_name) {
    for (const object of Object.values(
      this.module_world.data.environment_objects_map
    ))
      if (object.contains_character(character_name))
        return object.get_dimension();
  }

  get_character_land(character_name) {
    for (const land of Object.values(this.module_world.data.lands_map))
      if (land.get_character_position(character_name) != null) return land;
  }

  change_character_position(character_name, position) {
    for (const land of Object.values(this.module_world.data.lands_map))
      land.change_character_position(character_name, position);
  }

  change_character_land(character_name, land_id) {
    if (!(land_id in this.module_world.data.lands_map)) return;

    for (const land of Object.values(this.module_world.data.lands_map)) {
      if (land.get_character_position(character_name) != null) {
        land.remove_character(character_name);
        break;
      }
    }

    const new_land = this.module_world.data.lands_map[land_id];
    new_land.insert_character(character_name);
  }

  add_character_friend_if_exist(character_name, friend_name) {
    const character = this.get_character(character_name);
    const friend = this.get_character(friend_name);

    if (character == null || friend == null) return;

    character.add_friend(friend_name);
  }

  log_off_character(name) {
    if (name == null || !(name in this.module_world.data.characters_map))
      return;

    return this.module_world.data.characters_map[name].set_connection_id(
      undefined
    );
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

        character.set_connection_id(connection_id);
        return;
      }
    }
    return "Wrong authentication data";
  }
}

module.exports = Characters;
