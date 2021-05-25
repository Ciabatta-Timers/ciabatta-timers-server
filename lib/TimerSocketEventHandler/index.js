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
}

module.exports = TimerSocketEventHandler
