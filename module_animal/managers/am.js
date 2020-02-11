const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_animal", file_name: __filename });
const { ScriptingSystem, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

// Draft -> Database
const tmp_data_api = require("../tmp_data/api");
const tmp_data_forms = require("../tmp_data/forms");
const tmp_data_system = require("../tmp_data/system");

class AM {
  constructor(module_animal) {
    this.module_animal = module_animal;

    this.stopwatches_map = {
      check_data: new Stopwatch(1 * 1000)
    };

    this.scripting_system_root = new ScriptingSystem.Root();
  }

  initialize() {
    this.scripting_system_root.install_system(tmp_data_system);
    this.scripting_system_root.install_forms(tmp_data_forms);
    this.scripting_system_root.install_api(tmp_data_api);
    this.scripting_system_root.install_data(this.module_animal.data);
    this.scripting_system_root.install_ext({
      module_animal: this.module_animal
    });
  }

  terminate() {
    this.scripting_system_root.terminate();
  }

  poll() {
    if (this.stopwatches_map.check_data.is_elapsed()) {
      scripting_system_root.process();
      this.parse_virtual_world_packets();
      this.stopwatches_map.check_data.reset();
    }
  }

  parse_virtual_world_packets() {
    const parse_packet = packet => {
      const { packet_id, data } = packet;

      if (packet_id === "data") {
        this.module_animal.data.virtual_world_data = data;
      } else if (packet_id === "message") {
        logger.log("Virtual world message: " + data);
      } else {
        logger.error("Unknown virtual world packet: " + { packet });
      }
    };

    const { virtual_world_packets } = this.module_animal.data;

    const locked_length = virtual_world_packets.length;
    for (let i = 0; i < locked_length; i++)
      parse_packet(virtual_world_packets.shift());
  }
}

module.exports = AM;
