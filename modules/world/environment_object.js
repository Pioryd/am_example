const { Util } = require("am_framework");

class EnvironmentObject {
  constructor(id, name, size) {
    this.id = id;
    this.name = name;
    this.size = size;
  }
}

module.exports = { EnvironmentObject };
