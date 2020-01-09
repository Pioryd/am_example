const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });
const { Util } = require(path.join(global.node_modules_path, "am_framework"));

class EnvironmentObject {
  constructor(data) {
    this._data = data;
    this.action_scripts_list = [];

    for (const action of this._data.action_scripts_list) {
      this.action_scripts_list.push({
        id: action.id,
        script: Util.string_to_function(action.script)
      });
    }
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  process_action_script(action_id, dynamic_args, managers) {
    if (!(action_id in this.action_scripts_list)) {
      logger.error(
        `Unknown action[${action}] with args[${dynamic_args}]` +
          ` on object [${this.get_id()}]`
      );
      return;
    }

    try {
      this.action_scripts_list[action_id].script(dynamic_args, managers);
    } catch (e) {
      logger.error(e);
    }
  }
}

module.exports = { EnvironmentObject };
