const path = require("path");
const Schema = require(path.join(global.node_modules_path, "mongoose")).Schema;

class EnvironmentObjectModel {
  constructor() {
    this.connection = {};
    this.schema = {};
    this.model = {};
  }

  setup(connection) {
    this.connection = connection;

    this.schema = new Schema({
      id: { type: String, required: true, unique: true, index: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      world_id: { type: String },
      characters_list: { type: [String] }
    });
    this.model = this.connection.model(
      "EnvironmentObject",
      this.schema,
      "environment_object"
    );
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
            console.error(e);
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
        console.error(e);
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
        console.error(e);
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
        console.error(e);
      }
    });
  }
}

module.exports = EnvironmentObjectModel;
