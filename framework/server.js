const io = require("socket.io");
const { Util } = require("./util");
class Connection {
  constructor(socket) {
    this.last_packet_time = new Date();
    this.socket = socket;
    this.accepted = false;
    this.user_data = {};
  }
}
/**
 * @description Handling sockets and connections.
 */
class Server {
  constructor({ port = 0, check_interval = 1000, timeout = 3 * 1000 }) {
    this.port = port;
    this.check_interval = check_interval;
    this.timeout = timeout;

    this.parse_packet_dict = {};
    this.socket = {};
    this.connections_map = {};

    setInterval(() => {
      this.check_connections();
    }, this.check_interval);
  }

  check_connections() {
    for (const [socket_id, connection] of Object.entries(
      this.connections_map
    )) {
      const is_timeout =
        new Date() - connection.last_packet_time > this.timeout;

      if (is_timeout) this.close_connection(socket_id, "Timeout");
      else if (!connection.socket.connected)
        this.close_connection(socket_id, "Connection lost");
    }
  }

  parse_packet(packet_id, socket_id, data) {
    if (packet_id in this.parse_packet_dict)
      return this.parse_packet_dict[packet_id](socket_id, data);
    else this.close_connection(socket_id, "Wrong packet id: " + packet_id);
  }

  close_connection(id, message) {
    console.log(
      `[${Util.get_time_hms()}]Connection[${id}] is disconnected. Error: ${message}`
    );
    delete this.connections_map[id];
  }

  add_parse_packet_dict(parse_packet_dict) {
    this.parse_packet_dict = {
      ...this.parse_packet_dict,
      ...parse_packet_dict
    };
  }

  start() {
    this.socket = io(this.port);

    this.socket.on("connection", socket => {
      this.connections_map[socket.id] = new Connection(socket);
      console.log("New connection:", socket.id);

      for (const [packet_id] of Object.entries(this.parse_packet_dict)) {
        socket.on(packet_id, data => {
          try {
            const connection = this.connections_map[socket.id];
            connection.last_packet_time = new Date();

            // Accept connection by server core, if not accepted yet.
            if (!connection.accepted) {
              const send_packet = this.parse_packet(
                "accept_connection",
                connection,
                data
              );

              if (send_packet !== undefined) {
                connection.accepted = true;
                socket.emit(send_packet.id, send_packet.data);
              } else {
                this.close_connection(
                  socket.id,
                  "Unable to accepts connection id: " + socket.id
                );
              }

              return;
            }
            // Parse packet
            const send_packet = this.parse_packet(packet_id, socket.id, data);
            // Send packet
            if (send_packet !== undefined && send_packet !== null) {
              if (send_packet.delay !== undefined) {
                setTimeout(() => {
                  socket.emit(send_packet.id, send_packet.data);
                }, send_packet.delay);
              } else socket.emit(send_packet.id, send_packet.data);
            }
          } catch (error) {
            console.log("Exception: " + error);
          }
        });
      }
    });
  }

  stop() {
    if (Object.entries(this.socket).length !== 0) {
      this.socket.close();
      this.socket = undefined;
    }
  }
}

module.exports = { Server };
