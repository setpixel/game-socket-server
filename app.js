var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var UUID = require('node-uuid');

var Player = require('./player');
// var room = require('./room')(client, players, rooms, logInfo);

var serverConfig = {
  version: '0.0.1',
  port: process.env.PORT || 3000,
  name: process.env.SERVER_NAME || 'CHUCKLESERVER',
  logLevel: 1,
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

app.use(express.static('public'));

function onSocketConnection(client) {
  var room = require('./room')(client, rooms, players, logInfo);

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
  client.on("join room", room.onJoinRoom);
  client.on("room chat", room.onRoomChat);
  client.on("room update position", room.onRoomUpdatePosition);
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



function lookUpToken(token) {
  if (token == 'YES') {
    var fakenames = ["David", "Scott", "Andrew", "James", "Christopher", "Michael", "Craig", "Ryan", "Daniel", "Ross", "Jamie", "Sean", "John", "Jordan", "Robert", "Steven", "Liam", "Mark", "Paul", "Stuart", "Matthew", "Stephen", "Thomas", "Callum", "Darren", "Gary", "Lewis", "William", "Connor", "Calum", "Martin", "Grant", "Adam", "Alexander", "Kyle", "Lee", "Kevin", "Jonathan", "Shaun", "Fraser", "Kieran", "Jack", "Dean", "Cameron", "Peter", "Alan", "Iain", "Marc", "Greg", "Graeme", "Conor", "Ian", "Euan", "Gavin", "Richard", "Blair", "Colin", "Joseph", "Aaron", "Dale", "Neil", "Sam", "Jason", "Joshua", "Gordon", "Samuel", "Stewart", "Nathan", "Nicholas", "Anthony", "Douglas", "Rory", "Alistair", "Brian", "Allan", "Ewan", "George", "Duncan", "Graham", "Ben", "Benjamin", "Gregor", "Declan", "Patrick", "Dylan", "Kenneth", "Derek", "Alasdair", "Owen", "Greig", "Barry", "Aidan", "Gareth", "Josh", "Charles", "Daryl", "Garry", "Simon", "Robbie", "Alastair"];  
    var fakeusers = [];
    for (var i = 0; i < fakenames.length; i++) {
      fakeusers.push({userid: i, username: fakenames[i]});
    }
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
    delete rooms[this.currentRoom].players[this.userid];
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