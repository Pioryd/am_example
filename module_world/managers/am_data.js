const path = require("path");
const { ScriptingSystem } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

class AM_Data {
  constructor(module_world) {
    this.module_world = module_world;
  }

  initialize() {}

  terminate() {}

  poll() {}

  get_primary(characters_ids) {
    const { managers } = this.module_world;
    const am_data = { systems: {}, programs: {}, forms: {}, scripts: {} };

    for (const id of characters_ids) {
      const system_id = managers.characters.get_default_system_id(id);
      if (system_id == null)
        throw new Error(`Not found system[${system_id}] of character[${id}]`);
      if (am_data.systems != null && system_id in am_data.systems) continue;

      const full_system_data = this.get_full_system_data(system_id);
      for (const [id, system] of Object.entries(full_system_data.systems))
        am_data.systems[id] = system;
      for (const [id, program] of Object.entries(full_system_data.programs))
        am_data.programs[id] = program;
      for (const [id, form] of Object.entries(full_system_data.forms))
        am_data.forms[id] = form;
      for (const [id, script] of Object.entries(full_system_data.scripts))
        am_data.scripts[id] = script;
    }

    return am_data;
  }

  get_full_system_data(id) {
    const { data } = this.module_world;
    const am_data = { systems: {}, programs: {}, forms: {}, scripts: {} };
    const system = data.am_systems_map[id]._data;

    if (system == null) return am_data;

    am_data.systems[id] = system;

    for (const program_id of system.programs) {
      const program = data.am_programs_map[program_id]._data;
      am_data.programs[program_id] = program;

      for (const form_id of program.forms) {
        const form = data.am_forms_map[form_id]._data;
        am_data.forms[form_id] = form;

        for (const script_id of form.scripts) {
          const script = data.am_scripts_map[script_id]._data;
          am_data.scripts[script_id] = ScriptingSystem.AML.parse(script.source);
        }
      }
    }

    return am_data;
  }
}

module.exports = AM_Data;
