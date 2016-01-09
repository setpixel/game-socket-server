var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var UUID = require('node-uuid');

var Player = require('./player');

var serverConfig = {
  version: '0.0.1',
  port: process.env.PORT || 3000,
  name: process.env.SERVER_NAME || 'CHUCKLESERVER',
  logLevel: 0,
}

var players;
var connectionAuthTimeout;

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
  logInfo(client.userid + ' connected', 100);
  // start the clock for them to auth
  connectionAuthTimeout = setTimeout(function(){
    logInfo('disconnect user after 2000 ms');
    client.disconnect();
  }, 2000);
  client.on('auth', onAuth);



  client.on("disconnect", onClientDisconnect);
  client.on("player message", onPlayerMessage);
  client.on("new player", onNewPlayer);
  client.on("server time", onServerTime);
};

function onAuth(token) {
  clearTimeout(connectionAuthTimeout);
  if (token) {
    // look up token. is good let them in, not disconnect
    if (token == 'YES') {
      // Init Player class
      // Grab Global information Information/stats
      // Join a main lobby
    } else {
      this.disconnect();
    }
  } else {
    this.disconnect();
  }

}

function onClientDisconnect(client) {
  logInfo('client disconnected ' + this.userid);
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
  if (level >= serverConfig.logLevel) {
    console.log('\t || ' + serverConfig.name + ' || ' + string);
  }
}

init();