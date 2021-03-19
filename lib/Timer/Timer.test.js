const Timer = require('.')

describe('Timer', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
  })

  describe('startTimer', () => {
    it('Should set startTime to now when calling startTimer.', () => {
      const timer = new Timer()
      const startTime = Date.now()

      timer.startTimer()

      expect(timer.startTime).toBe(startTime)
    })

    it('startTime should remain the same after startTimer has been called.', () => {
      const timer = new Timer()

      const startTime = Date.now()
      timer.startTimer()
      jest.advanceTimersByTime(1000)

      expect(timer.startTime).toBe(startTime)
    })

    it('Should return true if starting succeeded', () => {
      const timer = new Timer()

      expect(timer.startTimer()).toBe(true)
    })

    it('Should return false if timer has already been started', () => {
      const timer = new Timer()

      timer.startTimer()
      expect(timer.startTimer()).toBe(false)
    })
  })
})
