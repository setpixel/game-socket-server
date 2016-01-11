module.exports = function makeRoom(client, rooms, players, logInfo) {
  return {
    
    onJoinRoom: function onJoinRoom(room) {
      if (client.currentRoom) {
        // tell everyone im gone
        // part the room
        client.leave(client.currentRoom);
        // delete myself from the list
        var index = rooms[client.currentRoom].players.indexOf(client.userid);
        rooms[client.currentRoom].players.splice(index, 1);
      }
      client.join(room);
      client.currentRoom = room;
      if (rooms[room]){
        rooms[room].players[client.userid] = players[client.userid];
      } else {
        rooms[room] = { name: room, players: {}};
        rooms[room].players[client.userid] = players[client.userid];
      }
      client.emit('room list', rooms[room]);
      client.broadcast.to(room).emit('new room player', players[client.userid]);
    },

    onRoomChat: function onRoomChat(chatMessage) {
      logInfo(client.currentRoom + ' > ' + players[client.userid].username + ": " + chatMessage)
      client.broadcast.to(client.currentRoom).emit('room chat', {room: client.currentRoom, userid: client.userid, username: players[client.userid].username, message: chatMessage});
    },

    onRoomUpdatePosition: function onRoomUpdatePosition(position) {
      players[client.userid].updatePosition(position.x, position.y);

      logInfo(client.currentRoom + ' > ' + players[client.userid].username + ": updatePosition")
      client.broadcast.to(client.currentRoom).emit('room position', {userid: client.userid, clientid: client.id, position: position});
    }

  };
};