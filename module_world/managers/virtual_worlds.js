const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

class VirtualWorlds {
  constructor(root_module) {
    this.root_module = root_module;
  }

  initialize() {
    for (const virtual_world of Object.values(
      this.root_module.data.virtual_worlds_map
    )) {
      virtual_world.connect();
    }
  }

  terminate() {
    for (const virtual_world of Object.values(
      this.root_module.data.virtual_worlds_map
    )) {
      virtual_world.disconnect();
    }
  }

  poll() {
    for (const virtual_world of Object.values(
      this.root_module.data.virtual_worlds_map
    )) {
      virtual_world.poll();
    }
  }

  insert_character(character_id, virtual_world_id) {
    this.remove_character(character_id);

    if (virtual_world_id in this.root_module.data.virtual_worlds_map) {
      const virtual_world = this.root_module.data.virtual_worlds_map[
        virtual_world_id
      ];
      virtual_world.character_enter(character_id);
    }
  }

  remove_character(character_id) {
    for (const virtual_world of Object.values(
      this.root_module.data.virtual_worlds_map
    )) {
      virtual_world.character_leave(character_id);
    }
  }

  process_packet_received_from_character(character_id, received_data) {
    const characters_manager = this.root_module.managers.characters;
    const character = characters_manager._get_character_by_id(character_id);

    if (character == null)
      throw new Error(
        `Unable send packet to Virtual World.` +
          ` Wrong character id[${character_id}].`
      );

    const virtual_world_id = character.get_virtual_world_id();
    const { packet_id, packet_data } = received_data;
    for (const [id, virtual_world] of Object.entries(
      this.root_module.data.virtual_worlds_map
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

    logger.log("Unable to process_packet_received_from_character");
  }

  process_character_packet_received_from_virtual_world(received_data) {
    const { character_id, packet_id, packet_data } = received_data;

    this.root_module.managers.mam.send(character_id, "virtual_world", {
      packet_id,
      packet_data
    });
  }

  process_world_packet_received_from_virtual_world(received_data) {
    logger.error(
      "process_world_packet_received_from_virtual_world is NOT supported yet"
    );
  }
}

module.exports = VirtualWorlds;
