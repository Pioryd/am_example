const path = require("path");
const { Client } = require(path.join(global.node_modules_path, "am_framework"));

class VirtualWorld {
  constructor(data, manager_virtual_worlds) {
    this._data = data;
    this.client = new Client({
      url: this._data.url,
      options: { packet_timeout: 0 }
    });

    this.client.events.connected = () => {
      this.send("accept_connection", {});
    };

    this.client.add_parse_packet_dict({
      character: (...args) => {
        manager_virtual_worlds.process_character_packet_received_from_virtual_world(
          ...args
        );
      },
      world: (...args) => {
        manager_virtual_worlds.process_world_packet_received_from_virtual_world(
          ...args
        );
      }
    });
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
    return this._data.characters_list.includes(character_id);
  }

  character_enter(character_id) {
    if (!this.contains_character(character_id))
      this._data.characters_list.push(character_id);

    this.send("world", {
      packet_id: "character_enter",
      packet_data: { character_id }
    });
  }

  character_leave(character_id) {
    if (this.contains_character(character_id))
      this._data.characters_list.splice(
        this._data.characters_list.indexOf(character_id),
        1
      );

    this.send("world", {
      packet_id: "character_leave",
      packet_data: { character_id }
    });
  }
}

module.exports = { VirtualWorld };
