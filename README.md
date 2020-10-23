# Artificial Mind - Example project

## First run

- Crate login data
  - Run [Web Client](https://github.com/Pioryd/am_web_client)
  - Go to **[backup/restore]** and copy json data from [example_web_login.json](doc/example_web_login.json)
- Add aml data
  - Run [Editor](editor/README.md)
  - Login in [Web Client](https://github.com/Pioryd/am_web_client) into **Editor - Admin**
  - From **Windows manager** select **Editor Data**
    - Create new data with **ID** as file names without extension:
      - [ID_foo_program.yaml](doc/ID_foo_program.yaml) into **am_program**
      - [ID_foo_module.yaml](doc/ID_foo_module.yaml) into **am_module**
      - [ID_foo_script.aml](doc/ID_foo_script.aml) into **am_script**
      - [ID_foo_object.yaml](doc/ID_foo_object.yaml) into **object**
      - [world@send_message.json](doc/world@send_message.json) into **admin_scripts**
  - Run [World](world/README.md)
  - Run [AML](world/README.md)
  - Run [Web Client](https://github.com/Pioryd/am_web_client)
    - Open **Windows manager -> Module data**
      - uncollaps data to see results

## Include Apps

- [Editor](editor/README.md)
- [AML](aml/README.md)
- [World](world/README.md)

## Based on

- [AM Framework](https://github.com/Pioryd/am_framework)

## Additional use

- [Web Client](https://github.com/Pioryd/am_web_client)

## More informations at [Artificial Mind](https://pioryd.github.io/)
