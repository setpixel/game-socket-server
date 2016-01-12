# Game Socket Server

This is a node / socket.io realtime game server for a platformer game client. I've been working on a platformer game engine in phaser. It will be an adventure type of platformer (metroidvania, open world). There will be multiple interconnected rooms within the entire world. 

## Objective

I would like concurrent players to be able to play aside others. If you want to play the game with a friend, friends, or just random people, you just join the game and go to the same place. You'll also be able to chat in that specific room. Maybe some global chat. Maybe some light teleportation if you've already been to that area.

If anything moves in the room in a predictable way (moving platforms, blinking lights, spikes), the server should sync with the clients so the events happen the same on all clients.

Additionally, if anything happens randomly, the random number generator should be seeded on a room based random seed.

I also want to do some npc syncing through the server. So far, I'm thinking that the first client that encounters an enemy "claims" it and sends the actions of the enemies to the other players. 

There should also be support for short term room objects and world deformation. For example, if I break a block, and another player comes in the game, the block should be broken -- at least for a limited time. Additionally, if I drop an object that other players can interact with, that object should be available after I leave the room for others. 

## Quick installation guide

	1. Clone or download the repo
	2. npm install
	3. node app

## Demo
Deployed automatically on commit and push to master.

[https://game-socket-server.herokuapp.com](https://game-socket-server.herokuapp.com)

