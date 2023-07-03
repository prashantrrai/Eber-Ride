const express = require('express')

const  socketio  = require('socket.io');


async function initializeSocket(server) {
    const io = socketio(server, {cors: {origin: ["http://localhost:4200"]}});

    io.on("connection", (socket) => {
        console.log("A client has connected from Socket.io");

        socket.on("disconnect", () => {
            console.log("client Disconnected");
          });
    })


};

module.exports = initializeSocket;