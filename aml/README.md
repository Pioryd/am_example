# Artificial Mind - App AML

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
- core_editor

## Additional managers

<table>
<tr>
  <th>Name</th>
  <th>Config(default)</th>
  <th>Description</th>
</tr>

<tr>
<td>roots</td>
<td>
<pre lang="json">
process_delay: 0
process_debug: false
</pre>
</td>
<td>
  - process all AM roots
</td>
</tr>

<tr>
<td>world_client</td>
<td>
am_framework.Managers.client
</td>
<td>
- handle protocol.
</td>
</tr>

</table>

## More informations at [Artificial Mind](https://pioryd.github.io/)
