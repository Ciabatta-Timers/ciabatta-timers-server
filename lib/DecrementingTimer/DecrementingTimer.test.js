const DecrementingTimer = require('.')

describe('DecrementingTimer', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
  })

  describe('getRemainingTime', () => {
    it('Should return the duration provided to the ctor when the timer has not yet been started.', () => {
      const timer = new DecrementingTimer(1000)

      expect(timer.getRemainingTime()).toBe(1000)
    })

    it('Should return a decremented value after the timer has been started', () => {
      const timer = new DecrementingTimer(10000)

      timer.startTimer()
      jest.advanceTimersByTime(1000)

      expect(timer.getRemainingTime()).toBe(9000)
    })

    it('Should return 0 when the timer has been running for longer than the duration provided to the ctor', () => {
      const timer = new DecrementingTimer(1000)

      timer.startTimer()
      jest.advanceTimersByTime(2000)

      expect(timer.getRemainingTime()).toBe(0)
    })

    it('Should return the duration provided to the ctor when the timer has been reset', () => {
      const timer = new DecrementingTimer(1000)

      timer.startTimer()
      jest.advanceTimersByTime(500)
      timer.resetTimer()

      expect(timer.getRemainingTime()).toBe(1000)
    })
  })
})
