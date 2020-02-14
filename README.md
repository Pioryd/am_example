# Artificial Mind - Module World

## Install

```powershell
npm install
```

## Project structure

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

## Object and managers

- Objects should be used only by managers.
- Manager should be use by any other logic and others managers.

## More informations at [Artificial Mind](https://www.artificialmind.dev/)
