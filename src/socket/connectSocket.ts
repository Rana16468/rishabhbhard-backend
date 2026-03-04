import { Server as HTTPServer } from 'http';
import { Server as ChatServer, Socket } from 'socket.io';
import mongoose from 'mongoose';
import users from '../module/user/user.model';

let io: ChatServer;
const onlineUsers = new Map<string, string>();

const connectSocket = (server: HTTPServer) => {
  if (!io) {
    io = new ChatServer(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      pingInterval: 30000,
      pingTimeout: 5000,
    });
  }

  io.on('connection', async (socket: Socket) => {
    console.log('Client connected:', socket.id);

    const userId = (socket.handshake.query.id as string)?.trim();


    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.warn('Invalid or missing userId:', `"${userId}"`);
      socket.emit('error', 'Invalid or missing userId');
      socket.disconnect();
      return;
    }


    const currentUser = await users.findById(userId).select('_id');
    if (!currentUser) {
      socket.emit('error', 'User not found');
      socket.disconnect();
      return;
    }

    const currentUserId = currentUser._id.toString();
    socket.join(currentUserId);

    


    console.log('User connected and rooms joined:', currentUserId);

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
      onlineUsers.delete(currentUserId);
    });
  });

  return io;
};

const getSocketIO = () => {
  if (!io) throw new Error('socket.io is not initialized');
  return io;
};

export { connectSocket, getSocketIO, onlineUsers };
