const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

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

  insert_character(character_id, virtual_world_id) {
    this.remove_character(character_id);

    if (virtual_world_id in this.module_world.data.virtual_worlds_map) {
      const virtual_world = this.module_world.data.virtual_worlds_map[
        virtual_world_id
      ];
      virtual_world.character_enter(character_id);
    }
  }

  remove_character(character_id) {
    for (const virtual_world of Object.values(
      this.module_world.data.virtual_worlds_map
    )) {
      virtual_world.character_leave(character_id);
    }
  }

  process_packet_received_from_character(character_id, received_data) {
    const characters_manager = this.module_world.managers.characters;
    const character = characters_manager._get_character_by_id(character_id);

    const virtual_world_id = character.get_virtual_world_id();
    const packet_id = received_data.packet_id;
    const packet_data = received_data.packet_data;
    for (const [id, virtual_world] of Object.entries(
      this.module_world.data.virtual_worlds_map
    )) {
      if (
        id === virtual_world_id &&
        virtual_world.contains_character(character_id)
      ) {
        virtual_world.send("character", {
          character_id,
          packet_id,
          packet_data
        });
        return;
      }
    }

    console.log("Unable to process_packet_received_from_character");
  }

  process_character_packet_received_from_virtual_world(received_data) {
    const character_id = received_data.character_id;
    const packet_id = received_data.packet_id;
    const data = received_data.packet_data;

    const characters_manager = this.module_world.managers.characters;
    const connection_id = characters_manager.get_connection_id(character_id);

    if (connection_id == null) {
      logger.error(
        "Unable to parse CHARACTER packet from virtual world. Character[" +
          character_id +
          "]"
      );
      return;
    }

    this.module_world.managers.world_server.send_packet.virtual_world(
      connection_id,
      this.module_world.managers,
      { packet_id, data }
    );
  }

  process_world_packet_received_from_virtual_world(received_data) {
    console.error(
      "process_world_packet_received_from_virtual_world is NOT supported yet"
    );
  }
}

module.exports = VirtualWorlds;
