const Models = require("./models");

const db_objects_map = {
  settings: {
    model: new Models.Settings(),
    model_load_fn: "load",
    model_save_fn: "save",
    collection_uid: null,
    data: "settings",
    object_class: null,
    manager: null
  },
  character: {
    model: new Models.Default("Character", "character", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      password: { type: String },
      outfit: { type: String, required: true },
      default_land_id: { type: String, required: true },
      virtual_world_id: { type: String, required: true },
      state: { type: String },
      action: { type: String },
      activity: { type: String },
      energy: { type: Number, required: true },
      stress: { type: Number, required: true },
      friends_list: { type: [String] }
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "characters_map",
    object_class: "Objects.Character",
    manager: null
  },
  land: {
    model: new Models.Default("Land", "land", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      map: [
        {
          objects_list: { type: [String] },
          characters_list: { type: [String] }
        }
      ]
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "lands_map",
    object_class: "Objects.Land",
    manager: "module_world"
  },
  environment_object: {
    model: new Models.Default("EnvironmentObject", "environment_object", {
      id: { type: String, required: true, unique: true, index: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      action_scripts_list: [
        {
          id: { type: String },
          script: { type: String }
        }
      ]
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "environment_objects_map",
    object_class: "Objects.EnvironmentObject",
    manager: null
  },
  virtual_world: {
    model: new Models.Default("VirtualWorld", "virtual_world", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      url: { type: String, required: true },
      characters_list: { type: [String] }
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "virtual_worlds_map",
    object_class: "Objects.VirtualWorld",
    manager: "virtual_worlds"
  },
  am_form: {
    model: new Models.Default("AM_Form", "am_form", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      rules: { type: [Object] },
      scripts: { type: [String] }
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "am_forms_map",
    object_class: "AM.Form",
    manager: "am"
  },
  am_program: {
    model: new Models.Default("AM_Program", "am_program", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      data: { type: Object },
      root_scope: { type: Object }
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "am_programs_map",
    object_class: "AM.Program",
    manager: "am"
  },
  am_script: {
    model: new Models.Default("AM_Script", "am_script", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      data: { type: Object },
      root_scope: { type: Object }
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "am_scripts_map",
    object_class: "AM.Script",
    manager: "am"
  },
  am_system: {
    model: new Models.Default("AM_System", "am_system", {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      programs: { type: [String] }
    }),
    model_load_fn: "load_all",
    model_save_fn: "save",
    collection_uid: "id",
    data: "am_systems_map",
    object_class: "AM.System",
    manager: "am"
  }
};

module.exports = {
  db_objects_map
};
