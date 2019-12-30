const Schema = require("mongoose").Schema;
const log = require("simple-node-logger").createSimpleLogger();

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
      name: { type: String, required: true }
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

      const data = class_instance._data;
      this.model.updateOne(
        { id: data.id },
        { ...data },
        { upsert: true },
        (error, raw) => {
          if (error) {
            log.info("Error:", error);
            log.info("Raw:", raw);
          }

          this.save(classes_instances, callback, index);
        }
      );

      return;
    }

    callback({ step: this.model.collection.name + ".save" });
  }

  remove(id, callback) {
    this.model.deleteOne({ id: id }, error => {
      callback({ step: this.model.collection.name + ".remove", error: error });
    });
  }

  load(id, callback) {
    this.model.findOne({ id: id }, (error, result) => {
      callback({
        step: this.model.collection.name + ".load",
        error: error,
        results: result
      });
    });
  }

  load_all(callback) {
    this.model.find(null, (error, result) => {
      callback({
        step: this.model.collection.name + ".load_all",
        error: error,
        results: result
      });
    });
  }
}

module.exports = new EnvironmentObjectModel();
