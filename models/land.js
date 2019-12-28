const Schema = require("mongoose").Schema;
const log = require("simple-node-logger").createSimpleLogger();

class LandModel {
  constructor() {
    this.connection = {};
    this.schema = {};
    this.model = {};
  }

  setup(connection) {
    this.connection = connection;

    this.schema = new Schema(
      {
        id: { type: Number, required: true, unique: true, index: true },
        size: { type: Number, required: true },
        name: { type: String },
        map: [
          {
            objects_list: { type: [String] },
            characters_list: { type: [String] }
          }
        ]
      },
      { _id: false, id: false }
    );
    this.model = this.connection.model("Land", this.schema, "land");
  }

  save(classes_instances, callback) {
    if (!Array.isArray(classes_instances))
      classes_instances = [classes_instances];

    for (const class_instance of classes_instances) {
      const data = class_instance._data;
      this.model.updateOne(
        { id: data.id },
        data,
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

  remove(id, callback) {
    this.model.deleteOne({ id: id }, error => {
      callback(this.model.collection.name + ".remove", error);
    });
  }

  load(id, callback) {
    this.model.findOne({ id: id }, (error, result) => {
      callback(this.model.collection.name + ".load", error, result);
    });
  }

  load_all(callback) {
    this.model.find(null, (error, result) => {
      callback(this.model.collection.name + ".load_all", error, result);
    });
  }
}

module.exports = new LandModel();
