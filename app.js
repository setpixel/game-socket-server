var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var UUID = require('node-uuid');

var Player = require('./player');

var serverConfig = {
  version: '0.0.1',
  port: process.env.PORT || 3000,
  name: process.env.SERVER_NAME || 'CHUCKLESERVER',
  logLevel: 1,
}

var players;

function init() {
  players = [];
  server.listen(serverConfig.port);
  logInfo('Listening on port ' + serverConfig.port, 100);
  logInfo('Version: ' + serverConfig.version, 100);
  logInfo('Time: ' + Date.now(), 100);
  logInfo('=============================================', 100);
  io.on('connection', onSocketConnection);
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

function onSocketConnection(client) {
  client.userid = UUID();
  client.emit('onconnected', { id: client.userid } );
  console.log('\t socket.io:: player ' + client.userid + ' connected');

  client.on("disconnect", onClientDisconnect);

  client.on("player message", onPlayerMessage);

  client.on("new player", onNewPlayer);

  client.on("server time", onServerTime);
};

function onClientDisconnect(client) {
  console.log('\t socket.io:: client disconnected ' + this.userid);
};

function onPlayerMessage(messageText) {
  console.log('\t socket.io:: player ' + this.userid + ': ' + messageText);
};

function onNewPlayer() {
  console.log('New Player!!!');
  var newPlayer = new Player();
  //newPlayer.id = this.id;

  players.push(newPlayer);

  console.log(players);
};

function onServerTime() {
  this.emit('time', Date.now() );
  //io.emit('time', Date.now() );
};

function logInfo(string, level) {
  if (!level) { level = 0 };
  if (level > serverConfig.logLevel) {
    console.log('\t || ' + serverConfig.name + ' || ' + string);
  }
}

init();