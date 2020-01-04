const path = require("path");
const log = require(path.join(
  global.node_modules_path,
  "simple-node-logger"
)).createSimpleLogger();

/*
Responsible for:
  - virtual worlds
*/
class VirtualWorlds {
  constructor(module_world) {
    this.module_world = module_world;
  }

  initialize() {
    for (const virtual_world of Object.values(
      this.module_world.data.virtual_worlds_map
    )) {
      virtual_world.connect();
    }
  }

  terminate() {
    for (const virtual_world of Object.values(
      this.module_world.data.virtual_worlds_map
    )) {
      virtual_world.disconnect();
    }
  }

  poll() {
    for (const virtual_world of Object.values(
      this.module_world.data.virtual_worlds_map
    )) {
      virtual_world.poll();
    }
  }

  insert_character(character_name, virtual_world_id) {
    remove_character(character_name);

    if (virtual_world_id in this.module_world.data.virtual_worlds_map) {
      const virtual_world = this.module_world.data.virtual_worlds_map[
        virtual_world_id
      ];
      virtual_world.character_enter(character_name);
    }
  }

  remove_character(character_name) {
    for (const virtual_world of Object.values(
      this.module_world.data.virtual_worlds_map
    )) {
      virtual_world.character_leave(character_name);
    }
  }

  process_packet_received_from_user(character_name, received_data) {
    const virtual_world_id = received_data.id;
    const packet_id = received_data.packet_id;
    const data = received_data.data;
    for (const [id, virtual_world] of Object.entries(
      this.module_world.data.virtual_worlds_map
    )) {
      if (
        id === virtual_world_id &&
        virtual_world.contains_character(character_name)
      ) {
        virtual_world.send("character", {
          name: character_name,
          packet_id,
          data
        });
      }
    }
  }

  process_user_packet_received_from_virtual_world(connection, received_data) {
    const character_name = received_data.character_name;
    const packet_id = received_data.data;
    const data = received_data.data;
    const characters_manager = this.module_world.managers.characters;
    const connection_id = characters_manager.get_character_connection_id(
      character_name
    );

    if (connection_id == null) {
      console.error(
        "Unable to parse packet from virtual world. Connection[" +
          connection.get_id() +
          "]"
      );
      return;
    }

    this.module_world.managers.server.send_packet.virtual_world(
      connection_id,
      this.module_world.managers,
      { packet_id, data }
    );
  }

  process_world_packet_received_from_virtual_world(connection, received_data) {}
}

module.exports = VirtualWorlds;
