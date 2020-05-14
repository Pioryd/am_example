module.exports = {
  clean({ root_module, object_id, timeout, args }) {
    console.log("clean", {
      object_id,
      timeout,
      args
    });
  }
};
