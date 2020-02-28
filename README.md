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

## More informations at [Artificial Mind](https://www.artificialmind.dev/)
