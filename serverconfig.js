const serverConfig = {
  version: '0.0.1',
  port: process.env.PORT || 3000,
  name: process.env.SERVER_NAME || 'CHUCKLESERVER',
  logLevel: 1,
  framerate: 1000/1,
}

module.exports = serverConfig