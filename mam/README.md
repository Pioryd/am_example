# Artificial Mind - App MAM

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
<td>am_data</td>
<td>
none
</td>
<td>
  - load AM data on initialize.
</td>
</tr>

<tr>
<td>aml_roots</td>
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
