const Timer = require('../Timer')

class DecrementingTimer extends Timer {
  constructor (duration) {
    super()
    this.duration = duration
  }

  getRemainingTime () {
    const elapsedTime = this.getElapsedTime()

    if (elapsedTime > this.duration) {
      return 0
    }

    return this.duration - elapsedTime
  }
}

module.exports = DecrementingTimer
