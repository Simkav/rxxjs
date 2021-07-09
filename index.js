const { EventEmitter } = require('events')
class Observer extends EventEmitter {
  constructor () {
    super()
    this._pipes = []
    this._complete = null
    this._event = null
    this.on('recieve', value => {
      this._pipes.forEach(pipe => {
        pipe.emit('recieved', value)
      })
    })
    this.on('subscribe', () => {
      this.on(this._event, value => {
        this.emit('recieve', value)
      })
    })
  }
}
Observer.prototype.constructor = Observer
Observer.prototype.pipe = function (destination) {
  destination._parent = this
  this._pipes.push(destination)
  return destination
}

Observer.prototype.subscribe = function (event, cb) {
  this.on(event, cb)
  this._complete = false
  return this
}

Observer.prototype.unsubscribe = function () {
  this._complete = true
  this.removeAllListeners()
  this._pipes = null
}

Observer.prototype.event = function (event) {
  this._event = event
  return this
}
