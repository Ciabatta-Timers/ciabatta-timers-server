class Timer {
  constructor () {
    this.callbacks = []
  }

  startTimer () {
    if (this.intervalId) {
      return false
    }

    this.startTime = Date.now()
    clearInterval(this.intervalId)
    this.intervalId = setInterval(this.onTimerTick.bind(this), 100)

    return true
  }

  onTimerTick () {
    if (this.startTime && this.callbacks?.length) {
      for (const callback of this.callbacks) {
        callback(this.getElapsedTime())
      }
    }
  }

  stopTimer () {
    this.endTime = Date.now()
    clearInterval(this.intervalId)
    this.intervalId = undefined
  }

  getElapsedTime () {
    if (!this.startTime) {
      return 0
    }

    if (this.endTime) {
      return this.endTime - this.startTime
    }

    return Date.now() - this.startTime
  }

  subscribe (callback) {
    if (typeof callback !== 'function') {
      return false
    }

    this.callbacks.push(callback)

    return true
  }
}

module.exports = Timer
