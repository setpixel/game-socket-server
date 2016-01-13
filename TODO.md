# TODO

* On disconnect or room parting, send player leave message so client and make player go away.
* On updating player position, update to room's dirty list to send out on next update
* Implement a good/simple login/registration system that generates auth tokens.
* Should the update come up with a super tidy update format? Maybe binary?
* On room gameloop, keep track of framerate. If drops below a certain amount, should alert someone. Its reaching max user count.
* Come up with better naming convention for server and client messages. They are too long and not good: 'new room player' could be 'jnRoom' maybe?
* Remove semicolon syntactic sugar
* saving player data. periodically save the players state (loc, inventory, etc) to a central data store (redis?) maybe on auth, we should send the data back.
* method for server stats
  number of players
  active rooms and number of players in each room, avg frame rate, worst frame rate
* if you join a room that has too many people in it, ask joinroom for the room name
   

email users when player count goes above a certain amount
saving room data
joining a room with too many people
farming elements

