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
}

module.exports = Timer
