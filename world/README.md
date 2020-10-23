# Artificial Mind - App World

## Install and run

- install MongoDB
- install [AM Framework](https://github.com/Pioryd/am_framework)
- configure config.json
- ```powershell
  npm link am_framework
  npm install
  npm start
  ```

## Used managers of [AM Framework](https://github.com/Pioryd/am_framework)

- core_admin_server
- core_backup
- core_admin_scripts
- core_ai
- core_editor

## Additional managers

<table>
<tr>
  <th>Name</th>
  <th>Config(default)</th>
  <th>Description</th>
</tr>

<tr>
<td>aml</td>
<td>
<pre lang="json">
"debug": false
</pre>
</td>
<td>
  - register/unregister
</td>
</tr>

<tr>
<td>world</td>
<td>
<pre lang="json">
"force_create": false
</pre>
</td>
<td>
- load or create world at initialize.<br>
</td>
</tr>

<tr>
<td>server</td>
<td>
extends am_framework.Managers.server
</td>
<td>
- handle protocol.
</td>
</tr>

</table>

## More informations at [Artificial Mind](https://pioryd.github.io/)
