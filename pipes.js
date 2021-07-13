const { Transform, PassThrough } = require('stream')
const subscribe = function (cb) {
  this.on('data', cb)
}
const options = { objectMode: true }
class ToSubscribePipe extends PassThrough {
  constructor () {
    super(options)
  }
  subscribe = subscribe
}

class FilterPipe extends Transform {
  constructor ({ condition }) {
    super(options)
    this._condition = condition
  }
  _transform (data, encoding, done) {
    if (this._condition(data)) {
      this.push(data)
    }
    done()
  }
  subscribe = subscribe
}

class DebouncePipe extends Transform {
  constructor ({ timeout }) {
    super(options)
    this._timeout = timeout
    this._timer = null
  }
  _transform (data, encoding, done) {
    console.log(data)
    clearTimeout(this._timer)
    this._timer = setTimeout(() => {
      this.push(data)
    }, this._timeout)
    done()
  }
  subscribe = subscribe
}

class SkipWhilePipe extends Transform {
  constructor ({ condition }) {
    super(options)
    this._condition = condition
    this._isSkiping = true
  }
  _transform (data, encoding, done) {
    if (this._isSkiping) {
      if (this._condition(data)) {
        this._isSkiping = false
        this.push(data)
      }
    } else {
      this.push(data)
    }
    done()
  }
  subscribe = subscribe
}

class IntervalPipe extends Transform {
  constructor ({ timeout }) {
    super(options)
    this._timeout = timeout
    this._values = []
    this._intervalId = null
  }
  _transform (data, encoding, done) {
    this._values.push(data)

    if (!this._intervalId) {
      this._intervalId = setInterval(() => {
        this.push(this._values.shift())
        if (!this._values.length) {
          clearInterval(this._intervalId)
          this._intervalId = null
        }
      }, this._timeout)
    }
    done()
  }
  subscribe = subscribe
}

class ThrottlePipe extends Transform {
  constructor ({ timeout, count }) {
    super(options)
    this._timeout = timeout
    this._count = count
    this._timeoutId = null
    this._isRunning = false
    this._counted = 0
  }
  _transform (data, encoding, done) {
    if (!this._isRunning) {
      this._isRunning = true
      this._timeoutId = setTimeout(() => {
        this._isRunning = false
        this._counted = 0
      }, this._timeout)
    }
    if (this._counted < this._count) {
      this.push(data)
      this._counted++
    }
    done()
  }
  subscribe = subscribe
}

class BufferPipe extends Transform {
  constructor ({ actionStream }) {
    super(options)
    this._data = []
    this._stream = actionStream
    this._stream.on('data', () => {
      this.push(this._data)
      this._data.length = 0
    })
  }
  _transform (data, encoding, done) {
    this._data.push(data)
    done()
  }
  subscribe = subscribe
}

class MulticastPipe extends Transform {
  constructor ({ listeners = [] }) {
    super(options)
    this._listeners = listeners
    this._duplex = new PassThrough(options)
    this._listeners.forEach(listener => {
      this.pipe(listener)
    })
  }
  _transform (data, encoding, done) {
    this.push(data)
    done()
  }
  subscribe = subscribe
}

module.exports = {
  ToSubscribePipe,
  DebouncePipe,
  FilterPipe,
  SkipWhilePipe,
  IntervalPipe,
  ThrottlePipe,
  BufferPipe,
  MulticastPipe
}
