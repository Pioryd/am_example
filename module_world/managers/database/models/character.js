const path = require("path");
const Schema = require(path.join(global.node_modules_path, "mongoose")).Schema;
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

class CharacterModel {
  constructor() {
    this.connection = {};
    this.schema = {};
    this.model = {};
  }

  setup(connection) {
    this.connection = connection;

    this.schema = new Schema({
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
    });
    this.model = this.connection.model("Character", this.schema, "character");
  }

  save(classes_instances, callback, index = 0) {
    if (!Array.isArray(classes_instances))
      classes_instances = [classes_instances];

    if (index < classes_instances.length && classes_instances.length > 0) {
      const class_instance = classes_instances[index];
      index++;

      if (class_instance == null) {
        callback({
          step: this.model.collection.name + ".save",
          error: "class_instance is null"
        });
        return;
      }

      const data = class_instance._data;
      this.model.updateOne(
        { id: data.id },
        { ...data },
        { upsert: true },
        (error, raw) => {
          try {
            if (error) {
              callback({
                step: this.model.collection.name + ".save",
                error: error,
                results: raw
              });
            } else {
              this.save(classes_instances, callback, index);
            }
          } catch (e) {
            logger.error(e, e.stack);
          }
        }
      );
      return;
    }

    callback({ step: this.model.collection.name + ".save" });
  }

  remove(id, callback) {
    this.model.deleteOne({ id: id }, error => {
      try {
        callback({
          step: this.model.collection.name + ".remove",
          error: error
        });
      } catch (e) {
        logger.error(e, e.stack);
      }
    });
  }

  load(id, callback) {
    this.model.findOne({ id: id }, (error, result) => {
      try {
        callback({
          step: this.model.collection.name + ".load",
          error: error,
          results: result
        });
      } catch (e) {
        logger.error(e, e.stack);
      }
    });
  }

  load_all(callback) {
    this.model.find(null, (error, result) => {
      try {
        callback({
          step: this.model.collection.name + ".load_all",
          error: error,
          results: result
        });
      } catch (e) {
        logger.error(e, e.stack);
      }
    });
  }
}

module.exports = CharacterModel;
