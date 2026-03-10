import { Server as HTTPServer } from 'http';
import { Server as ChatServer, Socket } from 'socket.io';


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

    

 


  

    
   

    


   

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
      
    });
  });

  return io;
};

const getSocketIO = () => {
  if (!io) throw new Error('socket.io is not initialized');
  return io;
};

export { connectSocket, getSocketIO, onlineUsers };
