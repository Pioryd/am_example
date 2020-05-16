const fs = require("fs");
const path = require("path");

const _ = require(path.join(global.node_modules_path, "lodash"));
const { Util, create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const DEFAULT_CONFIG = { api_folder: "api" };

class ApiLoader {
  constructor({ root_module, config }) {
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
      this.root_module.application.root_full_name,
      this.config.api_folder
    );

    if (api_folder_full_name != null && fs.existsSync(api_folder_full_name)) {
      for (const file of Util.get_files(api_folder_full_name)) {
        const file_name_without_extension = file
          .split(".")
          .slice(0, -1)
          .join(".");
        this.api_map[file_name_without_extension] = require(path.join(
          api_folder_full_name,
          file
        ));
      }
    }
  }

  process({ object_id, api, timeout, args }, callback) {
    try {
      let api_to_process = null;
      eval(`api_to_process = this.api_map.${api}`);
      api_to_process(
        {
          root_module: this.root_module,
          object_id,
          timeout,
          args
        },
        callback
      );
    } catch (e) {
      logger.error(
        `Unable to process api. Error: ${e.message}. Data ${JSON.stringify(
          { object_id, api, timeout, args },
          null,
          2
        )}`
      );
    }
  }
}

module.exports = ApiLoader;
