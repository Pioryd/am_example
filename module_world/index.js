const path = require("path");
const { ModuleBase, Managers } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const Manager = require("./managers");
const Objects = require("./objects");

class ModuleWorld extends ModuleBase {
  constructor({ event_emitter, config }) {
    super({
      event_emitter,
      config,
      data: {
        lands_map: {},
        characters_map: {},
        environment_objects_map: {},
        virtual_worlds_map: {},
        am_forms_map: {},
        am_programs_map: {},
        am_scripts_map: {},
        am_systems_map: {},
        // Remember to update models if rebuild settings structure
        settings: {
          generated: false,
          backup: false,
          corrupted: false
        }
      }
    });

    this.setup_managers({
      managers: {
        characters: new Manager.Characters(this),
        database: new Manager.Database(this),
        main_world: new Manager.MainWorld(this),
        world_server: new Manager.WorldServer(this),
        admin_server: new Managers.AdminServer(this, Objects.Default),
        virtual_worlds: new Manager.VirtualWorlds(this),
        mam: new Manager.MAM(this),
        am_data: new Manager.AM_Data(this)
      },
      order: {
        initialize: [
          "database",
          "world_server",
          "admin_server",
          "characters",
          "main_world",
          "virtual_worlds",
          "mam",
          "am_data"
        ],
        terminate: [
          "world_server",
          "admin_server",
          "main_world",
          "characters",
          "database",
          "virtual_worlds",
          "mam",
          "am_data"
        ],
        poll: [
          "database",
          "world_server",
          "admin_server",
          "characters",
          "main_world",
          "virtual_worlds",
          "mam",
          "am_data"
        ]
      }
    });
  }
}

module.exports = { ModuleWorld };
