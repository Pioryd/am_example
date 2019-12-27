class Land {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.size = 20;
    this.objects_list = [];
    this.characters_map = [];
  }
}

module.exports = { Land };
