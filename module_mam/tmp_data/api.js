const path = require("path");
const { Util } = require(path.join(global.node_modules_path, "am_framework"));

module.exports = {
  character: {
    change_land: (root, script_id, query_id, timeout, return_value, args) => {
      const { land_id } = args;
      const { world_client } = root.ext.module_mam.managers;
      world_client.send_data_character_change_land({
        land_id
      });
    },
    leave_virtual_world: function(
      root,
      script_id,
      query_id,
      timeout,
      return_value,
      args
    ) {
      const { world_client } = root.ext.module_mam.managers;
      world_client.send_leave_virtual_world();
    },
    use_object: (root, script_id, query_id, timeout, return_value, args) => {
      const { id } = args;
      const script_action_doors = {
        object_id: id,
        action_id: 0,
        dynamic_args: {}
      };
      const { world_client } = root.ext.module_mam.managers;
      world_client.send_process_script_action(script_action_doors);
    }
  },
  system: {
    form_run: (root, script_id, query_id, timeout, return_value, args) => {
      const { name } = args;
      root.system._current_program._run_form(name);
    }
  },
  virtual_world: {
    make_choice: (root, script_id, query_id, timeout, return_value, args) => {
      const { enemy_choice } = args;
      const { data } = root.ext.module_mam;
      const { world_client } = root.ext.module_mam.managers;

      // Game in virtual world
      if (data.virtual_world_data == null) {
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
      world_client.send_virtual_world({
        packet_id: "data",
        packet_data: {}
      });
    }
  }
};
