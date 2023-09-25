import dotenv from 'dotenv';
import app from '../app.js';
import debug from 'debug';
import http from "http";
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors'
debug('news:server');

dotenv.config();
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

const onError = error => {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

console.log('server listening on port :::: ', port)

let server = http.createServer(app);
console.log('port',port,server);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected',socket);

  // Get the user ID from the client (you need to implement this part)
  const userId = ''; // Replace with your own logic

  // Join a room with the user's ID as the room name
  socket.join(userId);

  // Event listener for when a client sends a message
  socket.on('message', (message) => {
    console.log('Received message:', message);

    // Broadcast the message to the user's room
    
  });

  // Event listener for when a user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

export const sendMsg=(message)=>{
  io.emit('message', message);
}