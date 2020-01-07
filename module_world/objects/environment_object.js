const path = require("path");
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

class EnvironmentObject {
  constructor(data) {
    this._data = data;
  }

  get_id() {
    return this._data.id;
  }

  get_name() {
    return this._data.name;
  }

  get_dimension() {
    return this._data.world;
  }

  contains_character(name) {
    return name in this._data.characters_list;
  }

  perform_action(character_name, action) {
    if (!this._data.actions.includes(action)) {
      logger.error(
        `Unknown action [${action}] by character [${character_name}]` +
          ` on object [${this.get_id()}]`
      );
      return;
    }

    if (action === "use") {
      on_use(character_name);
    }
  }
}

module.exports = { EnvironmentObject };
