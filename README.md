# Artificial mind - module_world

## Example app config

```JSON
"module_world": {
  "database": {
    "url": "mongodb://127.0.0.1:27017",
    "name": "am_module_world"
  },
  "server": {
    "port": 3000
  }
}
```

## Object and managers

Objects should be used only by managers.  
Manager should be use by any other logic and others managers.
