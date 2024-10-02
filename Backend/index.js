const http = require("http");
const express = require('express');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', 
        methods: ['GET', 'POST']
    }
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    let currentRoom;

    socket.on('join room', (room) => {
        currentRoom = room;
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
        
        const roomUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit('user count', roomUsers);
    });

    socket.on('chat message', (data) => {
        const { room, message } = data;
        console.log(`Message in ${room}: ${message}`);
        io.to(room).emit('chat message', message);
    });

    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room ${room}`);

        const roomUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit('user count', roomUsers);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(8000, () => {
    console.log('Listening on port 8000');
});
