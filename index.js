require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const TimerSocketEventHandler = require('./lib/TimerSocketEventHandler')

app.use(express.static(path.join(__dirname, 'build')))

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

io.on('connection', (socket) => {
  const eventHandler = new TimerSocketEventHandler(socket)
  eventHandler.subscribe()
})

httpServer.listen(process.env.PORT || 8000)
