const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_jankenpon", file_name: __filename });
const { Util, Stopwatch } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

class AM {
  constructor(module_animal) {
    this.module_animal = module_animal;

    this.stopwatches_map = {
      check_data: new Stopwatch(1 * 1000)
    };
  }

  initialize() {}

  terminate() {}

  poll() {
    if (this.stopwatches_map.check_data.is_elapsed()) {
      this.check_data();
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

  check_data() {
    const {
      default_land_id,
      virtual_world_id,
      energy,
      stress
    } = this.module_animal.data.character_data;
    const world_client = this.module_animal.managers.world_client;

    // Te id powinno by wyszukane
    const script_action_doors = {
      object_id: "5e419cbb6204d91bf8bfb29e",
      action_id: 0,
      dynamic_args: {}
    };

    // statistics
    if (virtual_world_id != "") {
      if (stress > 80) {
        world_client.send_leave_virtual_world();
      } else {
        // Game in virtual world
        if (this.module_animal.data.virtual_world_data == null) {
          world_client.send_virtual_world({
            packet_id: "data",
            packet_data: {}
          });
          return;
        }

        const choices = ["rock", "paper", "scissors"];
        const chosen_choice = choices[Util.get_random_int(0, 2)];

        world_client.send_virtual_world({
          packet_id: "message",
          packet_data: { text: chosen_choice }
        });
        world_client.send_virtual_world({ packet_id: "data", packet_data: {} });
      }
    } else {
      this.module_animal.data.virtual_world_data = null;

      if (energy < 20 && stress < 20) {
        world_client.send_process_script_action(script_action_doors);
      } else if (energy < 10) {
        world_client.send_data_character_change_land({
          land_id: default_land_id
        });
        world_client.send_process_script_action(script_action_doors);
      }
    }
  }
}

module.exports = AM;
