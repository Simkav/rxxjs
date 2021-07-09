/* 
Реализовать свой класс Observer на основании EventEmitter
Сделать следующие стримы:
Для фильтрации событий https://rxjs.dev/api/operators/filter
Для задержки событий https://rxjs.dev/api/operators/debounceTime
Для интервального распределения событий https://rxjs.dev/api/operators/timeInterval
Для ограничения количества событий https://rxjs.dev/api/operators/throttle
Для пропуска до порогового значения https://rxjs.dev/api/operators/skipWhile
Для буферизации событий https://rxjs.dev/api/operators/buffer
Для передачи события другим потокам https://rxjs.dev/api/operators/connect

const {
  Observer,
  ToSubscribePipe,
  FilterPipe,
  DebouncePipe,
  IntervalPipe,
  ThrottlePipe,
  SkipWhilePipe,
  BufferPipe,
  MulticastPipe,
} = require('./observer');

const observer = new Observer();

const subscription = observer.subscribe('click', () => {}) // подписаться на событие
subscription.unsubscribe(); // отписаться от события

function eventToObserver(eventEmmiter, event) {
  const observer = new Observer();

  eventEmiter.on(event, observer.push)
  
  return
} 


const toSubscribe = new ToSubscribePipe();
const subscription2 = observer.event('click').pipe(toSubscribe).subscribe(() => {}) // подписаться на событие через трубу
subscription2.unsubscribe(); //отписаться от события

const filter = new FilterPipe({condition: (event) => event.a > 10});
const subscription3 = observer.event('click').pipe(filter).subscribe(() => {}) // подписаться на событие через трубу
subscription3.unsubscribe(); //отписаться от события

const debounce = new DebouncePipe({timeout: 300});
const subscription4 = observer.event('click').pipe(filter).pipe(debounce).subscribe(() => {}) // подписаться на событие через трубу
subscription4.unsubscribe(); //отписаться от события

const interval = new IntervalPipe({timeout: 300});
const subscription5 = observer.event('click').pipe(interval).subscribe(() => {}) // подписаться на событие через трубу
subscription5.unsubscribe(); //отписаться от события

const throttle = new ThrottlePipe({timeout: 1000, count: 1});
const subscription6 = throttle.subscribe(() => {});

const skipWhile = new SkipWhilePipe({condition: (event) => event.a < 1});
const subscription7 = skipWhile.subscribe(() => {});

const buffer = new BufferPipe({actionStream: skipWhile});
const subscription8 = buffer.subscribe(() => {});

const multicast = new MulticastPipe({listeners: [throttle, skipWhile, buffer]});
observer.event('click').pipe(multicast)
*/
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
class Pipe extends Observer {
  constructor () {
    super()
    this._func = null
    this._parent = null
    this._cb = null
    this.on('recieved', value => {
      if (this._func(value)) {
        if (this._cb) {
          this._cb(value)
        } else {
          this._pipes.forEach(pipe => {
            pipe.emit('recieved', value)
          })
        }
      }
    })
  }
}

Pipe.prototype.subscribe = function (cb) {
  this._cb = cb
  this._parent.emit('subscribe')
}

Observer.prototype.constructor = Observer

Observer.prototype.pipe = function (destination) {
  this._pipes.push(destination)
  destination._parent = this
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

class FilterPipe extends Pipe {
  constructor (func) {
    super()
    this._func = func
  }
}

const observer = new Observer()

const filter = new FilterPipe(v => v % 2 === 0)
const newFilter = new FilterPipe(v => v % 4 === 0)

observer
  .event('alo')
  .pipe(filter)
  .pipe(newFilter)
  .subscribe(console.log)

for (let i = 0; i < 100; i++) {
  observer.emit('alo', i)
}

// console.log(filter, newFilter)
// console.log(observer)
// console.log(filter)
// console.log(newFilter)

// observer.subscribe('alob', a => {
//   console.log(a)
// })
// observer.pipe({ alo: 'alo' })
// observer.emit('alob', 'asdasdasdadasdas')

// console.log(observer.pipe([1, 2, 3, 4]))

// console.log(observer)
// observer.unsubscribe()
