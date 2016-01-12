'use strict'

var serverConfig = require('./serverconfig');
var Logger = require('./logger')
var Player = require('./player')
var Room = require('./room')

class Client {
  
  constructor(players, rooms) {
    this.players = players;
    this.rooms = rooms;
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
 
  }

  onJoinRoom(room) {
    this.player.joinRoom(room);
  }

  onRoomChat(chatMessage) {
    Logger.log(this.currentRoom + ' > ' + this.players[this.userid].username + ": " + chatMessage)
    this.client.broadcast.to(this.currentRoom).emit('room chat', {room: this.currentRoom, userid: this.userid, username: this.players[this.userid].username, message: chatMessage});
  }

  onRoomUpdatePosition(position) {
    this.player.updatePosition(position.x, position.y);
    Logger.log(this.currentRoom + ' > ' + this.players[this.userid].username + ": updatePosition")
    this.client.broadcast.to(this.player.currentRoom).emit('room position', {userid: this.userid, clientid: this.client.id, position: position});
  }

  onAuth(token) {
    clearTimeout(this.connectionAuthTimeout);
    if (token) {
      // look up token. is good let them in, not disconnect
      const loginInfo = this.lookUpToken(token);
      if (loginInfo) {
        // Init Player class
        var newPlayer = new Player(loginInfo.userid, loginInfo.username, this.client.id, this.client, this.rooms);
        Logger.log(newPlayer.username + ' authenticated', 100);
        this.userid = loginInfo.userid;
        this.players[this.userid] = this.player = newPlayer;
        this.client.emit('authenticated', newPlayer);
        // Grab Global information Information/stats
        this.client.emit('server stats', {
          name: serverConfig.name,
          version: serverConfig.version,
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
    if (this.player) {
      Logger.log(this.player.username + ' disconnected.', 100);
      // TODO notify all other appropriate players.
      // remove from players list
      delete this.players[this.userid];
      if (this.player.currentRoom) {
        this.player.leaveRoom()
      }
    }
  };

  onServerTime() {
    this.client.emit('time', Date.now() );
  };

}

module.exports = Client