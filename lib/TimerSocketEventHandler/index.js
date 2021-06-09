const Timer = require('../Timer')
const nanoid = require('nanoid').nanoid

class TimerSocketEventHandler {
  constructor (socket) {
    if (!socket || typeof socket !== 'object') {
      throw new Error('No valid socket provided')
    }

    this.socket = socket
  }

  subscribe () {
    this.socket.on('createTimer', this.createTimer.bind(this))
    this.socket.on('startTimer', this.startTimer.bind(this))
    this.socket.on('stopTimer', this.stopTimer.bind(this))
    this.socket.on('joinTimer', this.joinTimer.bind(this))
  }

  createTimer (acknowledgement) {
    if (this.timer) {
      acknowledgement?.({ error: 'A timer has already been created' })
      return
    }

    const timerId = nanoid(6)
    this.socket.join(timerId)
    this.timer = new Timer()
    acknowledgement?.({ timerId: timerId })
  }

  startTimer (acknowledgement) {
    if (!this.timer) {
      acknowledgement?.({ error: 'No timer has been created' })
      return
    }

    if (!this.timer.startTimer()) {
      acknowledgement?.({ error: 'Timer failed to start' })
    }

    acknowledgement?.({ time: this.timer.getElapsedTime() })
  }

  stopTimer (acknowledgement) {
    if (!this.timer) {
      acknowledgement?.({ error: 'No timer has been created' })
      return
    }

    this.timer.stopTimer()
    acknowledgement?.({ time: this.timer.getElapsedTime() })
  }

  joinTimer (timerId, acknowledgement) {
    if (!timerId || typeof timerId !== 'string') {
      acknowledgement?.({
        error: `timerId is not valid: ${timerId}`
      })
      return
    }
    if (this.socket.rooms.has(timerId)) {
      acknowledgement?.({
        error: `timerId has already been joined: ${timerId}`
      })
      return
    }

    this.socket.join(timerId)
    acknowledgement?.()
  }
}

module.exports = TimerSocketEventHandler
