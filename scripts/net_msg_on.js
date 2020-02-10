let server_logger = modules.module_animal.managers.admin_server.server.logger;
server_logger.options = {
  ...server_logger.options,
  print_log: true,
  print_info: true,
  print_error: true,
  print_warn: true,
  print_debug: true
};
