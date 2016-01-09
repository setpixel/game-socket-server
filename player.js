var Player = function() {
  this.x = 1;
  this.y = 2;
  this.id;
  this.room;
  this.connectedTime;

  return this;
}

Player.prototype.getType = function() {
  console.log("getting type");
  return 'player'
}

module.exports = Player;