const fw_fs = require("fs");

function read_from_json(file_name) {
  const json = fw_fs.readFileSync(file_name, "utf8", err => {
    if (err) throw err;
  });

  return JSON.parse(json);
}

function write_to_json(file_name, data) {
  const json = JSON.stringify(data, null, 2);

  fw_fs.writeFileSync(file_name, json, "utf8", err => {
    if (err) throw err;
  });
}

function is_path_exist(path) {
  return fw_fs.existsSync(path);
}

function get_directories(path) {
  if (!is_path_exist(path)) {
    console.log("Unable to get directories. Path does NOT nor exist: " + path);
    return [];
  }
  return fw_fs
    .readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

module.exports = {
  read_from_json,
  write_to_json,
  is_path_exist,
  get_directories
};
