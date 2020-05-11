module.exports = {
  test_1({ root_module, object_id, timeout, args }) {
    console.log({
      object_id,
      timeout,
      args
    });
  },
  b: {
    test_2({ root_module, object_id, timeout, args }) {
      console.log({
        object_id,
        timeout,
        args
      });
    }
  }
};
