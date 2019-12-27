const { Util } = require("am_framework");
const { EnvironmentObject } = require("./environment_object");

const EnvironmentObjectList = {
  house: { id: 1, size: 3 },
  tree: { id: 2, size: 3 }
};

class Land {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.size = 20;
    this.objects_list = [];
    this.characters_map = [];
  }
}

function generate_random_land(count) {
  const lands = [];
  // Create lands
  for (let i = 0; i < count; i++) {
    const land = new Land(i);
    // Insert environment object - house
    if (Util.get_random_int(0, 1) === 1) {
      const object_name = "house";
      land.objects_list.push(
        new EnvironmentObject(
          EnvironmentObjectList[object_name].id,
          object_name,
          EnvironmentObjectList[object_name].size
        )
      );
    }
    // Insert environment object - tree
    for (let k = 0; k < 3; k++) {
      if (Util.get_random_int(0, 1) === 1) {
        const object_name = "tree";
        land.objects_list.push(
          new EnvironmentObject(
            EnvironmentObjectList[object_name].id,
            object_name,
            EnvironmentObjectList[object_name].size
          )
        );
      }
    }
    lands.push(land);
  }
  return lands;
}

module.exports = { Land, generate_random_land };
