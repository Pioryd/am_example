const path = require("path");
const { ScriptingSystem, Stopwatch, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_mam",
  file_name: __filename
});

class AM {
  constructor(root_module) {
    this.root_module = root_module;
    this.stopwatches_map = {
      check_data: new Stopwatch(1 * 1000)
    };
    this.containers_map = {};

    this.am_data = {};

    this._ready = false;
  }

  initialize() {}

  terminate() {
    for (const scripting_system_root of Object.values(this.containers_map)) {
      scripting_system_root.terminate();
    }
    this.containers_map = {};
  }

  poll() {
    if (!this.stopwatches_map.check_data.is_elapsed()) return;
    if (!this._ready) {
      this._check_ready();
      return;
    }

    this.emit_data();
    for (const scripting_system_root of Object.values(this.containers_map)) {
      scripting_system_root.process();
    }
    this.parse_virtual_world_packets();
    this.stopwatches_map.check_data.reset();
  }

  _reload() {
    this.terminate();

    // Create roots
    const { characters_info } = this.root_module.data;
    for (const character_info of Object.values(characters_info)) {
      const { id, force_new } = character_info;
      const root = new ScriptingSystem.Root();
      this.containers_map[id] = root;
      root.ext.character_id = id;
    }

    // Setup roots
    for (const [id, scripting_system_root] of Object.entries(
      this.containers_map
    )) {
      this.root_module.data.characters_info[id] = {
        character_data: {},
        land_data: {},
        world_data: {
          lands_map: {},
          characters_map: {},
          environment_objects_map: {},
          virtual_worlds_map: {}
        },
        action_message_packets: [],
        virtual_world_packets: []
      };
      scripting_system_root.install_data(
        this.root_module.data.characters_info[id]
      );

      scripting_system_root.install_api(
        ({ root, fn_full_name, script_id, query_id, timeout, args }) => {
          this.root_module.managers.world_client.send("process_api", {
            character_id: root.ext.character_id,
            api_name: fn_full_name,
            timeout,
            args
          });
        }
      );
      scripting_system_root.install_scripts(this.am_data.scripts);
      scripting_system_root.install_forms(this.am_data.forms);
      scripting_system_root.install_programs(this.am_data.programs);
      scripting_system_root.install_system(
        this.am_data.systems[Object.keys(this.am_data.systems)[0]]
      );
      scripting_system_root.install_ext({
        root_module: this.root_module
      });
      scripting_system_root._debug_enabled = true;
    }
  }

  emit_data() {
    // Set land_id
    const { characters_info } = this.root_module.data;

    for (const [id, character_info] of Object.entries(characters_info)) {
      const { character_data, land_data, world_data } = character_info;
      if ("map" in land_data) {
        // set character land id
        for (const point of land_data.map) {
          if (point.characters_list.includes(character_data.id)) {
            character_data.land_id = land_data.id;
            break;
          }
        }
        // Find door id
        const is_door = (id) => {
          if (!(id in world_data.environment_objects_map)) return false;
          return world_data.environment_objects_map[id].type === "portal";
        };
        for (const point of land_data.map) {
          for (const object_id of point.objects_list) {
            if (is_door(object_id)) {
              land_data.doors_id = object_id;
              break;
            }
          }
        }
      }

      // Set inside_virtual_world
      character_data.inside_virtual_world =
        character_data.virtual_world_id != null &&
        character_data.virtual_world_id !== "";

      // Set choice
      character_data.choice = "";

      for (const [val_name, val_value] of Object.entries(character_data)) {
        if (!(id in this.containers_map))
          throw new Error(`Character[${id}] does not belong to any container`);
        const scripting_system_root = this.containers_map[id];
        scripting_system_root.signals_event_emitter.emit(val_name, val_value);
      }
    }
  }
  parse_virtual_world_packets() {
    const parse_packet = (packet) => {
      const { character_id, packet_id, packet_data } = packet;

      if (packet_id === "data") {
        this.root_module.data.characters_info[
          character_id
        ].virtual_world_data = packet_data;
      } else if (packet_id === "message") {
        logger.log("Virtual world message: ", packet_data);
      } else {
        logger.error(`Unknown virtual world packet[${packet_id}]: ${packet}`);
      }
    };

    for (const character_info of Object.values(
      this.root_module.data.characters_info
    )) {
      const { virtual_world_packets } = character_info;
      if (virtual_world_packets == null) break;

      const locked_length = virtual_world_packets.length;
      for (let i = 0; i < locked_length; i++)
        parse_packet(virtual_world_packets.shift());
    }
  }

  _check_ready() {
    if (
      Object.keys(this.am_data).length > 0 &&
      Object.keys(this.am_data.systems).length > 0
    ) {
      this._ready = true;
      this._reload();
    }
  }
}

module.exports = AM;
