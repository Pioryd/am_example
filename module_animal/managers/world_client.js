const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_animal", file_name: __filename });
const { Client } = require(path.join(global.node_modules_path, "am_framework"));
/*
Responsible for:
*/
class WorldClient {
  constructor(module_animal) {
    this.module_animal = module_animal;

    const { url } = this.module_animal.config.world_client;
    this.client = new Client({
      url,
      options: { packet_timeout: 0, send_delay: 1000 }
    });
  }

  initialize() {
    const { login, password } = this.module_animal.config.world_client;
    this.client.events.connected = () => {
      this._send("accept_connection", { login, password });
    };
    this._add_parse_packet_dict();

    this._connect();
  }

  terminate() {
    this._disconnect();
  }

  poll() {
    this.client.poll();
  }

  _connect() {
    this.client.connect();
  }

  _disconnect() {
    this.client.disconnect();
  }

  _send(packet_id, data) {
    this.client.send(packet_id, data);
  }

  // parse methods
  _add_parse_packet_dict() {
    this.client.add_parse_packet_dict({
      login: data => {
        this.send_data_character({});
        this.send_data_land({});
        this.send_data_world({});
      },
      data_character: data => {
        this.module_animal.data.character_data = { ...data };
        this.send_data_character({});
      },
      data_land: data => {
        this.module_animal.data.land_data = { ...data };
        this.send_data_land({});
      },
      data_world: data => {
        this.module_animal.data.world_data = { ...data };
        this.send_data_world({});
      },
      action_message: data => {
        this.module_animal.data.action_message_packets = [
          ...this.module_animal.data.action_message_packets,
          { ...data }
        ];
      },
      virtual_world: data => {
        this.module_animal.data.virtual_world_packets = [
          ...this.module_animal.data.virtual_world_packets,
          { ...data }
        ];
      }
    });
  }

  // send methods
  send_data_character() {
    this._send("data_character");
  }

  send_data_land() {
    this._send("data_land");
  }

  send_data_world() {
    this._send("data_world");
  }

  send_data_character_change_position({ position_x }) {
    this._send("data_character_change_position", {
      position_x
    });
  }

  send_data_character_change_land({ land_id }) {
    this._send("data_character_change_land", { land_id });
  }

  send_data_character_add_friend({ name }) {
    this._send("data_character_add_friend", { name });
  }

  send_data_character_remove_friend({ name }) {
    this._send("data_character_remove_friend", { name });
  }

  send_data_character_change_state({ name }) {
    this._send("data_character_change_state", { name });
  }

  send_data_character_change_action({ name }) {
    this._send("data_character_change_action", { name });
  }

  send_data_character_change_activity({ name }) {
    this._send("data_character_change_activity", { name });
  }

  send_action_message({ name, text }) {
    this._send("action_message", { name, text });
  }

  // Currently is not used by server
  send_enter_virtual_world({ id }) {
    this._send("enter_virtual_world", { id });
  }

  send_leave_virtual_world() {
    this._send("leave_virtual_world", {});
  }

  send_virtual_world({ packet_id, packet_data }) {
    this._send("virtual_world", { packet_id, packet_data });
  }

  send_process_script_action({ object_id, action_id, dynamic_args }) {
    this._send("process_script_action", {
      object_id,
      action_id,
      dynamic_args
    });
  }
}

module.exports = WorldClient;
