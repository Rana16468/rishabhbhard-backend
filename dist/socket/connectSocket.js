"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = exports.getSocketIO = exports.connectSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const onlineUsers = new Map();
exports.onlineUsers = onlineUsers;
const connectSocket = (server) => {
    if (!io) {
        io = new socket_io_1.Server(server, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
            pingInterval: 30000,
            pingTimeout: 5000,
        });
    }
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Client connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.id);
        });
    }));
    return io;
};
exports.connectSocket = connectSocket;
const getSocketIO = () => {
    if (!io)
        throw new Error('socket.io is not initialized');
    return io;
};
exports.getSocketIO = getSocketIO;
