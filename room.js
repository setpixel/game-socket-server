'use strict'

var gameloop = require('node-gameloop');
var serverConfig = require('./serverconfig');

const _server = Symbol()
const _gameloopid = Symbol()

class Room {
  constructor(name, player, server) {
    this.name = name;
    this.players = {[player.userid]: player};
    this.randomSeed = 6;
    this[_server] = server;
    //console.log(server)
    this.setUpGameLoop()
  }

  setUpGameLoop() {
    // TODO
    // game loop needs to see all the dirty updates and send them to everyone in the room
    // if no dirties, don't send shit.
    // also keep track of the deltas and log them (to see if the framerate drops too low)
    var frameCount = 0;
    this[_gameloopid] = gameloop.setGameLoop(function(delta) {
      // `delta` is the delta time from the last frame
      //console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
      frameCount++;
      this[_server].to(this.name).emit('update',frameCount)
    }.bind(this), serverConfig.framerate);
  }

  addPlayer() {
    if (this[_gameloopid] == null) {
      this.setUpGameLoop();
    }
  }

  removePlayer(userid) {
    delete this.players[userid];
    if (Object.keys(this.players).length == 0) {
      console.log("STOPPING GAME LOOP!")
      this.stopGameloop();
    }
  }

  stopGameloop() {
    gameloop.clearGameLoop(this[_gameloopid]);
    this[_gameloopid] = null;
  }
}

module.exports = Room;