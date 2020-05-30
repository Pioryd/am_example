module.exports = {
  clean({ root_module, object_id, timeout, args }) {
    console.log(`${object_id} -> clean`);
  },
  eat({ root_module, object_id, timeout, args }) {
    const object = root_module.data.world.objects[object_id];
    object.data.hungry = Math.max(object.data.hungry - 30, 0);
    console.log(`${object_id} -> eat -> hungry: ${object.data.hungry}`);
  }
};
