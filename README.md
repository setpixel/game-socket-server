# Game Socket Server

This is a node / socket.io realtime game server for a platformer game client. I've been working on a platformer game engine in phaser. It will be an adventure type of platformer (metroidvania, open world). There will be multiple interconnected rooms within the entire world. 

## TODO

[TODO.md](TODO.md)

## Objective

I would like concurrent players to be able to play aside others. If you want to play the game with a friend, friends, or just random people, you just join the game and go to the same place. You'll also be able to chat in that specific room. Maybe some global chat. Maybe some light teleportation if you've already been to that area.

If anything moves in the room in a predictable way (moving platforms, blinking lights, spikes), the server should sync with the clients so the events happen the same on all clients.

Additionally, if anything happens randomly, the random number generator should be seeded on a room based random seed.

I also want to do some npc syncing through the server. So far, I'm thinking that the first client that encounters an enemy "claims" it and sends the actions of the enemies to the other players. 

There should also be support for short term room objects and world deformation. For example, if I break a block, and another player comes in the game, the block should be broken -- at least for a limited time. Additionally, if I drop an object that other players can interact with, that object should be available after I leave the room for others. 

## Client connection process

Prior to connecting to the socket server:

1. Sign up (optional)
1. Log in with credentials or guest
  * You will be given an auth token you can use to auth with the socket server.
 
Once you have your auth token:

1. Connect to the server. 
On sucess, the server will emit <= (**'onconnected'**).
1. Authenticate with your given token => (**'auth', tokenString**)
  * You have 5 seconds to auth with a correct token or you will be disconnected.
  * If authenticated, the server will emit <= (**'authenticated', {player object}**)
  * You should locally store that player object. You might need to know who your user is.
  * Server will also emit <= (**'server stats', {stats object}**)
1. Join a room => (**'join room', roomString**)
  * Joining a room, the server will emit **<= ('room list', {room object})**
  * The room object will contain: the name of the room, an object of players keyed by their user id
1. Send an update of your position. **=> ('room update position', {x, y})**
  * There will be no response directly to you update, but will be contained in the room update (see below).
1. Listen for important in room events
  * Players joining/leaving **<= ('new room player', {player object})**, **<= ('room player leave', {player object})**
  * Room updates. When the first player enters a room, the server starts a gameloop on the server that will fire on a a specific frequency (40 times a second). The purpose is to collect all of the latest updates in the room, and send them to everyone in the room. This is much more efficient than sending a message every time there is an update. Additionally, if there are no fresh updates, no message will be sent.  **<= ('update', [updates])**,
1. Connect to other rooms **=> ('join room', roomString)**
  * Connecting to another room will leave the existing room.
 
For now, everything is pretty simple. You connect, auth, join a room. Send updates, receive updates. When you go to another room, join another room. When you quit, you disconnect. Easy!

## Quick installation guide

  1. Clone or download the repo `git clone https://github.com/setpixel/game-socket-server.git`
  2. `npm install`
  3. `npm start`

## Demo
Deployed automatically on commit and push to master.

[https://game-socket-server.herokuapp.com](https://game-socket-server.herokuapp.com)
