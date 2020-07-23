const fs = require("fs");
const path = require("path");
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
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this._ai_modules_classes = {};
    this.objects_ai = {};
  }

  initialize() {
    this._load_ai_classes();
  }

  terminate() {}

  poll() {
    this._update();
  }

  add_object(id) {
    this.objects_ai[id] = {};
  }

  remove_object(id) {
    delete this.objects_ai[id];
  }

  process_api({ api, aml, object_id, timeout, args }, callback) {
    try {
      const ai_module = this.objects_ai[object_id][aml.system][aml.program][
        aml.module
      ];
      ai_module.api[api]({ aml, object_id, timeout, args }, callback);
    } catch (e) {
      logger.error(
        "Unable to process api. " +
          JSON.stringify(
            {
              aml,
              object_id,
              timeout,
              args
            },
            null,
            2
          )
      );
    }
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

  _update() {
    if (
      !("world" in this.root_module.data) ||
      !("objects" in this.root_module.data.world)
    )
      return;

    for (const object_id of Object.keys(this.objects_ai)) {
      this._update_system(object_id);
      this._update_programs(object_id);
      this._update_modules(object_id);
    }
  }

  _update_system(object_id) {
    const { aml } = this.root_module.data.world.objects[object_id].data;
    if (aml == null) return;

    const system_id = Object.keys(aml)[0];
    if (system_id == null) {
      this.objects_ai[object_id] = {};
    } else if (!(system_id in this.objects_ai[object_id])) {
      this.objects_ai[object_id] = {};
      this.objects_ai[object_id][system_id] = {};
    }
  }

  _update_programs(object_id) {
    const { aml } = this.root_module.data.world.objects[object_id].data;
    if (aml == null) return;

    const system_id = Object.keys(aml)[0];
    if (system_id == null) return;

    const object_programs_id_list = Object.keys(aml[system_id]);

    const remove_not_actual_programs = () => {
      const ai_programs_ids_list = Object.keys(
        this.objects_ai[object_id][system_id]
      );
      for (const program_id of ai_programs_ids_list) {
        if (!object_programs_id_list.includes(program_id))
          delete this.objects_ai[object_id][system_id][program_id];
      }
    };
    const add_missing_programs = () => {
      let programs_ids_list = Object.keys(
        this.objects_ai[object_id][system_id]
      );
      for (const program_id of object_programs_id_list) {
        if (!programs_ids_list.includes(program_id))
          this.objects_ai[object_id][system_id][program_id] = {};
      }
    };

    remove_not_actual_programs();
    add_missing_programs();
  }

  _update_modules(object_id) {
    const { aml } = this.root_module.data.world.objects[object_id].data;
    if (aml == null) return;

    const system_id = Object.keys(aml)[0];
    if (system_id == null) return;

    const remove_not_actual_modules = (program_id) => {
      const ai_modules_ids_list = Object.keys(
        this.objects_ai[object_id][system_id][program_id]
      );
      for (const module_id of ai_modules_ids_list) {
        if (!(module_id in aml[system_id][program_id]))
          delete this.objects_ai[object_id][system_id][program_id][module_id];
      }
    };
    const add_missing_modules = (program_id) => {
      const ai_modules_ids_list = Object.keys(
        this.objects_ai[object_id][system_id][program_id]
      );

      for (const module_id of Object.keys(aml[system_id][program_id])) {
        if (!(module_id in this.objects_ai[object_id][system_id][program_id])) {
          this._get_data_async("module", module_id, (object) => {
            const ai_module = new this._ai_modules_classes[object.ai]();
            this.objects_ai[object_id][system_id][program_id][
              module_id
            ] = ai_module;
            ai_module.initialize();
          });
        }
      }
    };

    const programs_ids_list = Object.keys(
      this.objects_ai[object_id][system_id]
    );
    for (const program_id of programs_ids_list) {
      remove_not_actual_modules(program_id);
      add_missing_modules(program_id);
    }
  }

  _get_data_async(type, id, callback) {
    this.root_module.managers.editor.get_data(
      `am_${type}`,
      (object, message) => {
        try {
          if (object == null)
            throw new Error(
              `Not found object type[${type}] id[${id}].` +
                ` Error message: ${message}`
            );

          callback(object);
        } catch (e) {
          logger.error(`Unable to get data [am_${type}]. \n${e}\n${e.stack}`);
        }
      },
      id
    );
  }
}

module.exports = AI;
