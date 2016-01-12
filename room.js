'use strict'

var gameloop = require('node-gameloop');

const _server = Symbol()

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
    var frameCount = 0;
    var id = gameloop.setGameLoop(function(delta) {
        // `delta` is the delta time from the last frame
        //console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
        

      this[_server].to(this.name).emit('update',this.players)

        //io.to(room).emit('update', room);

       // 
    }.bind(this), 1000 / 60);

  }

  destroy() {

  }
}

module.exports = Room;