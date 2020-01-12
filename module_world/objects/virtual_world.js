const path = require("path");
const { Client } = require(path.join(global.node_modules_path, "am_framework"));

class VirtualWorld {
  constructor(data, on_character_receive, on_world_receive) {
    this._data = data;
    this.client = new Client({
      url: this._data.url,
      options: { timeout: 0, debug: true }
    });

    this.client.events.connected = () => {
      this.send("login", {});
    };

    this.client.add_parse_packet_dict({
      character: on_character_receive,
      world: on_world_receive
    });

    this.send_login_message = false;
  }

  connect() {
    this.client.connect();
  }

  disconnect() {
    this.client.disconnect();
  }

  send(packet_id, data) {
    this.client.send(packet_id, data);
  }

  poll() {
    this.client.poll();
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  contains_character(character_id) {
    return character_id in this._data.characters_list;
  }

  character_enter(character_id) {
    if (!this._data.characters_list.contains(character_id))
      this._data.characters_list.push(character_id);
  }

  character_leave(character_id) {
    if (!this._data.characters_list.contains(character_id))
      this._data.characters_list.push(character_id);
  }
}

module.exports = { VirtualWorld };
