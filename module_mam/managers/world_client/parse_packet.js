const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_mam", file_name: __filename });

function handle_error(connection, received_data, managers, message) {
  if (message != null) logger.error("Error:", message);
  logger.error(
    "Connection ID:",
    connection.get_id(),
    "Received_data:",
    received_data
  );

  managers.admin_server.send(connection.get_id(), "error", {
    connection_id: connection.get_id(),
    received_data: received_data,
    error: message != null ? message : ""
  });
}

module.exports = {
  accept_connection: (data, managers) => {
    const { characters_info } = data;
    managers.world_client.module_mam.data.characters_info = characters_info;

    managers.am.reload();

    for (const character_id of Object.keys(
      managers.world_client.module_mam.data.characters_info
    )) {
      managers.world_client.send("data_character", { character_id });
      managers.world_client.send("data_land", { character_id });
      managers.world_client.send("data_world", { character_id });
    }
  },
  data_character: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].character_data = {
      ...data
    };
    managers.world_client.send("data_character", { character_id });
  },
  data_land: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].land_data = {
      ...data
    };
    managers.world_client.send("data_land", { character_id });
  },
  data_world: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].world_data = {
      ...data
    };
    managers.world_client.send("data_world", { character_id });
  },
  action_message: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].action_message_packets = [
      ...managers.world_client.module_mam.data.characters_info[character_id]
        .action_message_packets,
      { ...data }
    ];
  },
  virtual_world: (data, managers) => {
    const { character_id } = data;
    managers.world_client.module_mam.data.characters_info[
      character_id
    ].virtual_world_packets = [
      ...managers.world_client.module_mam.data.characters_info[character_id]
        .virtual_world_packets,
      { ...data }
    ];
  }
};
