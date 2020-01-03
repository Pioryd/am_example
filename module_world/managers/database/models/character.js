const path = require("path");
const Schema = require(path.join(global.node_modules_path, "mongoose")).Schema;

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

      if (class_instance == null) {
        callback({
          step: this.model.collection.name + ".save",
          error: "class_instance is null"
        });
        return;
      }

      const data = class_instance._data;
      this.model.updateOne(
        { name: data.name },
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

  remove(name, callback) {
    this.model.deleteOne({ name: name }, error => {
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

  load(name, callback) {
    this.model.findOne({ name: name }, (error, result) => {
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

module.exports = CharacterModel;
