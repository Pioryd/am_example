console.log("test");

const world_manager = modules.module_animal.managers.world;

function change_position(position_x) {
  world_manager.send_data_character_change_position({
    position_x
  });
}
function change_land(land_id) {
  world_manager.send_data_character_change_land({
    land_id
  });
}
function add_friend(name) {
  //todo
  // check if exist
  world_manager.send_data_character_add_friend({
    name
  });
}
function remove_friend(name) {
  //todo
  // check if contains that friend name
  world_manager.send_data_character_remove_friend({
    name
  });
}
function change_state(name) {
  world_manager.send_data_character_change_state({
    name
  });
}
function change_action(name) {
  world_manager.send_data_character_change_action({
    name
  });
}
function change_activity(name) {
  world_manager.send_data_character_change_activity({
    name
  });
}
function process_action_message({ name, text }) {
  world_manager.send_action_message({ name, text });
}
function enter_virtual_world(id) {
  world_manager.send_enter_virtual_world(id);
}
function leave_virtual_world() {
  world_manager.send_leave_virtual_world();
}
function send_virtual_world({ packet_id, packet_data }) {
  world_manager.send_virtual_world({ packet_id, packet_data });
}
function process_script_action({ object_id, action_id, dynamic_args }) {
  world_manager.send_process_script_action({
    object_id,
    action_id,
    dynamic_args
  });
}

// change_position(0);

// change_land("5e24ef080c504f362cb6427a");

// add_friend("AM_2");

// remove_friend("AM_2");

// change_state("S1");
// change_action("A1");
// change_activity("AC1");

// leave_virtual_world();
// send_virtual_world({
//   packet_id: "message",
//   packet_data: { text: `console.log(data)` }
// });

//send_virtual_world({ packet_id: "data", packet_data: {} });

// process_script_action({
//   object_id: "5e24ef080c504f362cb6427c",
//   action_id: 0,
//   dynamic_args: {}
// });
