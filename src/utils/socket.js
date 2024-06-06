import io from 'socket.io-client';

const socket = io('https://leaves-bug-server.onrender.com',  { transports : ['websocket'] });

export default socket;