import {
  SafeMessageEvent,
  EventTarget,
  Event,
  MessageEvent,
} from './event-target'

const target = new EventTarget<
  SafeMessageEvent<'incoming', 'hello'>,
  SafeMessageEvent<'outgoing', 'goodbye'>
>()

target.addEventListener('incoming', (event) => {})
target.removeEventListener('incoming', (event) => {})

target.dispatchEvent(new MessageEvent('outgoing', { data: 'goodbye' }))

target.dispatchEvent(new MessageEvent('outgoing', { data: 'goodbye' }))
target.dispatchEvent(new Event('outgoing'))

var bar = new Event('abc')
var foo = new MessageEvent('foo', { data: 'hello' })
