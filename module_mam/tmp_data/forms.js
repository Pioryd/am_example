module.exports = {
  Live_ID: {
    name: "Live",
    id: "Live_ID",
    rules: [
      {
        type: "system",
        triggers: [
          { form_init: { value: "Live_ID" } },
          { script_processed: { value: "plan_id" } }
        ],
        actions: [
          {
            script_run: { value: "plan_id" }
          }
        ]
      }
    ],
    scripts: ["plan_id"]
  },
  Stress_ID: {
    name: "Stress",
    id: "Stress_ID",
    rules: [
      {
        type: "system",
        triggers: [
          {
            form_init: { value: "Stress_ID" }
          },
          { script_processed: { value: "first_aid_id" } }
        ],
        actions: [
          {
            script_run: { value: "first_aid_id" }
          }
        ]
      }
    ],
    scripts: ["first_aid_id"]
  },
  VirtualWorld_ID: {
    name: "VirtualWorld",
    id: "VirtualWorld_ID",
    rules: [
      {
        type: "signal",
        triggers: [
          {
            choice: { any: {} }
          }
        ],
        actions: [
          { script_run: { value: "first_aid_id" } },
          {
            script_set_data: {
              script: "first_aid_id",
              data: "enemy_choice"
            }
          }
        ]
      }
    ],
    scripts: ["first_aid_id"]
  }
};
