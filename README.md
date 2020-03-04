# Artificial Mind - App World

![Node.js CI](https://github.com/Pioryd/am_app_world/workflows/Node.js%20CI/badge.svg?branch=master)

## Install and run

```powershell
npm install
npm start
```

## Module World

### Structure

Each module is **Synchronous**, but relation between modules are **Asynchronous**.  
As **synchronous module** you can understand like:

- async/await
- single event emitter
- setInterval
- setTimeout
  - even if called once

Contact between modules must be made by:

- queens
- client-server protocol

### Object and managers

- Objects should be used only by managers.
- Manager should be use by any other logic and others managers.

## Project extension

### Database objects

Add new object data into [managers/database/db_objects_map.js]

- use one of models or add new
  - default model:
    - schema must use UID as key[id]
- use one of object classes or add new
  - default class
    - manager should be null

### Objects

You can create one from the template:

- default.js

Or You can create Your own class:

- possible parameters:
  - First - data
  - Second(optional) - manager
- after create one, You must add it to [objects/index.js] [module.exports]

### Managers

Each manager class:

- must contains:
  - initialize()
  - terminate()
  - poll()
- must be placed in main module file
  - added to manager list [this.managers]
  - placed in:
    - on_initialize()
    - _terminate()
    - _poll()

## More informations at [Artificial Mind](https://www.artificialmind.dev/)
