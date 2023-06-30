const { Server } = require("socket.io");


const initializeSocket = (server) => {
    const socketServer = new Server(server);

    socketServer.on("connection", (socket) => {
        console.log("A client has connected");

        socket.on("disconnect", () => {
            console.log("A client has disconnected");
          });
    })

    return socketServer;

};

module.exports = initializeSocket;