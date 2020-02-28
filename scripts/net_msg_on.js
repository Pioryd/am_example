let server_logger = modules.module_world.managers.world_server.server.logger;
server_logger.options = {
  ...server_logger.options,
  print_log: true,
  print_info: true,
  print_error: true,
  print_warn: true,
  print_debug: true
};

server_logger = modules.module_world.managers.admin_server.server.logger;
server_logger.options = {
  ...server_logger.options,
  print_log: true,
  print_info: true,
  print_error: true,
  print_warn: true,
  print_debug: true
};

for (const [id, virtual_world] of Object.entries(
  modules.module_world.data.virtual_worlds_map
)) {
  virtual_world.client.logger.options = {
    ...virtual_world.client.logger.options,
    print_log: true,
    print_info: true,
    print_error: true,
    print_warn: true,
    print_debug: true
  };
}
