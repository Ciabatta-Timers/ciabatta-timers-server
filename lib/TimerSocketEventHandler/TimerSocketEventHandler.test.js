const { createServer } = require('http')
const { Server } = require('socket.io')
const Client = require('socket.io-client')
const TimerSocketEventHandler = require('.')

const mockedTimerId = 'aBc123'

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => mockedTimerId)
}))

jest.mock('../Timer')
const Timer = require('../Timer')

describe('TimerSocketEventHandler', () => {
  let io, serverSocket, clientSocket

  beforeEach((done) => {
    const httpServer = createServer()
    io = new Server(httpServer)
    httpServer.listen(() => {
      const port = httpServer.address().port
      clientSocket = new Client(`http://localhost:${port}`)
      io.on('connection', (socket) => {
        serverSocket = socket
      })
      clientSocket.on('connect', done)
    })
  })

  afterEach(() => {
    io.close()
    clientSocket.close()
  })

  describe('Ctor', () => {
    it('Should throw if the provided socket is invalid', () => {
      expect(() => new TimerSocketEventHandler()).toThrow()
      expect(() => new TimerSocketEventHandler(null)).toThrow()
      expect(() => new TimerSocketEventHandler(false)).toThrow()
      expect(() => new TimerSocketEventHandler(true)).toThrow()
      expect(() => new TimerSocketEventHandler(0)).toThrow()
      expect(() => new TimerSocketEventHandler(1)).toThrow()
      expect(() => new TimerSocketEventHandler(jest.fn())).toThrow()
      expect(() => new TimerSocketEventHandler('')).toThrow()
      expect(() => new TimerSocketEventHandler('socket')).toThrow()
    })

    it('Should assign the provided socket as an instance member', () => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)

      expect(eventHandler.socket).toBe(serverSocket)
    })
  })

  describe('Creating Timers', () => {
    beforeEach(() => {
      Timer.mockClear()
    })

    it('Should call the acknowledgement callback on createTimer event', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      jest.spyOn(eventHandler, 'createTimer')
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        expect(eventHandler.createTimer).toHaveBeenCalled()
        done()
      })
    })

    it('Should respond to createTimer with a timer ID', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', (arg) => {
        expect(typeof arg).toBe('object')
        expect(arg.timerId).toMatch(mockedTimerId)
        done()
      })
    })

    it('Should join the SocketIO room of the same id as the timer', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', (arg) => {
        expect(serverSocket.rooms).toContain(arg.timerId)
        done()
      })
    })

    it('Should create a Timer object and store it as an instance member', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        expect(Timer).toHaveBeenCalledTimes(1)
        expect(eventHandler.timer).toBeInstanceOf(Timer)
        done()
      })
    })

    it('Should call the Timer.subscribe function', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        expect(eventHandler.timer.subscribe).toHaveBeenCalledTimes(1)
        expect(eventHandler.timer.subscribe).toHaveBeenCalledWith(expect.any(Function))
        done()
      })
    })

    it('Should call the acknowledgement callback with an error if a timer already exists', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer')
      clientSocket.emit('createTimer', (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })
  })

  describe('Starting Timers', () => {
    it('Should call the acknowledgement callback with an error if no timer has been created', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('startTimer', (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })

    it('Should call the acknowledgement callback with an error if Timer.startTimer returns falsy', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        jest.spyOn(eventHandler.timer, 'startTimer').mockImplementation(() => false)

        clientSocket.emit('startTimer', (arg) => {
          expect(typeof arg.error).toBe('string')
          expect(arg.error).toBeTruthy()
          done()
        })
      })
    })

    it('Should call the acknowledgement callback with a start time', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        jest.spyOn(eventHandler.timer, 'getElapsedTime').mockImplementation(() => 0)
        jest.spyOn(eventHandler.timer, 'startTimer').mockImplementation(() => true)

        clientSocket.emit('startTimer', (arg) => {
          expect(arg.error).toBeFalsy()
          expect(typeof arg.time).toBe('number')
          done()
        })
      })
    })

    it('Should call the startTimer function of the associated timer object', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer')
      clientSocket.emit('startTimer', () => {
        expect(eventHandler.timer.startTimer).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  describe('Stopping Timers', () => {
    it('Should call the acknowledgement callback with an error if no timer has been created', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('stopTimer', (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })

    it('Should call the acknowledgement callback with a stop time', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        jest.spyOn(eventHandler.timer, 'getElapsedTime').mockImplementation(() => 0)

        clientSocket.emit('stopTimer', (arg) => {
          expect(arg.error).toBeFalsy()
          expect(typeof arg.time).toBe('number')
          done()
        })
      })
    })

    it('Should call the stopTimer function of the associated timer object', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        clientSocket.emit('stopTimer', () => {
          expect(eventHandler.timer.stopTimer).toHaveBeenCalledTimes(1)
          done()
        })
      })
    })
  })

  describe('Joining Timers', () => {
    it('Should call the acknowledgement callback with an error if the provided timer id is of invalid format', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      const expectError = (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
      }

      clientSocket.emit('joinTimer', undefined, expectError)
      clientSocket.emit('joinTimer', null, expectError)
      clientSocket.emit('joinTimer', false, expectError)
      clientSocket.emit('joinTimer', true, expectError)
      clientSocket.emit('joinTimer', 0, expectError)
      clientSocket.emit('joinTimer', 1, expectError)
      clientSocket.emit('joinTimer', jest.fn(), (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })

    it('Should call the acknowledgement callback with an error if the provided timer id is the id of the socket', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('joinTimer', clientSocket.id, (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })

    it('Should call the acknowledgement callback with an error if the provided timer id is already joined', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()
      const timerId = 'timerId'

      clientSocket.emit('joinTimer', timerId)
      clientSocket.emit('joinTimer', timerId, (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })

    it('Should join the SocketIO room with the provided timerId', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()
      const timerId = 'timerId'
      const roomSet = new Set()
      roomSet.add(timerId)
      roomSet.add(clientSocket.id)

      clientSocket.emit('joinTimer', timerId, () => {
        expect(serverSocket.rooms).toEqual(roomSet)
        done()
      })
    })

    it('Should call the acknowledgement callback with an empty response if successful', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('joinTimer', 'timerId', (arg) => {
        expect(arg).toBe(undefined)
        done()
      })
    })
  })

  describe('Leaving Timers', () => {
    it('Should call the acknowledgement callback with an error if the provided timer id is of invalid format', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      const expectError = (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
      }

      clientSocket.emit('leaveTimer', undefined, expectError)
      clientSocket.emit('leaveTimer', null, expectError)
      clientSocket.emit('leaveTimer', false, expectError)
      clientSocket.emit('leaveTimer', true, expectError)
      clientSocket.emit('leaveTimer', 0, expectError)
      clientSocket.emit('leaveTimer', 1, expectError)
      clientSocket.emit('leaveTimer', jest.fn(), (arg) => {
        expect(typeof arg.error).toBe('string')
        expect(arg.error).toBeTruthy()
        done()
      })
    })

    it('Should leave the SocketIO room with the provided timerId', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()
      const timerId = 'timerId'
      const roomSet = new Set()
      roomSet.add(clientSocket.id)

      clientSocket.emit('joinTimer', timerId)
      clientSocket.emit('leaveTimer', timerId, () => {
        expect(serverSocket.rooms).toEqual(roomSet)
        done()
      })
    })

    it('Should call the acknowledgement callback with an empty response if successful', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()
      const timerId = 'timerId'

      clientSocket.emit('joinTimer', timerId)
      clientSocket.emit('leaveTimer', timerId, (arg) => {
        expect(arg).toBe(undefined)
        done()
      })
    })

    it('Should call the acknowledgement callback with an empty response if leaving without first joining a timer', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()
      const timerId = 'timerId'

      clientSocket.emit('leaveTimer', timerId, (arg) => {
        expect(arg).toBe(undefined)
        done()
      })
    })

    it('Should call the acknowledgement callback with an empty response if leaving the same timerId more than once', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()
      const timerId = 'timerId'

      clientSocket.emit('joinTimer', timerId)
      clientSocket.emit('leaveTimer', timerId)
      clientSocket.emit('leaveTimer', timerId, (arg) => {
        expect(arg).toBe(undefined)
        done()
      })
    })

    it('Should call the stopTimer function of the associated timer object if there is one', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      eventHandler.subscribe()

      clientSocket.emit('createTimer', () => {
        jest.spyOn(eventHandler.timer, 'stopTimer')
      })

      clientSocket.emit('leaveTimer', 'timerId', () => {
        expect(eventHandler.timer.stopTimer).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('onTimerTick', () => {
    it('Should emit a timerTick event with an object containing the time passed to it', (done) => {
      const eventHandler = new TimerSocketEventHandler(serverSocket)
      const testTime = 1000

      eventHandler.onTimerTick(testTime)

      clientSocket.on('timerTick', (arg) => {
        expect(arg.time).toBe(testTime)
        done()
      })
    })
  })
})
