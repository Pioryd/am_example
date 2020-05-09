class MAM_Register {
  constructor(root_module) {
    this.root_module = root_module;

    this.mam_data_map = {};
  }

  initialize() {}

  terminate() {}

  poll() {}

  register(mam_characters, connection_id) {
    const characters_info = {};
    const characters_list = [];
    const characters_manager = this.root_module.managers.characters;

    if ("included" in mam_characters && mam_characters.included.length > 0) {
      for (const id of mam_characters.included) {
        if (characters_manager._get_character_by_id(id) == null)
          throw new Error(`Character[${id}] not found`);

        const mam_key = this._get_mam_key_by_character_id(id);
        if (mam_key != null)
          throw new Error(
            `Character[${id}] is connected to another MAM[${mam_key}]`
          );

        characters_list.push(id);
      }
    } else if (
      "excluded" in mam_characters &&
      mam_characters.excluded.length > 0
    ) {
      for (const id of Object.keys(this.root_module.data.characters_map)) {
        if (
          !mam_characters.excluded.includes(id) &&
          this._get_mam_key_by_character_id(id) == null
        )
          characters_list.push(id);
      }
    } else {
      for (const id of Object.keys(this.root_module.data.characters_map)) {
        if (this._get_mam_key_by_character_id(id) == null)
          characters_list.push(id);
      }
    }

    // setup characters_info
    for (const id of characters_list) {
      characters_info[id] = { id, force_new: false };
    }

    this.mam_data_map[connection_id] = { characters_list };
    return characters_info;
  }

  unregister(connection_id) {
    delete this.mam_data_map[connection_id];
  }

  get_connection(character_id) {
    return this._get_mam_key_by_character_id(character_id);
  }

  _get_mam_key_by_character_id(id) {
    for (const [connection_id, mam_data] of Object.entries(this.mam_data_map)) {
      if (mam_data.characters_list.includes(id)) return connection_id;
    }
  }
}

module.exports = MAM_Register;
