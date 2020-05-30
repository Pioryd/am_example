# Artificial Mind - App World

## Install and run

- install MongoDB
- configure config.json
- ```powershell
  npm install
  npm start
  ```

## Used managers of [AM Framework](https://github.com/Pioryd/am_framework)

- admin_server
- backup
- admin_scripts
- editor
  
## Additional managers

<table>
<tr>
  <th>Name</th>
  <th>Config(default)</th>
  <th>Description</th>
</tr>

<tr>
<td>api_loader</td>
<td>
<pre lang="json">
"api_folder": "api"
</pre>
</td>
<td>
  - load API on initialize.<br>
  - process API.
</td>
</tr>

<tr>
<td>mam_register</td>
<td>
<pre lang="json">
"debug": false
</pre>
</td>
<td>
  - register/unregister mam
</td>
</tr>

<tr>
<td>world_creator</td>
<td>
<pre lang="json">
"force_create": false
</pre>
</td>
<td>
- load or create world at initialize.
</td>
</tr>

<tr>
<td>world_program</td>
<td>
<pre lang="json">
{}
</pre>
</td>
<td>
- manage all world mechanics.
</td>
</tr>

<tr>
<td>world server</td>
<td>
extends am_framework.Managers.server
</td>
<td>
- handle protocol.
</td>
</tr>

</table>

## Configure world

To configure world login to [Editor](../editor/README.md) from [Web Client]([../editor/README.md](https://github.com/Pioryd/am_web_client))

## More informations at [Artificial Mind](https://pioryd.github.io/)
