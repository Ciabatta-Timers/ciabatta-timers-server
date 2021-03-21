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

  describe('stopTimer', () => {
    it('Should clear associated interval', () => {
      const timer = new Timer()

      timer.startTimer()
      const intervalId = timer.intervalId
      timer.stopTimer()

      expect(timer.intervalId).not.toBe(intervalId)
    })

    it('Should set endTime to now when calling stopTimer', () => {
      const timer = new Timer()

      timer.startTimer()
      timer.stopTimer()

      expect(timer.endTime).toBe(Date.now())
    })
  })

  describe('getElapsedTime', () => {
    it('Should return 0 when the timer has not yet been started.', () => {
      const timer = new Timer()

      expect(timer.getElapsedTime()).toBe(0)
    })

    it('Should return incremented values after startTimer has been called.', () => {
      const timer = new Timer()

      timer.startTimer()
      expect(timer.getElapsedTime()).toBe(0)

      jest.advanceTimersByTime(1000)

      expect(timer.getElapsedTime()).toBe(1000)
    })

    it('Should return the same value each time when stopTimer has been called.', () => {
      const timer = new Timer()

      timer.startTimer()
      jest.advanceTimersByTime(1000)
      const timeElapsed = timer.getElapsedTime()
      timer.stopTimer()
      jest.advanceTimersByTime(1000)

      expect(timer.getElapsedTime()).toBe(timeElapsed)
    })
  })

  describe('subscribe', () => {
    it('Should call provided callback when timer is running', () => {
      const timer = new Timer()
      const callback = jest.fn()

      timer.subscribe(callback)
      timer.startTimer()
      jest.advanceTimersByTime(10000)

      expect(callback).toHaveBeenCalled()
    })

    it('Should not call provided callback if timer is never started', () => {
      const timer = new Timer()
      const callback = jest.fn()

      timer.subscribe(callback)
      jest.advanceTimersByTime(10000)

      expect(callback).not.toHaveBeenCalled()
    })

    it('Should pass elapsed time to provided callback', () => {
      const timer = new Timer()
      const callback = jest.fn()

      timer.subscribe(callback)
      timer.startTimer()
      jest.advanceTimersByTime(1000)

      expect(callback).toHaveBeenLastCalledWith(1000)
    })

    it('Should stop calling provided callback after stopTimer has been called', () => {
      const timer = new Timer()
      const callback = jest.fn()

      timer.subscribe(callback)
      timer.startTimer()
      jest.advanceTimersByTime(1000)
      const callCount = callback.mock.calls.length
      timer.stopTimer()
      jest.advanceTimersByTime(1000)

      expect(callback).toHaveBeenCalledTimes(callCount)
    })

    it('Should return true if subscription with only callback was successful', () => {
      const timer = new Timer()

      expect(timer.subscribe(jest.fn())).toBe(true)
    })

    describe('Should return false if subscription failed because', () => {
      it('No parameters were passed', () => {
        const timer = new Timer()

        expect(timer.subscribe()).toBe(false)
      })

      it('Callback is not a function', () => {
        const timer = new Timer()

        expect(timer.subscribe({})).toBe(false)
        expect(timer.subscribe([])).toBe(false)
        expect(timer.subscribe(-1)).toBe(false)
        expect(timer.subscribe(0)).toBe(false)
        expect(timer.subscribe(1)).toBe(false)
        expect(timer.subscribe(NaN)).toBe(false)
        expect(timer.subscribe('callback')).toBe(false)
        expect(timer.subscribe(true)).toBe(false)
      })
    })
  })
})
