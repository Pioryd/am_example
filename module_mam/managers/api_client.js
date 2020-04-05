const path = require("path");
const { Util, Managers, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_mam",
  file_name: __filename
});

const ParsePacket = {
  accept_connection: (data, managers) => {
    const { api_map } = data;

    managers.am.api_map = JSON.parse(JSON.stringify(api_map), function(
      key,
      value
    ) {
      if (typeof value === "string") return Util.string_to_function(value);
      return value;
    });

    console.log(managers.am.api_map);
  }
};

class ApiClient extends Managers.Client {
  constructor({ root_module, config }) {
    super({
      root_module,
      config,
      parse_packet: ParsePacket,
      on_connected: () => {
        const { login, password, client_name } = config;
        this.send("accept_connection", { login, password, client_name });
      }
    });
  }
}

module.exports = ApiClient;
