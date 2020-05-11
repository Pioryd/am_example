class MAM_Register {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = config;

    this.mam_map = {};
  }

  initialize() {}

  terminate() {}

  poll() {}

  register(mam_data, connection_id) {
    const throw_if = {
      not_found: (object) => {
        if (object == null) throw new Error(`Object[${id}] not found`);
      },
      cannot_be_am: (object) => {
        if (!object.properties.includes("am"))
          throw new Error(`Object[${object.id}] cannot be AM`);
      },
      is_taken: (object) => {
        const mam_id = this._get_mam_id_by_object_id(object.id);
        if (mam_id != null)
          throw new Error(
            `Object[${object.id}] is connected to another MAM[${mam_id}]`
          );
      }
    };

    if (connection_id in this.mam_map)
      throw new Error(`Mam with id[${connection_id}] is already registered.`);

    const mam = { objects_list: [] };
    if ("included" in mam_data && mam_data.included.length > 0) {
      for (const id of mam_data.included) {
        const object = this.root_module.data.objects[id];
        try {
          throw_if.not_found(object);
          throw_if.cannot_be_am(object);
          throw_if.is_taken(object);
          mam.objects_list.push(id);
        } catch (e) {}
      }
    } else if ("excluded" in mam_data && mam_data.excluded.length > 0) {
      for (const [id, object] of Object.entries(
        this.root_module.data.objects
      )) {
        if (mam_data.excluded.includes(id)) continue;
        try {
          throw_if.cannot_be_am(object);
          throw_if.is_taken(object);
          mam.objects_list.push(id);
        } catch (e) {}
      }
    } else {
      for (const [id, object] of Object.entries(
        this.root_module.data.objects
      )) {
        try {
          throw_if.cannot_be_am(object);
          throw_if.is_taken(object);
          mam.objects_list.push(id);
        } catch (e) {}
      }
    }

    this.mam_map[connection_id] = mam;

    return mam;
  }

  unregister(mam_id) {
    delete this.mam_map[mam_id];
  }

  get_connection_id_object_id(object_id) {
    return this._get_mam_id_by_object_id(object_id);
  }

  _get_mam_id_by_object_id(id) {
    for (const [connection_id, mam] of Object.entries(this.mam_map))
      if (mam.objects_list.includes(id)) return connection_id;
  }
}

module.exports = MAM_Register;
