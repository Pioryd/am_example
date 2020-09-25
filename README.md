# Artificial Mind - Example project

## Include Apps

- [Editor](editor/README.md)
- [MAM](mam/README.md)
- [World](world/README.md)

## Based on

- [AM Framework](https://github.com/Pioryd/am_framework)

## Additional use

- [Web Client](https://github.com/Pioryd/am_web_client)

### Web client login data (backup)

```json
{
  "f6bf2500-fd02-47bc-bf57-a1fc89b9ad0c": {
    "settings": {
      "name": "Virtual world",
      "module": "virtual_world",
      "description": ""
    },
    "root": {
      "connection": {
        "host": "localhost",
        "port": "3103",
        "accept_data": {
          "login": "World",
          "password": "123",
          "admin": true
        }
      }
    }
  },
  "a0b6674e-8b9d-4425-b6ed-561dbfc67707": {
    "settings": {
      "name": "World - Admin",
      "module": "admin",
      "description": ""
    },
    "root": {
      "connection": {
        "host": "localhost",
        "port": "3101",
        "accept_data": {
          "login": "World",
          "password": "123",
          "admin": true
        }
      }
    }
  },
  "2a1c1d03-e4e0-4bf7-8660-cf863aa51b82": {
    "settings": {
      "name": "Editor - Admin",
      "module": "admin",
      "description": ""
    },
    "root": {
      "connection": {
        "host": "localhost",
        "port": "3104",
        "accept_data": {
          "login": "editor",
          "password": "123"
        }
      }
    }
  },
  "30ecb15f-1fc5-41ae-8f43-fb6aca4fb729": {
    "settings": {
      "name": "MAM - Admin",
      "module": "admin",
      "description": ""
    },
    "root": {
      "connection": {
        "host": "localhost",
        "port": "3106",
        "accept_data": {
          "login": "MAM",
          "password": "123"
        }
      }
    }
  }
}
```

## More informations at [Artificial Mind](https://pioryd.github.io/)
