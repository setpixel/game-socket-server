'use strict'

class Room {
  constructor(name, player) {
    this.name = name;
    this.players = {[player.userid]: player};
  }
}

module.exports = Room;