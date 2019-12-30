const Schema = require("mongoose").Schema;
const log = require("simple-node-logger").createSimpleLogger();

class CharacterModel {
  constructor() {
    this.connection = {};
    this.schema = {};
    this.model = {};
  }

  setup(connection) {
    this.connection = connection;

    this.schema = new Schema({
      name: { type: String, required: true, unique: true, index: true },
      password: { type: String },
      state: { type: String },
      action: { type: String },
      activity: { type: String },
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

      const data = class_instance._data;
      this.model.updateOne(
        { name: data.name },
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

  remove(name, callback) {
    this.model.deleteOne({ name: name }, error => {
      callback({ step: this.model.collection.name + ".remove", error: error });
    });
  }

  load(name, callback) {
    this.model.findOne({ name: name }, (error, result) => {
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

module.exports = new CharacterModel();
