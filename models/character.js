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
      position: {
        land_id: { type: Number, required: true },
        object_id: { type: Number, required: true },
        x: { type: Number, required: true }
      },
      state: { type: String },
      action: { type: String },
      activity: { type: String },
      friends_list: { type: [String] }
    });
    this.model = this.connection.model("Character", this.schema, "character");
  }

  save(classes_instances, callback) {
    if (!Array.isArray(classes_instances))
      classes_instances = [classes_instances];

    for (const class_instance of classes_instances) {
      this.model.updateOne(
        { name: class_instance.name },
        { ...class_instance },
        { upsert: true },
        (error, raw) => {
          if (error) {
            log.info("Error:", error);
            log.info("Raw:", raw);
          }
        }
      );
    }

    callback(this.model.collection.name + ".save");
  }

  remove(name, callback) {
    this.model.deleteOne({ name: name }, error => {
      callback(this.model.collection.name + ".remove", error);
    });
  }

  load(name, callback) {
    this.model.findOne({ name: name }, (error, result) => {
      callback(this.model.collection.name + ".load", error, result);
    });
  }

  load_all(callback) {
    this.model.find(null, (error, result) => {
      callback(this.model.collection.name + ".load_all", error, result);
    });
  }
}

module.exports = new CharacterModel();
