module.exports = {
  id: "Animal_ID",
  name: "Animal",
  programs: [
    {
      id: "Mechanical_ID",
      name: "Mechanical",
      rules: [
        {
          type: "program",
          triggers: {
            forms_count: { value: 0 }
          },
          actions: {
            form_run: "Live"
          }
        },
        {
          type: "signal",
          triggers: {
            energy: { min: 0, max: 40 }
          },
          actions: {
            form_run: "Live"
          }
        },
        {
          type: "signal",
          triggers: {
            inside_virtual_world: { value: true }
          },
          actions: {
            form_run: "VirtualWorld"
          }
        },
        {
          type: "signal",
          triggers: {
            stress: { min: "80", max: "100" }
          },
          actions: {
            form_terminate: "Stress"
          }
        }
      ],
      forms: ["Live", "Stress", "VirtualWorld"]
    }
  ]
};
