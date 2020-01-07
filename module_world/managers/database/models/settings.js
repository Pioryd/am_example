const path = require("path");
const Schema = require(path.join(global.node_modules_path, "mongoose")).Schema;
const logger = require(path.join(
  global.node_modules_path,
  "am_framework"
)).create_logger({ module_name: "module_world", file_name: __filename });

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
        backup: { type: Boolean, default: false, require: true },
        corrupted: { type: Boolean, default: false, require: true },
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
    if (class_instance == null) {
      callback({
        step: this.model.collection.name + ".save",
        error: "class_instance is null"
      });
      return;
    }

    this.model.updateOne(
      null,
      class_instance,
      { upsert: true },
      (error, raw) => {
        try {
          callback({
            step: this.model.collection.name + ".save",
            error: error,
            results: raw
          });
        } catch (e) {
          logger.error(e);
        }
      }
    );
  }

  remove(callback) {
    this.model.delete(null, error => {
      try {
        callback({
          step: this.model.collection.name + ".remove",
          error: error
        });
      } catch (e) {
        logger.error(e);
      }
    });
  }

  load(callback) {
    this.model.find(null, (error, result) => {
      try {
        callback({
          step: this.model.collection.name + ".load",
          error: error,
          results: result
        });
      } catch (e) {
        logger.error(e);
      }
    });
  }
}

module.exports = SettingsModel;
