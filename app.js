var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var UUID = require('node-uuid');
var gameloop = require('node-gameloop');

var Player = require('./player');
var Client = require('./client');
var Logger = require('./logger');
var serverConfig = require('./serverconfig');

var players;
var rooms;

function init() {
  // const client = new Client(players, rooms, serverConfig);
  players = {};
  rooms = {};
  server.listen(serverConfig.port);
  Logger.log(`Listening on port ${serverConfig.port}`, 100);
  Logger.log(`Version: ${serverConfig.version}`, 100);
  Logger.log(`Time: ${Date.now()}`, 100);
  Logger.log('=============================================', 100);
  // io.on('connection', client.onConnected)
  io.on('connection', socket => {
    const client = new Client(players, rooms, serverConfig)

    client.onConnected(socket)
  })
}

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.use(express.static('public'));


// var frameCount = 0;
// var id = gameloop.setGameLoop(function(delta) {
//     // `delta` is the delta time from the last frame
//     //console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
//     for (var room in rooms) {
//       //console.log(room, rooms)
//       //io.to(room).emit('update', room);
//     }

//    // 
// }, 1000 / 60);

init();