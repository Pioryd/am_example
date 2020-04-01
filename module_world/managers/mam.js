class MAM {
  constructor(module_world) {
    this.module_world = module_world;

    this.mam_data = {};
  }

  initialize() {}

  terminate() {}

  poll() {}

  register(mam_characters, connection_id) {
    const characters_info = {};
    const characters_ids_list = [];
    const characters_manager = this.module_world.managers.characters;

    if ("included" in mam_characters && mam_characters.included.length > 0) {
      for (const id of mam_characters.included) {
        if (characters_manager._get_character_by_id(id) == null)
          throw new Error(`Character[${id}] not found`);

        const mam_key = this._get_mam_key_by_character_id(id);
        if (mam_key != null)
          throw new Error(
            `Character[${id}] is connected to another MAM[${mam_key}]`
          );

        characters_ids_list.push(id);
      }
    } else if (
      "excluded" in mam_characters &&
      mam_characters.excluded.length > 0
    ) {
      for (const id of Object.keys(this.module_world.data.characters_map)) {
        if (
          !mam_characters.excluded.includes(id) &&
          this._get_mam_key_by_character_id(id) == null
        )
          characters_ids_list.push(id);
      }
    } else {
      for (const id of Object.keys(this.module_world.data.characters_map)) {
        if (this._get_mam_key_by_character_id(id) == null)
          characters_ids_list.push(id);
      }
    }

    // setup characters_info
    for (const id of characters_ids_list) {
      characters_info[id] = { id, force_new: false };
    }

    this.mam_data[connection_id] = characters_ids_list;
    return characters_info;
  }

  unregister(connection_id) {
    delete this.mam_data[connection_id];
  }

  send(character_id, packet_id, packet_data) {
    const connection_id = this._get_mam_key_by_character_id(character_id);

    if (connection_id == null)
      throw new Error(
        `Unable to send packet. Character[${character_id}]` +
          ` is not connected to MAM`
      );

    this.module_world.managers.world_server.send(
      connection_id,
      "virtual_world",
      { packet_id, packet_data: { character_id, ...packet_data } }
    );
  }

  _get_mam_key_by_character_id(id) {
    for (const [connection_id, characters_ids_list] of Object.entries(
      this.mam_data
    )) {
      if (characters_ids_list.includes(id)) return connection_id;
    }
  }
}

module.exports = MAM;
