module.exports = [
  {
    name: "Live",
    id: "Live_ID",
    rules: [
      {
        type: "system",
        triggers: {
          form_init: { value: "Live" },
          script_processed: { value: "plan" }
        },
        actions: {
          script_run: "plan"
        }
      }
    ],
    scripts: [
      {
        type: "script",
        name: "plan",
        id: "plan_ID",
        data: {
          rest_form_name: "Rest",
          portal_doors_id: "5e419cbb6204d91bf8bfb29e"
        },
        root_scope: {
          type: "if",
          id: "plan_0",
          conditions: {
            "root.data.character_data.land_id !== root.data.character_data.default_land_id": [
              {
                type: "api",
                id: "plan_1",
                args: ["land_id:root.data.character_data.default_land_id"],
                name: "character.change_land"
              }
            ],
            "root.data.character_data.energy < 100": [
              {
                type: "api",
                id: "plan_4",
                args: ["id:script.data.portal_doors_id"],
                name: "character.use_object"
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: "Stress",
    id: "Stress_ID",
    rules: [
      {
        type: "system",
        triggers: {
          form_init: { value: "Stress" },
          script_processed: { value: "first_aid" }
        },
        actions: {
          script_run: "first_aid"
        }
      }
    ],
    scripts: [
      {
        type: "script",
        name: "first_aid",
        id: "first_aid_id",
        data: {},
        root_scope: {
          type: "if",
          id: "first_aid_0",
          conditions: {
            "root.data.character_data.virtual_world_id !== ''": [
              {
                type: "api",
                id: "first_aid_1",
                name: "character.leave_virtual_world"
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: "VirtualWorld",
    id: "VirtualWorld_ID",
    rules: [
      {
        type: "signal",
        triggers: {
          choice: { any: {} }
        },
        actions: {
          script_run: "make_choice",
          script_set_data: {
            script: "make_choice",
            data: "enemy_choice"
          }
        }
      }
    ],
    scripts: [
      {
        type: "script",
        name: "make_choice",
        id: "make_choice_ID",
        data: { enemy_choice: "" },
        root_scope: {
          type: "scope",
          id: "make_choice_0",
          instructions: [
            {
              type: "api",
              id: "make_choice_1",
              args: ["enemy_choice:script.data.enemy_choice"],
              name: "virtual_world.make_choice"
            },
            {
              type: "internal",
              id: "make_choice_2",
              command: "sleep 500"
            }
          ]
        }
      }
    ]
  }
];
