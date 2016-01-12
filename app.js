var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var serverConfig = require('./serverconfig');
var Player = require('./player');
var Client = require('./client');
var Logger = require('./logger');

var players;
var rooms;

function init() {
  players = {};
  rooms = {};

  server.listen(serverConfig.port);

  Logger.log('=============================================', 100);
  Logger.log(`STARTING UP...`, 100);
  Logger.log(`Listening on port ${serverConfig.port}`, 100);
  Logger.log(`Version: ${serverConfig.version}`, 100);
  Logger.log(`Time: ${Date.now()}`, 100);
  Logger.log(`GUITAR RIFF ♪♫♪☠☠`, 100);
  Logger.log('=============================================', 100);

  io.on('connection', socket => {
    const client = new Client(players, rooms, serverConfig)
    client.onConnected(socket)
  })
}

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.use(express.static('public'));

init();