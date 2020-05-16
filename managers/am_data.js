const path = require("path");
const { AM } = require(path.join(global.node_modules_path, "am_framework"));

class AM_Data {
  constructor({ root_module }) {
    this.root_module = root_module;

    this.data_to_load = {
      am_system: { data_name: "systems", loaded: false },
      am_program: { data_name: "programs", loaded: false },
      am_form: { data_name: "forms", loaded: false },
      am_script: { data_name: "scripts", loaded: false }
    };

    this.am_source = {};

    this.loaded = false;
  }

  initialize() {}

  terminate() {}

  poll() {
    if (!this.loaded) this._load_data();
  }

  reload_data() {
    this.loaded = false;
    for (const data_info of Object.values(this.data_to_load))
      data_info.loaded = false;

    this._load_data();
  }

  _load_data() {
    const { managers } = this.root_module;

    if (this.is_loaded() || !managers.editor.is_connected()) return;

    for (const [data_name, data_info] of Object.entries(this.data_to_load)) {
      managers.editor.get_data(data_name, (objects_list, message) => {
        if (objects_list == null) return;
        this.am_source[data_info.data_name] = {};
        for (const object of objects_list)
          this.am_source[data_info.data_name][object.id] = object;
        this.data_to_load[data_name].loaded = true;
      });
    }
  }

  get_full_system_data(system_id) {
    const am_data = { systems: {}, programs: {}, forms: {}, scripts: {} };

    const system = this.am_source.system[system_id]._data;
    if (system == null) throw new Error(`Not found system[${system_id}].`);
    am_data.systems[system_id] = system;

    for (const program_id of system.programs) {
      const program = this.am_source.programs[program_id];
      if (program == null) throw new Error(`Not found program[${program_id}].`);
      am_data.programs[program_id] = program;

      for (const form_id of program.forms) {
        const form = this.am_source.forms[form_id];
        if (form == null) throw new Error(`Not found form[${form_id}].`);
        am_data.forms[form_id] = form;

        for (const script_id of form.scripts) {
          const script = this.am_source.scripts[script_id];
          if (script == null)
            throw new Error(`Not found script[${script_id}].`);
          am_data.scripts[script_id] = AM.AML.parse(script.source);
        }
      }
    }

    return am_data;
  }

  is_loaded() {
    for (const data_info of Object.values(this.data_to_load))
      if (!data_info.loaded) return false;
    this.loaded = true;
    return true;
  }
}

module.exports = AM_Data;
