const { Util } = require("../../framework/util.js");

class EnvironmentObject {
  constructor(id, name, size) {
    this.id = id;
    this.name = name;
    this.size = size;
  }
}

module.exports = { EnvironmentObject };
