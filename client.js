'use strict'

var Logger = require('./logger')
var Player = require('./player');

class Client {
  constructor(players, rooms, serverConfig) {
    this.players = players;
    this.rooms = rooms;
    this.serverConfig = serverConfig;
    this.client = null
  }

  onConnected( client ) {
    this.client = client

    this.client.emit('onconnected');
    Logger.log(this.client.id + ' connected', 100);

    this.connectionAuthTimeout = setTimeout( () => {
      Logger.log('disconnect user after 5000 ms');
      this.client.disconnect();
    }, 5000);
    
    this.client.on('auth', this.onAuth.bind(this));
    this.client.on("disconnect", this.onClientDisconnect.bind(this));
    this.client.on("server time", this.onServerTime.bind(this));
    this.client.on("join room", this.onJoinRoom.bind(this));
    this.client.on("room chat", this.onRoomChat.bind(this));
    this.client.on("room update position", this.onRoomUpdatePosition.bind(this));
    //this.client.on("players", onGetPlayers);
    //this.client.on("player message", onPlayerMessage);
  }

  onJoinRoom(room) {
    if (this.currentRoom) {
      // tell everyone im gone
      // part the room
      this.client.leave(client.currentRoom);
      // delete myself from the list
      delete this.rooms[this.currentRoom].players[this.userid];
    }
    this.client.join(room);
    this.currentRoom = room;
    if (this.rooms[room]){
      this.rooms[room].players[this.userid] = this.players[this.userid];
    } else {
      this.rooms[room] = { name: room, players: {}};
      this.rooms[room].players[this.userid] = this.players[this.userid];
    }
    this.client.emit('room list', this.rooms[room]);
    this.client.broadcast.to(room).emit('new room player', this.players[this.userid]);
  }

  onRoomChat(chatMessage) {
    Logger.log(this.currentRoom + ' > ' + this.players[this.userid].username + ": " + chatMessage)
    this.client.broadcast.to(this.currentRoom).emit('room chat', {room: this.currentRoom, userid: this.userid, username: this.players[this.userid].username, message: chatMessage});
  }

  onRoomUpdatePosition(position) {
    this.players[this.userid].updatePosition(position.x, position.y);
    Logger.log(this.currentRoom + ' > ' + this.players[this.userid].username + ": updatePosition")
    this.client.broadcast.to(this.currentRoom).emit('room position', {userid: this.userid, clientid: this.client.id, position: position});
  }

  onAuth(token) {
    clearTimeout(this.connectionAuthTimeout);
    if (token) {
      // look up token. is good let them in, not disconnect
      //var loginInfo;
      //console.log()

      const loginInfo = this.lookUpToken(token);
      if (loginInfo) {
        // Init Player class
        var newPlayer = new Player(loginInfo.userid, loginInfo.username, this.client.id, this.client);
        Logger.log(newPlayer.username + ' authenticated', 100);
        this.userid = loginInfo.userid;
        this.players[this.userid] = newPlayer;
        this.client.emit('authenticated', newPlayer);
        // Grab Global information Information/stats
        this.client.emit('server stats', {
          name: this.serverConfig.name,
          version: this.serverConfig.version,
          players: Object.keys(this.players).length,
          time: Date.now(),
        })
        // Client should join a main lobby? Maybe join a room?
      } else {
        this.client.disconnect();
      }
    } else {
      this.client.disconnect();
    }
  }

  lookUpToken(token) {
    if (token == 'YES') {
      const fakenames = ["David", "Scott", "Andrew", "James", "Christopher", "Michael", "Craig", "Ryan", "Daniel", "Ross", "Jamie", "Sean", "John", "Jordan", "Robert", "Steven", "Liam", "Mark", "Paul", "Stuart", "Matthew", "Stephen", "Thomas", "Callum", "Darren", "Gary", "Lewis", "William", "Connor", "Calum", "Martin", "Grant", "Adam", "Alexander", "Kyle", "Lee", "Kevin", "Jonathan", "Shaun", "Fraser", "Kieran", "Jack", "Dean", "Cameron", "Peter", "Alan", "Iain", "Marc", "Greg", "Graeme", "Conor", "Ian", "Euan", "Gavin", "Richard", "Blair", "Colin", "Joseph", "Aaron", "Dale", "Neil", "Sam", "Jason", "Joshua", "Gordon", "Samuel", "Stewart", "Nathan", "Nicholas", "Anthony", "Douglas", "Rory", "Alistair", "Brian", "Allan", "Ewan", "George", "Duncan", "Graham", "Ben", "Benjamin", "Gregor", "Declan", "Patrick", "Dylan", "Kenneth", "Derek", "Alasdair", "Owen", "Greig", "Barry", "Aidan", "Gareth", "Josh", "Charles", "Daryl", "Garry", "Simon", "Robbie", "Alastair"];  
      const fakeusers = fakenames.map((name, i) => ({ userid: i, username: name}));
      const user = fakeusers[Math.round(Math.random()*(fakeusers.length-1))]
      return user;
    } else {
      return false;
    }
  };

  onClientDisconnect() {
    if (this.players[this.userid]) {
      Logger.log(this.players[this.userid].username + ' disconnected.');
    }
    // TODO notify all other appropriate players.
    delete this.players[this.userid];

    if (this.currentRoom && this.rooms[this.currentRoom]) {
      delete this.rooms[this.currentRoom].players[this.userid];
    }
  };

  onServerTime() {
    this.client.emit('time', Date.now() );
  };

// function onGetPlayers() {
//   this.emit('players', players);
// };

// function onPlayerMessage(messageText) {
//   console.log(`\t socket.io:: player ${this.userid} : ${messageText}`);
// };



}

module.exports = Client