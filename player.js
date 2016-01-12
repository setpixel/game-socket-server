'use strict'

const _client = Symbol()

class Player {
  constructor(userid, username, clientid, client){
    this.userid = userid;
    this.username = username;
    this.clientid = clientid;
    this[_client] = client;
    this.x = 0;
    this.y = 0;
    this.color = 'black';
    this.loginTime = Date.now();
    this.ip = client.handshake.address;
    this.userAgent = client.handshake.headers['user-agent'];
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // getClient() {
  //   return this[_client];
  // }

}

module.exports = Player;