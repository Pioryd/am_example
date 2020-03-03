const ObjectTemplate = require("./object_template");
const Settings = require("./settings");

module.exports = {
  settings: new Settings(),
  land: new ObjectTemplate("Land", "land", {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    map: [
      {
        objects_list: { type: [String] },
        characters_list: { type: [String] }
      }
    ]
  }),
  character: new ObjectTemplate("Character", "character", {
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
  environment_object: new ObjectTemplate(
    "EnvironmentObject",
    "environment_object",
    {
      id: { type: String, required: true, unique: true, index: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      action_scripts_list: [
        {
          id: { type: String },
          script: { type: String }
        }
      ]
    }
  ),
  virtual_world: new ObjectTemplate("VirtualWorld", "virtual_world", {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    characters_list: { type: [String] }
  }),
  am_form: new ObjectTemplate("AM_Form", "am_form", {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    rules: { type: [Object] },
    scripts: { type: [String] }
  }),
  am_program: new ObjectTemplate("AM_Program", "am_program", {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    data: { type: Object },
    root_scope: { type: Object }
  }),
  am_script: new ObjectTemplate("AM_Script", "am_script", {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    data: { type: Object },
    root_scope: { type: Object }
  }),
  am_system: new ObjectTemplate("AM_System", "am_system", {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    programs: { type: [String] }
  })
};
