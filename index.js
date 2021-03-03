const express = require('express')
const path = require('path')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const nanoid = require('nanoid').nanoid

app.use(express.static(path.join(__dirname, 'build')))

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

function startTimer (socket) {
  const roomId = nanoid(6)
  const startTime = Date.now()
  socket.join(roomId)
  const intervalId = setInterval(() => {
    io.to(roomId).emit('timer', {timer: Date.now() - startTime, timerId: roomId})
  }, 100)
  socket.intervalId = intervalId
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    clearInterval(socket.intervalId)
  })

  socket.on('startTimer', (interval) => {
    startTimer(socket)
  })

  socket.on('stopTimer', () => {
    clearInterval(socket.intervalId)
    delete socket.intervalId
  })

  socket.on('subscribeToTimer', (timerId) => {
    if (socket.rooms.has(timerId)) {
      console.log(`Already in room ${timerId}`)
    } else {
      socket.join(timerId)
    }
  })

  socket.on('unsubscribeToTimer', (timerId) => {
    if (timerId) {
      socket.leave(timerId)
    } else {
      for (let room in socket.rooms.filter(room => room !== socket.id)) {
        socket.leave(room)
      }
    }
  })
})

httpServer.listen(process.env.PORT || 8000)
