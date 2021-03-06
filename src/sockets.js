var io;
var http = require('http')
var { handleSubscribe, handleDisconnect, getSchema, getRoot} = require('./subql.js');
var { connected } = require('./socketdata.js');
const graphql = require('graphql');

const debugLog = false;

function setup(server) { 
  io = require('socket.io')(server);
  io.on('connection', function (socket) {
    connected[socket.id] = { socket };
    socket.emit('init', { id: socket.id });
    socket.on(socket.id, function (query) {
      debug(`socket.on(${socket.id}) :: [${socket.id}] made subscription request`);
      handleSubscribe(query, socket.id);
    });
    socket.on('disconnect', function(){
      handleDisconnect(socket.id);
      debug(`socket.on(disconnect) :: [${socket.id}] disconnected`);
    });
    socket.on('mutation', (data) => {
      console.log(`socket event[mutation] :: recieved query from ${socket.id}\n${data}`);
      graphql.graphql(
        graphql.buildSchema(getSchema()),
        data.query,
        getRoot()
      ).then((result) => {
        console.log(`socket event[mutation] :: result for ${socket.id}\n${result}`);
        console.log(result);
      });
    });
  });
}

function debug(debugStr){
  if(debugLog) console.log(debugStr);
}

module.exports = { setup };