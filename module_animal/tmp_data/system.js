module.exports = {
  id: "Animal_ID",
  name: "Animal",
  programs: [
    {
      id: "Mechanical_ID",
      name: "Mechanical",
      rules: [
        {
          type: "system",
          triggers: [{ forms_count: { value: 0 } }],
          actions: [
            {
              form_run: "Live"
            }
          ]
        },
        {
          type: "signal",
          triggers: [{ energy: { priority: 3, min: 0, max: 20 } }],
          actions: [{ form_run: "Live" }]
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
              form_run: "VirtualWorld"
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
              form_run: "Stress"
            }
          ]
        }
      ],
      forms: ["Live", "Stress", "VirtualWorld"]
    }
  ]
};
