module.exports = [
  {
    name: "Live",
    id: "Live_ID",
    rules: [
      {
        triggers: {
          script_processed: { value: "plan" }
        },
        actions: {
          run_script: "plan"
        }
      }
    ],
    signals: [],
    events: [],
    scripts: [
      {
        type: "if",
        name: "plan",
        id: "plan_0",
        data: {
          rest_form_name: "Rest",
          portal_doors_id: "5e419cbb6204d91bf8bfb29e",
          virtual_world_form_name: "VirtualWorld"
        },
        conditions: {
          "root.data.character.land_id !== root.data.character.default_land_id": [
            {
              type: "api",
              id: "plan_1",
              args: ["land_id:root.data.character.default_land_id"],
              name: "character.change_land"
            }
          ],
          "root.data.character.stress > 50": [
            {
              type: "api",
              id: "plan_2",
              name: "character.leave_virtual_world"
            },
            {
              type: "api",
              id: "plan_3",
              args: ["name:script.data.rest_form_name"],
              name: "system.form_run"
            }
          ],
          "root.data.character.energy < 100": [
            {
              type: "api",
              id: "plan_4",
              args: ["id:script.data.portal_doors_id"],
              name: "character.use_object"
            },
            {
              type: "api",
              id: "plan_5",
              args: ["name:script.data.virtual_world_form_name"],
              name: "system.form_run"
            }
          ]
        }
      }
    ]
  },
  {
    name: "Stres",
    id: "Stres_ID",
    rules: [
      {
        triggers: {
          script_processed: { value: "help_center" }
        },
        actions: {
          run_script: "help_center"
        }
      }
    ],
    signals: [
      {
        triggers: {
          energy: { min: "80", max: "100" }
        },
        actions: {
          form_terminate: "Stres"
        }
      }
    ],
    events: [],
    scripts: [
      {
        type: "script",
        name: "help_center",
        id: "help_center_id",
        data: { recover_land_id: 7 },
        root_scope: {
          type: "while",
          id: "help_center_0",
          condition:
            "root.data.world.character.land_id !== script.data.recover_land_id",
          instructions: [
            {
              type: "api",
              id: "help_center_1",
              args: ["land_id:script.data.recover_land_id"],
              name: "character.change_land"
            },
            {
              type: "internal",
              id: "help_center_3",
              command: "sleep 1000"
            }
          ]
        }
      }
    ]
  },
  {
    name: "VirtualWorld",
    id: "VirtualWorld_ID",
    rules: [],
    signals: [
      {
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
    events: [],
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
            }
          ]
        }
      }
    ]
  },
  {
    name: "Rest",
    id: "Rest_ID",
    rules: [],
    signals: [
      {
        triggers: {
          stres: { min: "0", max: "20" }
        },
        actions: {
          script_terminate: "script"
        }
      }
    ],
    events: [],
    scripts: [
      {
        type: "script",
        name: "rest",
        id: "rest_id",
        data: {},
        root_scope: {
          type: "while",
          id: "rest_0",
          condition: "root.data.world.character.virtual_world_id === ''",
          instructions: [
            {
              type: "api",
              id: "rest_1",
              name: "character.leave_virtual_world"
            },
            {
              type: "internal",
              id: "rest_2",
              command: "sleep 1000"
            }
          ]
        }
      }
    ]
  }
];
