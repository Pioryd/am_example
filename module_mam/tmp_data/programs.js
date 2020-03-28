module.exports = {
  Mechanical_ID: {
    id: "Mechanical_ID",
    name: "Mechanical",
    rules: [
      {
        type: "system",
        triggers: [{ forms_count: { value: 0 } }],
        actions: [
          {
            form_run: { value: "Live_ID" }
          }
        ]
      },
      {
        type: "signal",
        triggers: [{ energy: { priority: 3, min: 0, max: 20 } }],
        actions: [{ form_run: { value: "Live_ID" } }]
      },
      {
        type: "signal",
        triggers: [
          {
            inside_virtual_world: { priority: 1, value: true }
          }
        ],
        actions: [
          {
            form_run: { value: "VirtualWorld_ID" }
          }
        ]
      },
      {
        type: "signal",
        triggers: [
          {
            stress: { priority: 2, min: "80", max: "100" }
          }
        ],
        actions: [
          {
            form_run: { value: "Stress_ID" }
          }
        ]
      }
    ],
    forms: ["Live_ID", "Stress_ID", "VirtualWorld_ID"]
  }
};
