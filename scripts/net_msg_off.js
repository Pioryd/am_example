let server_logger = modules.module_world.managers.world_server.server.logger;
server_logger.options = {
  ...server_logger.options,
  print_log: false,
  print_info: false,
  print_error: false,
  print_warn: false,
  print_debug: false
};

server_logger = modules.module_world.managers.admin_server.server.logger;
server_logger.options = {
  ...server_logger.options,
  print_log: false,
  print_info: false,
  print_error: false,
  print_warn: false,
  print_debug: false
};

for (const [id, virtual_world] of Object.entries(
  modules.module_world.data.virtual_worlds_map
)) {
  virtual_world.client.logger.options = {
    ...virtual_world.client.logger.options,
    print_log: false,
    print_info: false,
    print_error: false,
    print_warn: false,
    print_debug: false
  };
}
