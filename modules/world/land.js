class Land {
  constructor(id) {
    this.id = id;
    this.size = 20;
    this.objects_list = {};
    this.characters_list = [];
  }
}

module.exports = { Land };
