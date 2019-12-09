const io = require("socket.io");

/**
 * @description Handling sockets and connections.
 */
class Server {
  constructor(port, on_parse_dict) {
    this.on_parse_dict = on_parse_dict;
    this.port = port;

    this.socket = {};
  }

  start() {
    this.socket = io(this.port);

    // Connect function to parse packets listed in: [this.on_parse_dict]
    for (const [packet_id, value] of Object.entries(this.on_parse_dict)) {
      this.socket.on("connection", socket => {
        socket.on(packet_id, data => {
          try {
            if (packet_id in this.on_parse_dict) {
              let response = this.on_parse_dict[packet_id](data);
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
