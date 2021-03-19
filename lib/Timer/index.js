class Timer {
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
}

module.exports = Timer
