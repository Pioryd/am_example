const path = require("path");
const { Client } = require(path.join(global.node_modules_path, "am_framework"));

class VirtualWorld {
  constructor(data, on_receive) {
    this._data = data;
    this.client = new Client({ url: this._data.url, timeout: 0 });

    this.client.add_parse_packet_dict({
      virtual_world: on_receive
    });

    this.send_login_message = false;
  }

  connect() {
    this.client.connect();
  }

  disconnect() {
    this.client.disconnect();
  }

  send(data) {
    this.client.send("virtual_world", data);
  }

  poll() {
    if (!this.send_login_message && this.client.is_connected()) {
      this.send("login", {});
      this.send_login_message = true;
    }

    this.client.poll();
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  contains_character(name) {
    return name in this._data.characters_list;
  }

  character_enter(character_name) {
    if (!this._data.characters_list.contains(character_name))
      this._data.characters_list.push(character_name);
  }

  character_leave(character_name) {
    if (!this._data.characters_list.contains(character_name))
      this._data.characters_list.push(character_name);
  }
}

module.exports = { VirtualWorld };
