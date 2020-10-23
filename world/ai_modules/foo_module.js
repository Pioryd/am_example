const path = require("path");
const { create_logger } = require(path.join(
  global.node_modules_path,
  "am_framework"
));

const logger = create_logger({
  module_name: "AI_Module_test",
  file_name: __filename
});

const API = {
  foo(ai, { query_id, timeout, args }) {
    if (args.val - ai.mirror.val1 < 10) return;

    const new_val = args.val + 1;
    ai.root.process_world_api("foo", {
      object_id: ai.object_id,
      key: "val1",
      value: new_val
    });
  }
};

class Foo_AI {
  constructor(root, object_id) {
    this.root = root;
    this.object_id = object_id;

    this.api = API;

    this.data = {};
    this.mirror = {};
  }

  initialize() {}

  poll() {}

  terminate() {}
}

module.exports = Foo_AI;
