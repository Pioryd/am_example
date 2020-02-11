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
            energy: { min: 0, max: 10 }
          },
          actions: {
            form_run: "Stress"
          }
        }
      ],
      events: [],
      forms: ["Live", "Stress", "VirtualWorld", "Rest"]
    }
  ]
};
