const io = require("socket.io");

/**
 * @description Handling sockets and connections.
 */
class Server {
  constructor(port) {
    this.port = port;
    this.parse_dict = {};
    this.socket = {};
  }

  add_parse_dict(parse_dict) {
    this.parse_dict = { ...this.parse_dict, ...parse_dict };
  }

  start() {
    this.socket = io(this.port);
    // Connect function to parse packets listed in: [this.parse_dict]
    for (const [packet_id, value] of Object.entries(this.parse_dict)) {
      this.socket.on("connection", socket => {
        socket.on(packet_id, data => {
          try {
            if (packet_id in this.parse_dict) {
              let response = this.parse_dict[packet_id](data);
              if (response !== undefined && response !== null)
                socket.emit(packet_id, response);
            }
          } catch (error) {
            console.log("Exception: " + error);
          }
        });
      });
    }
  }

  stop() {
    if (Object.entries(this.socket).length !== 0) {
      this.socket.close();
      this.socket = {};
    }
  }
}

module.exports = { Server };
