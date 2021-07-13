const { EventEmitter } = require('events')
const { Readable } = require('stream')
class Observer extends EventEmitter {
  constructor () {
    super()
    this._stream = new Readable({ objectMode: true, read () {} })
    this._piped = this._stream
  }
}
Observer.prototype.constructor = Observer
Observer.prototype.subscribe = function (...args) {
  args.length === 1
    ? this._piped.on('data', args[0])
    : this.on(args[0], args[1])
  return this
}
Observer.prototype.event = function (event) {
  const obs = new Observer()
  this.on(event, data => obs._stream.push(data))
  return obs
}
Observer.prototype.pipe = function (dest) {
  this._piped = this._piped.pipe(dest)
  return this
}
Observer.prototype.unsubscribe = function () {
  this._stream.destroy()
  this.removeAllListeners()
  console.log('STREAM DESTROYED, ALO KONEC')
}

module.exports = Observer
