const _ = require("lodash");
const path = require("path");

const DEFAULT_CONFIG = { api_folder: "api" };

class ApiLoader {
  constructor(root_module, config) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.api_map = {};
  }

  initialize() {
    this.load();
  }

  terminate() {}

  poll() {}

  load() {
    const api_folder_full_name = path.join(
      this.config.api_folder,
      this.root_module.application.root_full_name
    );

    if (api_folder_full_name != null && fs.existsSync(api_folder_full_name)) {
      for (const file of Util.get_files(api_folder_full_name))
        this.api_map[file] = require(path.join(api_folder_full_name, file));
    }
  }

  execute({ character_id, api_name, timeout, args }) {
    try {
      let api = null;
      eval(`api = this.api_map.${api_name}`);
      api({
        root_module: this.root_module,
        character_id,
        timeout,
        args
      });
    } catch (e) {
      logger.error(
        `Unable to process api. Error: ${e.message}. Data ${JSON.stringify(
          { character_id, api_name, timeout, args },
          null,
          2
        )}`
      );
    }
  }
}

module.exports = ApiLoader;
