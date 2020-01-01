# Artificial mind - Preview - Server

## How to run

> npm start

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

### Object and managers

Objects should be used only by managers.
Manager should be use by any other logic and others managers.
