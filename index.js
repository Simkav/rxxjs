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

function eventToObserver(event) {
  const observer = new Observer();

  this.on(event, observer.push)
  
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
const {
  ToSubscribePipe,
  DebouncePipe,
  FilterPipe,
  SkipWhilePipe
} = require('./pipes.js')
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
const a = new Observer()

const filter = new FilterPipe({
  condition: v => v % 2 === 0
})
const skipWhile = new SkipWhilePipe({
  condition: data => data >= 5
})

// const filter = new FilterPipe({ condition: event => event.a > 10 })
const subscription3 = a
  .event('abc')
  .pipe(filter)
  .subscribe(data => {
    console.log(data)
  }) // подписаться на событие через трубу

for (let i = 0; i < 10; i++) {
  a.emit('abc', i)
}
const filter1 = new FilterPipe({
  condition: v => v % 2 === 0
})

const subscription4 = a
  .event('abc')
  .pipe(filter1)
  .subscribe(data => {
    console.log(data)
  })

setTimeout(() => {
  subscription3.unsubscribe()
  console.log('new array')
  for (let i = 0; i < 10; i++) {
    a.emit('abc', i)
  }
}, 100)

// a.event('abc')
//   .pipe(skipWhile)
//   .pipe(filter)
//   .subscribe(data => console.log(data))

// a.unsubscribe()

module.exports = Observer
