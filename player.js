var Player = function(userid, username, clientid, client) {
  this.userid = userid;
  this.username = username;
  this.clientid = clientid;
  //this.client = client;
  this.x = 0;
  this.y = 0;
  this.color = 'black';
  this.loginTime = Date.now();
  this.ip = client.handshake.address;
  this.userAgent = client.handshake.headers['user-agent'];
  return this;
}

Player.prototype.updatePosition = function(x, y) {
  this.x = x;
  this.y = y;
}

module.exports = Player;