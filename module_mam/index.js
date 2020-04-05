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
        am: new Manager.AM(this),
        admin_server: new Managers.AdminServer({
          root_module: this,
          config: this.config.admin_server
        }),
        world_client: new Manager.WorldClient({
          root_module: this,
          config: this.config.world_client
        }),
        api_client: new Manager.ApiClient({
          root_module: this,
          config: this.config.api_client
        })
      },
      order: {
        initialize: ["am", "admin_server", "world_client", "api_client"],
        terminate: ["admin_server", "am", "world_client", "api_client"],
        poll: ["admin_server", "world_client", "api_client", "am"]
      }
    });
  }
}

module.exports = { ModuleMAM };
