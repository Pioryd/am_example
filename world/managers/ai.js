const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { create_logger, Util } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const DEFAULT_CONFIG = {
  ai_modules_folder: "ai_modules"
};

class AI {
  constructor({ root_module, config }) {
    this.event_emitter = new EventEmitter();
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this._ai_modules_classes = {};

    /** example: [object_id][module_name] = module_instance */
    this.objects_ai = {};
  }

  initialize() {
    this._load_ai_classes();
  }

  terminate() {
    this.event_emitter.emit("module_terminate");
  }

  poll() {
    this.event_emitter.emit("module_poll");
  }

  add_object(id) {
    if (this.objects_ai[id] != null) return;
    this.objects_ai[id] = {};
  }

  remove_object(id) {
    if (this.objects_ai[id] == null) return;
    for (const module of Object.values(this.objects_ai[id]))
      this.event_emitter.emit("module_terminate", module);

    delete this.objects_ai[id];
  }

  process_ai_api({ object_id, module_name, api, data }) {
    try {
      this.objects_ai[object_id][module_name][api](data);
    } catch (e) {
      logger.error(
        "Unable to process api. " +
          JSON.stringify({ api, module_name, object_id, data }, null, 2) +
          `${e}`
      );
    }
  }

  update_ai_modules(object_id, modules) {
    const remove_not_actual_modules = (object_id, modules_names) => {
      for (const module_name of Object.keys(this.objects_ai[object_id])) {
        if (!modules_names.includes(module_name)) {
          const ai_module = this.objects_ai[object_id][module_name];
          this.event_emitter.emit("module_terminate", ai_module);

          delete this.objects_ai[object_id][module_name];
        }
      }
    };
    const add_missing_modules = (object_id, modules_names) => {
      for (const module_name of modules_names) {
        if (this.objects_ai[object_id][module_name] != null) continue;

        const ai_module = new this._ai_modules_classes[module_name]({
          event_emitter: this.event_emitter,
          world: this.root_module.managers.world
        });
        this.objects_ai[object_id][module_name] = ai_module;
        this.event_emitter.emit("module_initialize", ai_module);
      }
    };

    remove_not_actual_modules(object_id, modules);
    add_missing_modules(object_id, modules);
  }

  _load_ai_classes() {
    const ai_modules_folder_full_name = path.join(
      this.root_module.application.root_full_name,
      this.config.ai_modules_folder
    );

    if (
      ai_modules_folder_full_name == null ||
      !fs.existsSync(ai_modules_folder_full_name)
    )
      throw new Error(`Not found folder[${ai_modules_folder_full_name}]`);

    const dirs = Util.get_directories(ai_modules_folder_full_name);
    const files = Util.get_files(ai_modules_folder_full_name).map((el) => {
      return el.split(".").slice(0, -1).join(".");
    });

    for (const module_name of [...dirs, ...files]) {
      this._ai_modules_classes[module_name] = require(path.join(
        ai_modules_folder_full_name,
        module_name
      ));
    }
  }
}

module.exports = AI;
