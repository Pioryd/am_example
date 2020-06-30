const path = require("path");
const { AML } = require(path.join(global.node_modules_path, "am_framework"));

module.exports = {
  init: {
    interval: 0,
    fn: (root_module) => {
      root_module.data.events.world.init.data.aml_data = {};
      const aml_data = root_module.data.events.world.init.data;
      const data_names_list = ["system", "program", "module", "script"];

      for (const data_name of data_names_list) {
        root_module.managers.editor.get_data(
          `am_${data_name}`,
          (objects_list, message) => {
            aml_data[data_name] = {};
            for (const object of objects_list) {
              let source = object;
              if (data_name === "script")
                source = AML.script_to_json(object.id, object.source);
              aml_data[data_name][source.name] = source.id;
            }
          }
        );
      }

      const wait_for_data = () => {
        for (const data_name of data_names_list) {
          if (!data_name in aml_data) {
            setTimeout(wait_for_data, 100);
            return;
          }
        }

        const { objects } = root_module.data.world;
        for (const object of Object.values(objects)) {
          if (!object.properties.includes("am")) continue;
          if (object.data.queue == null) object.data.queue = [];
          object.data.queue.push({
            id: "1",
            key: "root",
            value: aml_data
          });
        }
      };

      wait_for_data();
    }
  },
  hungry: {
    interval: 250,
    fn: (root_module) => {
      const { objects } = root_module.data.world;
      for (const object of Object.values(objects)) {
        if (!object.properties.includes("am")) continue;
        if (object.data.hungry == null) object.data.hungry = 0;
        object.data.hungry = Math.min(object.data.hungry + 1, 100);
      }
    }
  }
};
