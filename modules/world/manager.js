const { ParsePacket } = require("./parse_packet");
const { Land, generate_random_land } = require("./land");
const { Character } = require("./character");

const AdminAccount = { id: -1, login: "admin", password: "123" };
class Manager {
  constructor({ application }) {
    this.lands_list = generate_random_land(5);
    this.characters_map = {};
    this.server = application.web_server;

    // insert ams
    for (let i = 0; i <= 5; i++) {
      const bot = new Character(i);
      bot.name = `AM_${i}`;
      this.characters_map[i] = bot;
    }
  }

  authenticate(socket_id, login, password) {
    if (socket_id == null || login == null || password == null) return;

    // Admin
    // Many accounts(sockets) can be logged as admin,
    // for example for multi-screen
    if (
      AdminAccount.login.toLowerCase() === login.toLowerCase() &&
      AdminAccount.password === password.toLowerCase()
    )
      return;

    // Characters
    // Only one account per character
    for (const [id, character] of Object.entries(this.characters_map)) {
      if (
        character.name.toLowerCase() === login.toLowerCase() &&
        character.password.toLowerCase() === password.toLowerCase()
      ) {
        if (character.socket_id != null)
          return "Another socket is logged in: " + character.socket_id;

        character.socket_id = socket_id;
        return;
      }
    }
    return "Wrong authentication data";
  }

  get_character_id_by_name(name) {
    if (name == null) return;

    // Admin
    if (AdminAccount.login.toLowerCase() === name.toLowerCase())
      return AdminAccount.id;

    // Characters
    for (const [id, character] of Object.entries(this.characters_map))
      if (character.name.toLowerCase() === name.toLowerCase()) return id;
  }

  get_character_name_by_id(id) {
    if (id == null) return;

    // Admin
    if (AdminAccount.id == id) return AdminAccount.login;

    // Characters
    if (id in this.characters_map) return this.characters_map[id].name;
  }

  get_character_data_by_id(id) {
    if (id == null) return;

    // Admin
    if (AdminAccount.id == id)
      return {
        lands_list: this.lands_list,
        characters_map: this.characters_map
      };

    // Characters
    if (id in this.characters_map) return this.characters_map[id];
  }

  log_off_character(id) {
    if (id == null) return;

    if (id in this.characters_map)
      return (this.characters_map[id].socket_id = undefined);
  }

  create_parse_packet_dict() {
    let parse_packet_dict = {};
    for (const [packet_id] of Object.entries(ParsePacket)) {
      parse_packet_dict[packet_id] = (connection, data) => {
        return ParsePacket[packet_id](connection, data, this);
      };
    }
    return parse_packet_dict;
  }
}

module.exports = { Manager };
