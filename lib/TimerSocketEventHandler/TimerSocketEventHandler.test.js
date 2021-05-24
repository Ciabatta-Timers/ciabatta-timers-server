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
})
