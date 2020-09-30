const fs = require("fs");
const path = require("path");
const { create_logger, Util, Action } = require(path.join(
  global.node_modules_path,
  "am_framework"
));
const Ajv = require(path.join(global.node_modules_path, "ajv"));
const _ = require(path.join(global.node_modules_path, "lodash"));

const logger = create_logger({
  module_name: "module_world",
  file_name: __filename
});

const DEFAULT_CONFIG = {
  ai_modules_folder: "ai_modules"
};

/**
 *  objects_ai format example:
 *    {
 *      object_id_1: { system_id_1: {
 *        program_id_1: {
 *          module_id_1: some_ai_module_instance,
 *          ...
 *        },
 *        ...
 *      }}
 *    }
 *
 *  NOTE:
 *    'world' as "to_module..." is reserved for world api".
 */
class AI {
  constructor({ root_module, config }) {
    this.root_module = root_module;
    this.config = _.merge(DEFAULT_CONFIG, config);

    this.root_action = new Action();

    this._ai_modules_classes = {};
    this.objects_ai = {};

    this.source = { system: {}, programs: {}, modules: {} };
  }

  initialize() {
    this._load_ai_classes();
  }

  terminate() {}

  poll() {
    this._update_ai_modules();
    this._poll_ai_modules();
  }

  add_object(id) {
    this.objects_ai[id] = {};
  }

  remove_object(id) {
    delete this.objects_ai[id];
  }

  process_ai_api({ api, aml, object_id, data }) {
    try {
      this._validate(data);

      this.objects_ai[object_id][aml.system][aml.program][
        aml.module
      ].process_api(api, data);
    } catch (e) {
      logger.error(
        "Unable to process api. " +
          JSON.stringify(
            {
              api,
              aml,
              object_id,
              data
            },
            null,
            2
          ) +
          `${e}`
      );
    }
  }

  process_world_api(object_id, api, data) {
    try {
      this._validate(data);
    } catch (e) {
      logger.error(e, `Data[${JSON.stringify(data, null, 2)}]`, e.stack);
    }

    this.root_module.data.api[api](this.root_module, object_id, data);

    const { area } = this.root_module.data.world.objects[object_id];
    this.root_module.data.world.actions.push({
      time: new Date().toUTCString(),
      area,
      object_id,
      api,
      data
    });
  }

  process_world_fn(fn, data) {
    try {
      this._validate(data);
      this.root_module.data.world.fn[fn](this.root_module, data);
    } catch (e) {
      logger.error(e, `Data[${JSON.stringify(data, null, 2)}]`, e.stack);
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

  _update_ai_modules() {
    const update_system = (action) => {
      for (const object_id of Object.keys(this.objects_ai)) {
        const terminate_modules = () => {
          const object_ai = this.objects_ai[object_id];
          const system_id = Object.keys(object_ai)[0];
          if (system_id == null) return;

          for (const program_id of Object.keys(object_ai[system_id])) {
            for (const module of Object.values(
              object_ai[system_id][program_id]
            ))
              module.terminate();
          }
        };

        const { aml } = this.root_module.data.world.objects[object_id].data;
        if (aml == null) return;

        const system_id = Object.keys(aml)[0];
        if (system_id == null) {
          terminate_modules();
          this.objects_ai[object_id] = {};

          this.source.system = {};

          action.stop();
        } else if (this.objects_ai[object_id][system_id] == null) {
          terminate_modules();
          this.objects_ai[object_id] = {};
          this.objects_ai[object_id][system_id] = {};

          this.source.system = {};
          this.__get_data_async("system", system_id, (object) => {
            if (!action.is_active()) return;
            this.source.system = object;
            action.stop();
          });
        } else {
          action.stop();
        }
      }
    };
    const update_programs = (action) => {
      for (const object_id of Object.keys(this.objects_ai)) {
        const { aml } = this.root_module.data.world.objects[object_id].data;
        if (aml == null) return;

        const system_id = Object.keys(aml)[0];
        if (system_id == null) return;

        for (const system_id of Object.keys(this.objects_ai[object_id])) {
          const remove_not_actual_programs = () => {
            for (const program_id of Object.keys(
              this.objects_ai[object_id][system_id]
            )) {
              if (!(program_id in aml[system_id])) {
                for (const module of Object.values(
                  this.objects_ai[object_id][system_id][program_id]
                ))
                  module.terminate();

                delete this.objects_ai[object_id][system_id][program_id];

                delete this.source.programs[program_id];
              }
            }
          };
          const add_missing_programs = () => {
            const check_action = () => {
              for (const program_id of Object.keys(aml[system_id]))
                if (this.source.programs[program_id] == null) return;
              action.stop();
            };

            for (const program_id of Object.keys(aml[system_id])) {
              if (!(program_id in this.objects_ai[object_id][system_id])) {
                this.objects_ai[object_id][system_id][program_id] = {};

                this.__get_data_async("program", program_id, (object) => {
                  if (!action.is_active()) return;

                  this.source.programs[program_id] = object;
                  check_action();
                });
              }
            }
            check_action();
          };

          remove_not_actual_programs();
          add_missing_programs();
        }
      }
    };
    const update_modules = (action) => {
      for (const object_id of Object.keys(this.objects_ai)) {
        const { aml } = this.root_module.data.world.objects[object_id].data;
        if (aml == null) return;

        const system_id = Object.keys(aml)[0];
        if (system_id == null) return;

        const remove_not_actual_modules = (program_id) => {
          this.__for_each_module(({ module_id, module }) => {
            if (!(module_id in aml[system_id][program_id])) {
              module.terminate();
              delete this.objects_ai[object_id][system_id][program_id][
                module_id
              ];

              delete this.source.modules[module_id];
            }
          });
        };
        const add_missing_modules = (program_id) => {
          const check_action = () => {
            for (const module_id of Object.keys(aml[system_id][program_id])) {
              if (this.source.modules[module_id] == null) return;
            }
            action.stop();
          };

          for (const module_id of Object.keys(aml[system_id][program_id])) {
            if (
              !(module_id in this.objects_ai[object_id][system_id][program_id])
            ) {
              this.__get_data_async("module", module_id, (object) => {
                if (!action.is_active()) return;

                const ai_module = new this._ai_modules_classes[object.ai]({
                  mirror: this.root_module.data.world.objects[object_id],
                  process_world_fn: this.process_world_fn
                });
                this.objects_ai[object_id][system_id][program_id][
                  module_id
                ] = ai_module;
                ai_module.initialize();

                this.source.modules[module_id] = object;

                check_action();
              });
            }
          }
          check_action();
        };

        const programs_ids_list = Object.keys(
          this.objects_ai[object_id][system_id]
        );
        for (const program_id of programs_ids_list) {
          remove_not_actual_modules(program_id);
          add_missing_modules(program_id);
        }
      }
    };

    const main_action = this.root_action.create({
      uid: "update_all",
      timeout: 5000,
      data: {
        updated: {
          system: false,
          programs: false,
          modules: false
        }
      },
      rules: {
        start: (action) =>
          "world" in this.root_module.data &&
          "objects" in this.root_module.data.world,
        stop: (action) =>
          action.data.updated.system &&
          action.data.updated.programs &&
          action.data.updated.modules
      }
    });
    if (main_action == null) return;

    main_action.create({
      uid: "update_system",
      events: {
        start: (action) => update_system(action),
        stop: (action) => (main_action.data.updated.system = true)
      }
    });
    main_action.create({
      uid: "update_programs",
      rules: {
        start: (action) => main_action.data.updated.system
      },
      events: {
        start: (action) => update_programs(action),
        stop: (action) => (main_action.data.updated.programs = true)
      }
    });
    main_action.create({
      uid: "update_modules",
      rules: {
        start: (action) => main_action.data.updated.programs
      },
      events: {
        start: (action) => update_modules(action),
        stop: (action) => (main_action.data.updated.modules = true)
      }
    });
  }

  _poll_ai_modules() {
    this.__for_each_module(({ module_id, module }) => {
      try {
        module.poll();
      } catch (e) {
        logger.error(`Unable to poll module[${module_id}]. ${e}. ${e.stack}`);
      }
    });
  }

  _validate(data) {
    const validate_object = (object) => {
      const rule = this.root_module.data.validate;
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(rule);
      const valid = validate(object);
      if (!valid)
        throw new Error(
          `Object[${JSON.stringify(object, null, 2)}]\n` +
            `Data[${JSON.stringify(data, null, 2)}]\n` +
            `AJV[${ajv.errorsText(validate.errors)}]`
        );
    };
    const get_object_data = (object) => {
      const { data } = object;
      if (data != null) {
        validate_object(object);
        get_object_data(data);
      }
    };

    get_object_data(data);
  }

  __for_each_system(callback) {
    for (const [object_ai_id, object_ai_data] of Object.entries(
      this.objects_ai
    )) {
      for (const [system_id, system_data] of Object.entries(object_ai_data))
        callback({
          object_ai_id,
          object_ai_data,
          system_id,
          system_data
        });
    }
  }

  __for_each_program(callback) {
    this.__for_each_system((args) => {
      for (const [program_id, program_data] of Object.entries(args.system_data))
        callback({
          ...args,
          program_id,
          program_data
        });
    });
  }

  __for_each_module(callback) {
    this.__for_each_program((args) => {
      for (const [module_id, module] of Object.entries(args.program_data))
        callback({
          ...args,
          module_id,
          module
        });
    });
  }

  __get_data_async(type, id, callback) {
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
