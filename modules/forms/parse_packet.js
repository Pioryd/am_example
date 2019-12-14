const ParsePacket = {
  update: (packet, manager) => {
    let data = {};
    data.command = "update";
    data.points = [];
    data.map_size = this.map_size;

    for (const [key, value] of Object.entries(manager.forms))
      data.points.push(JSON.parse(JSON.stringify(value, null, 2)));

    return data;
  },
  edit_form: (packet, manager) => {
    let data = {};
    data.command = "edit_form";
    data.log =
      `Error: Unable to add form: "${packet.form.name}". ` +
      `Do not contains correct values.`;

    packet.form.x = parseInt(packet.form.x);
    packet.form.y = parseInt(packet.form.y);
    packet.form.radius = parseInt(packet.form.radius);

    if (packet.form.name in manager.forms) {
      manager.forms[packet.form.name] = packet.form;
      data.log = `Updated form: "${packet.form.name}".`;
      return data;
    }

    if (
      packet.form.name !== "" &&
      packet.form.x !== "" &&
      packet.form.y !== "" &&
      packet.form.radius !== ""
    ) {
      data.log = `Added new form: "${packet.form.name}".`;
      manager.forms[packet.form.name] = packet.form;
    }

    return data;
  },
  edit_form: (packet, manager) => {
    let data = {};
    data.command = "remove_form";
    data.log =
      `Error: Unable to remove form: "${packet.form.name}". ` +
      `Form NOT found.`;
    if (packet.form.name in manager.forms) {
      delete manager.forms[packet.form.name];

      data.log = `Removed form: "${packet.form.name}".`;
    }

    return data;
  }
};

module.exports = { ParsePacket };
