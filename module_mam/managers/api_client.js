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
      if (typeof value === "string")
        if (key === "remote_fn")
          return ({ fn_full_name, script_id, query_id, timeout, args }) =>
            managers.api_client.send("process_api", {
              fn_full_name,
              script_id,
              query_id,
              timeout,
              args
            });
        else if (key === "local_fn") return Util.string_to_function_ex(value);
        else throw new Error(`Wrong key[${key}]`);
      return value;
    });
  },
  process_api: (data, managers) => {
    const { script_id, query_id, value } = data;

    for (const root of Object.values(managers.am.containers_map))
      root.return_data.insert({ script_id, query_id, value });
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
