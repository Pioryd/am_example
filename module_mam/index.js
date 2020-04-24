const path = require("path");
const { ModuleBase, Managers } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const Manager = require("./managers");

class ModuleMAM extends ModuleBase {
  constructor({ event_emitter, config }) {
    super({
      event_emitter,
      config,
      data: {
        characters_info: {},
        // Remember to update db models if rebuild settings structure
        settings: {
          generated: false,
          backup: false,
          corrupted: false
        }
      }
    });

    this.setup_managers({
      managers: {
        database_scripts: new Managers.DatabaseScripts({
          root_module: this,
          config: this.config.database_scripts
        }),
        am: new Manager.AM(this),
        admin_server: new Managers.AdminServer({
          root_module: this,
          config: this.config.admin_server
        }),
        world_client: new Manager.WorldClient({
          root_module: this,
          config: this.config.world_client
        })
      },
      order: {
        initialize: ["database_scripts", "am", "admin_server", "world_client"],
        terminate: ["admin_server", "am", "world_client", "database_scripts"],
        poll: ["database_scripts", "admin_server", "world_client", "am"]
      }
    });
  }
}

module.exports = { ModuleMAM };
