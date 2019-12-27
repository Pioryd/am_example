const Schema = require("mongoose").Schema;

class SettingsModel {
  constructor() {
    this.connection = {};
    this.schema = {};
    this.model = {};
  }

  setup(connection) {
    this.connection = connection;

    this.schema = new Schema(
      {
        generated: { type: Boolean, default: false }
      },
      {
        capped: { size: 1024, max: 1 }
      }
    );
    this.model = this.connection.model("Settings", this.schema, "settings");
  }

  save(class_instance, callback) {
    this.model.updateOne(
      null,
      class_instance,
      { upsert: true },
      (error, raw) => {
        callback(this.model.collection.name + ".save", error, raw);
      }
    );
  }

  remove(callback) {
    this.model.delete(null, error => {
      callback(this.model.collection.name + ".remove", error);
    });
  }

  load(callback) {
    this.model.find(null, (error, result) => {
      callback(this.model.collection.name + ".load", error, result);
    });
  }
}

module.exports = new SettingsModel();
