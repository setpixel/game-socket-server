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
var rooms;

function init() {
  players = {};
  rooms = {};
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
  client.emit('onconnected');
  logInfo(client.id + ' connected', 100);
  // start the clock for them to auth
  client.connectionAuthTimeout = setTimeout(function(){
    logInfo('disconnect user after 5000 ms');
    client.disconnect();
  }, 5000);
  client.on('auth', onAuth);

  client.on("disconnect", onClientDisconnect);
  client.on("player message", onPlayerMessage);
  client.on("server time", onServerTime);
  client.on("players", onGetPlayers);
  client.on("join room", onJoinRoom);
  client.on("room chat", onRoomChat);
  client.on("room update position", onRoomUpdatePosition);
};

function onAuth(token) {
  clearTimeout(this.connectionAuthTimeout);
  if (token) {
    // look up token. is good let them in, not disconnect
    //var loginInfo;
    var loginInfo = lookUpToken(token);
    if (loginInfo) {
      // Init Player class
      var newPlayer = new Player(loginInfo.userid, loginInfo.username, this.id, this);
      logInfo(newPlayer.username + ' authenticated', 100);
      this.userid = loginInfo.userid;
      players[this.userid] = newPlayer;
      this.emit('authenticated', newPlayer);
      // Grab Global information Information/stats
      this.emit('server stats', {
        name: serverConfig.name,
        version: serverConfig.version,
        players: Object.keys(players).length,
        time: Date.now(),
      })
      // Client should join a main lobby? Maybe join a room?
    } else {
      this.disconnect();
    }
  } else {
    this.disconnect();
  }
}

function onJoinRoom(room) {
  if (this.currentRoom) {
    // tell everyone im gone
    // part the room
    this.leave(this.currentRoom);
    // delete myself from the list
    var index = rooms[this.currentRoom].players.indexOf(this.userid);
    rooms[this.currentRoom].players.splice(index, 1);
  }
  this.join(room);
  this.currentRoom = room;
  if (rooms[room]){
    rooms[room].players.push(this.userid);
  } else {
    rooms[room] = { name: room, players: [this.userid]}
  }
  this.emit('room list', rooms[room]);
  this.broadcast.to(room).emit('new room player', players[this.userid]);
}

function onRoomChat(chatMessage) {
  logInfo(this.currentRoom + ' > ' + players[this.userid].username + ": " + chatMessage)
  this.broadcast.to(this.currentRoom).emit('room chat', {room: this.currentRoom, userid: this.userid, username: players[this.userid].username, message: chatMessage});
};

function onRoomUpdatePosition(position) {
  

  logInfo(this.currentRoom + ' > ' + players[this.userid].username + ": updatePosition")
  this.broadcast.to(this.currentRoom).emit('room position', {userid: this.userid, position: position});
};


function lookUpToken(token) {
  if (token == 'YES') {
    var fakeusers = [
      { 
        userid: 1,
        username: 'setpixel',
      },
      { 
        userid: 2,
        username: 'eip56',
      },
      { 
        userid: 3,
        username: 'sneech',
      },
      { 
        userid: 4,
        username: 'bob',
      },
      { 
        userid: 5,
        username: 'susan',
      },
      { 
        userid: 6,
        username: 'jerry',
      },
      { 
        userid: 7,
        username: 'linda',
      }
    ];
    var user = fakeusers[Math.round(Math.random()*(fakeusers.length-1))]
    return user;
  } else {
    return false;
  }
};

function onClientDisconnect(client) {
  if (players[this.userid]) {
    logInfo(players[this.userid].username + ' disconnected.');
  }
  // TODO notify all other appropriate players.
  delete players[this.userid];

  if (this.currentRoom && rooms[this.currentRoom]) {
    var index = rooms[this.currentRoom].players.indexOf(this.userid);
    rooms[this.currentRoom].players.splice(index, 1);

  }
};

function onPlayerMessage(messageText) {
  console.log('\t socket.io:: player ' + this.userid + ': ' + messageText);
};

function onServerTime() {
  this.emit('time', Date.now() );
};

function onGetPlayers() {
  this.emit('players', players);
};



function logInfo(string, level) {
  if (!level) { level = 0 };
  if (level >= serverConfig.logLevel) {
    console.log('\t || ' + serverConfig.name + ' || ' + string);
  }
}

init();