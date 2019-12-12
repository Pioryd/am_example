const fw_util = require("./util.js");

class ModulesManager {
  constructor({ event_emiter, modules_directory, events_list }) {
    this.event_emiter = event_emiter;
    this.events_list = events_list;
    this.modules_directory = modules_directory;
    this.modules_list = {};
    this.event_module_bounds = {};
  }

  add_event(event_name, module_name) {
    if (!(event_name in this.modules_list[module_name])) return;

    if (event_name in this.event_module_bounds[module_name])
      this.remove_event(event_name, module_name);

    this.event_module_bounds[module_name][event_name] = (...args) => {
      this.modules_list[module_name][event_name](...args);
    };
    this.event_emiter.on(
      event_name,
      this.event_module_bounds[module_name][event_name]
    );
  }

  remove_event(event_name, module_name) {
    if (!(event_name in this.modules_list[module_name])) return;
    if (!(event_name in this.event_module_bounds[module_name])) return;

    this.event_emiter.off(
      event_name,
      this.event_module_bounds[module_name][event_name]
    );
    delete this.event_module_bounds[module_name][event_name];
  }

  init_module(module_name) {
    this.event_module_bounds[module_name] = {};
    for (const event_name of this.events_list)
      this.add_event(event_name, module_name);
  }

  terminate_module(module_name) {
    for (const event_name of this.events_list) {
      if (event_name in this.modules_list[module_name])
        this.remove_event(event_name, module_name);
    }
  }

  load_modules() {
    let modules_names = fw_util.get_directories(this.modules_directory);

    for (const module_name of modules_names) {
      const path = `${this.modules_directory}/${module_name}`;

      if (fw_util.is_path_exist(path)) {
        let fw_module = require("../" + path);
        let fw_module_class_name = Object.entries(fw_module)
          .values()
          .next().value[0];
        this.modules_list[module_name] = new fw_module[fw_module_class_name]();
        this.init_module(module_name);
      } else console.log("Module path does NOT exist: " + path);
    }
  }
}

module.exports = { ModulesManager };
