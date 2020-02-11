module.exports = {
  id: "Animal_ID",
  name: "Animal",
  programs: [
    {
      id: "Mechanical_ID",
      name: "Mechanical",
      rules: [
        {
          triggers: {
            forms_count: { value: 0 }
          },
          actions: {
            form_run: "Live"
          }
        }
      ],
      signals: [
        {
          triggers: {
            energy: { min: 0, max: 40 }
          },
          actions: {
            form_run: "Live"
          }
        },
        {
          triggers: {
            inside_virtual_world: { value: true }
          },
          actions: {
            form_run: "VirtualWorld"
          }
        },
        {
          triggers: {
            stress: { min: "80", max: "100" }
          },
          actions: {
            form_terminate: "Stress"
          }
        }
      ],
      events: [],
      forms: ["Live", "Stress", "VirtualWorld"]
    }
  ]
};
