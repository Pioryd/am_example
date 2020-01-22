const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_bot", file_name: __filename });

/*
Responsible for:
*/
class World {
  constructor(module_bot) {
    this.module_bot = module_bot;

    this.client.events.connected = () => {
      this._send("accept_connection", {});
    };

    this._add_parse_packet_dict();
  }

  connect() {
    this.client.connect();
  }

  disconnect() {
    this.client.disconnect();
  }

  poll() {
    this.client.poll();
  }

  _send(packet_id, data) {
    this.client.send(packet_id, data);
  }

  // parse methods
  _add_parse_packet_dict() {
    this.client.add_parse_packet_dict({
      login: data => {
        set_state_logged_as(data.character_name);
        set_state_admin(data.admin);

        this.send_data_character(get_client(), {});
        this.send_data_land(get_client(), {});
        this.send_data_world(get_client(), {});
      },
      data_full: data => {
        set_state_data_full({ ...data });
        this.send_data_full(get_client(), {});
      },
      data_character: data => {
        set_state_data_character({ ...data });
        this.send_data_character(get_client(), {});
      },
      data_land: data => {
        set_state_data_land({ ...data });
        this.send_data_land(get_client(), {});
      },
      data_world: data => {
        set_state_data_world({ ...data });
        this.send_data_world(get_client(), {});
      },
      action_message: data => {
        set_state_packets_action_message([
          ...state_packets_action_message,
          { ...data }
        ]);
      },
      virtual_world: data => {
        set_state_packets_virtual_world([
          ...state_packets_virtual_world,
          { ...data }
        ]);
      }
    });
  }

  // send methods
  send_data_full(client) {
    this._send(client, "data_full");
  }

  send_data_character(client) {
    this._send(client, "data_character");
  }

  send_data_land(client) {
    this._send(client, "data_land");
  }

  send_data_world(client) {
    this._send(client, "data_world");
  }

  send_data_character_change_position(client, { position_x }) {
    this._send(client, "data_character_change_position", {
      position_x
    });
  }

  send_data_character_change_land(client, { land_id }) {
    this._send(client, "data_character_change_land", { land_id });
  }

  send_data_character_add_friend(client, { name }) {
    this._send(client, "data_character_add_friend", { name });
  }

  send_data_character_remove_friend(client, { name }) {
    this._send(client, "data_character_remove_friend", { name });
  }

  send_data_character_change_state(client, { name }) {
    this._send(client, "data_character_change_state", { name });
  }

  send_data_character_change_action(client, { name }) {
    this._send(client, "data_character_change_action", { name });
  }

  send_data_character_change_activity(client, { name }) {
    this._send(client, "data_character_change_activity", { name });
  }

  send_action_message(client, { name, text }) {
    this._send(client, "action_message", { name, text });
  }

  // Currently is not used by server
  send_enter_virtual_world(client, { id }) {
    this._send(client, "enter_virtual_world", { id });
  }

  send_leave_virtual_world(client) {
    this._send(client, "leave_virtual_world", {});
  }

  send_virtual_world(client, { packet_id, packet_data }) {
    this._send(client, "virtual_world", { packet_id, packet_data });
  }

  send_process_script_action(client, { object_id, action_id, dynamic_args }) {
    this._send(client, "process_script_action", {
      object_id,
      action_id,
      dynamic_args
    });
  }
}

module.exports = World;
