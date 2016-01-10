var Player = function(userid, username, clientid) {
  this.userid = userid;
  this.username = username;
  this.clientid = clientid;
  this.x = 0;
  this.y = 0;
  this.color = 'black';
  return this;
}

Player.prototype.getType = function() {
  console.log("getting type");
  return 'player'
}

module.exports = Player;