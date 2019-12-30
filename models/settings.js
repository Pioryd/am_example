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
        generated: { type: Boolean, default: false, require: true },
        admin_login: { type: String, default: "admin", require: true },
        admin_password: { type: String, default: "123", require: true }
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
        callback({
          step: this.model.collection.name + ".save",
          error: error,
          results: raw
        });
      }
    );
  }

  remove(callback) {
    this.model.delete(null, error => {
      callback({
        step: this.model.collection.name + ".remove",
        error: error
      });
    });
  }

  load(callback) {
    this.model.find(null, (error, result) => {
      callback({
        step: this.model.collection.name + ".load",
        error: error,
        results: result
      });
    });
  }
}

module.exports = new SettingsModel();
