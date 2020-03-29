const path = require("path");
const fs = require("fs");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_mam", file_name: __filename });
const { ScriptingSystem, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

// Draft -> Database
const tmp_data_api = require("../tmp_data/api");
const tmp_data_forms = require("../tmp_data/forms");
const tmp_data_programs = require("../tmp_data/programs");
const tmp_data_system = require("../tmp_data/system");

const scripts_path_full_name = path.join(
  __dirname,
  "..",
  "tmp_data",
  "scripts"
);

class AM {
  constructor(module_mam) {
    this.module_mam = module_mam;
    this.stopwatches_map = {
      check_data: new Stopwatch(1 * 1000)
    };
    this.containers_map = {};
    for (const id of this.module_mam.config.characters.included) {
      const root = new ScriptingSystem.Root();
      this.containers_map[id] = root;
      root.ext.character_id = id;
    }
  }

  initialize() {
    for (const scripting_system_root of Object.values(this.containers_map)) {
      scripting_system_root._debug_enabled = true;
    }

    const scripts_source = {};
    for (const script_file of fs.readdirSync(scripts_path_full_name)) {
      const parsed = ScriptingSystem.AML.parse(
        fs.readFileSync(
          path.join(scripts_path_full_name, script_file),
          "utf8",
          err => {
            if (err) throw err;
          }
        )
      );

      scripts_source[parsed.id] = parsed;
    }

    for (const [id, scripting_system_root] of Object.entries(
      this.containers_map
    )) {
      this.module_mam.data.characters_info[id] = {
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
        this.module_mam.data.characters_info[id]
      );
      scripting_system_root.install_api(tmp_data_api);
      scripting_system_root.install_scripts(scripts_source);
      scripting_system_root.install_forms(tmp_data_forms);
      scripting_system_root.install_programs(tmp_data_programs);
      scripting_system_root.install_system(tmp_data_system["Animal_ID"]);
      scripting_system_root.install_ext({
        module_mam: this.module_mam
      });
    }
  }

  terminate() {
    for (const scripting_system_root of Object.values(this.containers_map)) {
      scripting_system_root.terminate();
    }
  }

  poll() {
    if (this.stopwatches_map.check_data.is_elapsed()) {
      this.emit_data();
      for (const scripting_system_root of Object.values(this.containers_map)) {
        scripting_system_root.process();
      }
      this.parse_virtual_world_packets();
      this.stopwatches_map.check_data.reset();
    }
  }

  emit_data() {
    // Set land_id
    const { characters_info } = this.module_mam.data;

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
        const is_door = id => {
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
    const parse_packet = packet => {
      const { packet_id, data } = packet;
      const { character_id } = data;

      if (packet_id === "data") {
        this.module_mam.data.characters_info[
          character_id
        ].virtual_world_data = data;
      } else if (packet_id === "message") {
        logger.log("Virtual world message: ", data);
      } else {
        logger.error("Unknown virtual world packet: " + { packet });
      }
    };

    for (const character_info of Object.values(
      this.module_mam.data.characters_info
    )) {
      const { virtual_world_packets } = character_info;

      const locked_length = virtual_world_packets.length;
      for (let i = 0; i < locked_length; i++)
        parse_packet(virtual_world_packets.shift());
    }
  }
}

module.exports = AM;
