'use strict'

const _client = Symbol()
const _rooms = Symbol()
var Room = require('./room')

class Player {
  constructor(userid, username, clientid, client, rooms){
    this.userid = userid
    this.username = username
    this.clientid = clientid
    this[_client] = client
    this[_rooms] = rooms
    this.x = 0
    this.y = 0
    this.color = 'black'
    this.loginTime = Date.now()
    this.ip = client.handshake.address
    this.userAgent = client.handshake.headers['user-agent']
  }

  updatePosition(x, y) {
    this.x = x
    this.y = y
    // TODO update room's dirty
  }

  joinRoom(room) {
    if (this.currentRoom) {
      // part the room
      this.leaveRoom()
    }
    this[_client].join(room)
    this.currentRoom = room
    if (this[_rooms][room]){
      this[_rooms][room].players[this.userid] = this
    } else {
      var roomInstance = new Room(room, this, this[_client].server)
      this[_rooms][room] = roomInstance
    }
    this[_rooms][room].addPlayer()
    this[_client].emit('room list', this[_rooms][room])
    this[_client].broadcast.to(room).emit('new room player', this)
  }

  leaveRoom() {
    if (this[_rooms][this.currentRoom]) {
      // TODO tell everyone in the room im gone
      this[_client].leave(this.currentRoom)
      this[_rooms][this.currentRoom].removePlayer(this.userid)
    }
  }

}

module.exports = Player