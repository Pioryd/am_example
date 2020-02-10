let server_logger = modules.module_animal.managers.admin_server.server.logger;
server_logger.options = {
  ...server_logger.options,
  print_log: false,
  print_info: false,
  print_error: false,
  print_warn: false,
  print_debug: false
};
