# Rettime

Type-safe dependency-free EventTarget-inspired event emitter for browser and Node.js.

## Features

- 🎯 **Event-based**. Control event flow: prevent defaults, stop propagation, cancel events. Something your common `Emitter` can't do.
- 🗼 **Emitter-inspired**. Emit event types and data, don't bother with creating `Event` instances. A bit less verbosity than a common `EventTarget`.
- ⛑️ **Type-safe**. Describe the exact event types and payloads accepted by the emitter. Never emit or listen to unknown events.
- 🧰 **Convenience methods** like `.emitAsPromise()` and `.emitAsGenerator()` to build more complex event-driven systems.
- 🐙 **Tiny**. 700B gzipped.

> [!WARNING]
> This library **does not** have performance as the end goal. In fact, since it operates on events and supports event cancellation, it will likely be _slower_ than the emitters that don't do that.

## Motivation

### Why not just `EventTarget`?

The `EventTarget` API is fantastic. It works in the browser and in Node.js, dispatches actual events, supports cancellation, etc. At the same time, it has a number of flaws that prevent me from using it for anything serious:

- Complete lack of type safety. The `type` in `new Event(type)` is not a type argument in `lib.dom.ts`. It's always `string`. It means it's impossible to narrow it down to a literal string type to achieve type safety.
- No concept of `.prependListener()`. There is no way to add a listener to run _first_, before other existing listeners.
- No concept of `.removeAllListeners()`. You have to remove each individual listener by hand. Good if you own the listeners, not so good if you don't.
- No concept of `.listenerCount()` or knowing if a dispatched event had any listeners (the `boolean` returned from `.dispatch()` indicates if the event has been prevented, not whether it had any listeners).
- (Opinionated) Verbose. I prefer `.on()` over `.addEventListener()`. I prefer passing data than constructing `new MessageEvent()` all the time.

### Why not just `Emitter` (in Node.js)?

The `Emitter` API in Node.js is great as well. But...

- Node.js-specific. `Emitter` does not work in the browser.
- Complete lack of type safety.
- No concept of event cancellation. Events emit to all listeners, and there's nothing you can do about it.

## Install

```sh
npm install rettime
```

## API

### `Emitter`

```ts
new Emitter<Events>()
```

The `Events` type argument allows you describe the supported event types, their payload, and the return type of their event listeners.

```ts
// [eventPayloadType, listenerReturnType]
const emitter = new Emitter<{ hello: [string, number] }>()

emitter.on('hello', () => 1) // ✅
emitter.on('hello', () => 'oops') // ❌ string not assignable to type number

emitter.emit('hello', 'John') // ✅
emitter.emit('hello', 123) // ❌ number is not assignable to type string
emitter.emit('hello') // ❌ missing data argument of type string

emitter.emit('unknown') // ❌ "unknown" does not satisfy "hello"
```

#### Describing types

The `Emitter` class requires a type argument that describes the event map. If you do not provide that argument, adding listeners or emitting events will produce a type error as your emitter doesn't have an event map defined.

An event map is an object of the following shape:

```ts
{
  [type: string]: [args: unknown, returnValue?: unknown]
}
```

The `type` is a string indicating the event type (e.g. `greet` or `ping`). The array it accepts has two members: `args` describes the arguments accepted by this event (can also be `never` for events without arguments) and `returnValue` is an optional type for the data returned from the listeners for this event.

Let's say you want to define a `greet` event that expects a name as an argument:

```ts
const emitter = new Emitter<{ greet: [name: string] }>()
emitter.on('greet', (event) => {
  console.log(`Hello, ${event.data}!`)
})
emitter.emit('greet', 'John')
// "Hello, John!"
```

> Notice that you can use labeled array member types for clarity.

Here's another example where we define a `ping` event that has no arguments but returns a timestamp for each ping:

```ts
const emitter = new Emitter<{ ping: [never, number] }>()
emitter.on('ping', () => Date.now())
const results = await emitter.emitAsPromise('ping')
// [1745658424732]
```

### `.on(type, listener[, options])`

Adds an event listener for the given event type.

```ts
const emitter = new Emitter<{ hello: [string] }>()

emitter.on('hello', (event) => {
  // `event` is a `MessageEvent` instance since the `hello` event
  // defined `string` as its data.
  console.log(event.data)
})
```

All methods that add new listeners return an `AbortController` instance bound to that listener. You can use that controller to cancel the event handling, including mid-air:

```ts
const controller = emitter.on('hello', listener)
controller.abort(reason)
```

All methods that add new listeners also accept an optional `options` argument. You can use it to configure event handling behavior. For example, you can provide an existing `AbortController` signal as the `options.signal` value so the attached listener abides by your controller:

```ts
emitter.on('hello', listener, { signal: controller.signal })
```

> Both the public controller of the event and your custom controller are combined using `AbortSignal.any()`.

### `.once(type, listener[, options])`

Adds a one-time event listener for the given event type.

### `.earlyOn(type, listener[, options])`

Prepends a listener for the given event type.

```ts
const emitter = new Emitter<{ hello: [string, number] }>()

emitter.on('hello', () => 1)
emitter.earlyOn('hello', () => 2)

const results = await emitter.emitAsPromise('hello')
// [2, 1]
```

### `.earlyOnce(type, listener[, options])`

Prepends a one-time listener for the given event type.

### `.emit(type[, data])`

Emits the given event with optional data.

```ts
const emitter = new Emitter<{ hello: [string] }>()

emitter.on('hello', (event) => console.log(event.data))

emitter.emit('hello', 'John')
```

All event emission methods also support a typed event instance as an agument. Learn more in the `.createEvent()` section below.

### `.emitAsPromise(type[, data])`

Emits the given event with optional data, and returns a Promise that resolves with the returned data of all matching event listeners, or rejects whenever any of the matching event listeners throws an error.

```ts
const emitter = new Emitter<{ hello: [number, Promise<number>] }>()

emitter.on('hello', async (event) => {
  await sleep(100)
  return event.data + 1
})
emitter.on('hello', async (event) => event.data + 2)

const values = await emitter.emitAsPromise('hello', 1)
// [2, 3]
```

> Unlike `.emit()`, the `.emitAsPromise()` method _awaits asynchronous listeners_.

### `.emitAsGenerator(type[, data])`

Emits the given event with optional data, and returns a generator function that exhausts all matching event listeners. Using a generator gives you granular control over what listeners are called.

```ts
const emitter = new Emitter<{ hello: [string, number] }>()

emitter.on('hello', () => 1)
emitter.on('hello', () => 2)

for (const listenerResult of emitter.emitAsGenerator('hello', 'John')) {
  // Stop event emission if a listener returns a particular value.
  if (listenerResult === 1) {
    break
  }
}
```

### `.listeners([type])`

Returns the list of all event listeners matching the given event type. If no event `type` is provided, returns the list of all existing event listeners.

### `.listenerCount([type])`

Returns the number of the event listeners matching the given event type. If no event `type` is provided, returns the total number of existing listeners.

### `.removeListener(type, listener)`

Removes the event listener for the given event type.

### `.removeAllListeners([type])`

Removes all event listeners for the given event type. If no event `type` is provided, removes all existing event listeners.

### `.createEvent(type[, data])`

Creates a strongly-typed `Event` instance for the given `type`. Optionally, accepts `data` if the event type describes one.

```ts
const emitter = new Emitter<{ greet: [string]; ping: [never] }>()

const greetEvent = emitter.createEvent('greet', 'John')
const pingEvent = emitter.createEvent('ping')
```

> The `.createEvent()` method is primarily meant for creating event instances that are _going to be reused across different emitters_. That is handy if you want to implement `event.stopPropagation()` in your event flow since that requires a single event shared between multiple emitters.

You can pass a typed event to any event emission method of any `Emitter` to be emitted:

```ts
const greetEvent = emitter.createEvent('greet', 'John')

emitter.emit(greetEvent)
await emitter.emitAsPromise(greetEvent)
emitter.emitAsGenerator(greetEvent)
```

## Types

Apart from being strongly-typed from the ground up, the library provides you with a few helper types to annotate your own implementations.

### `ListenerType`

Returns the type of the given event's listener.

```ts
import { Emitter } from 'rettime'

const emitter = new Emitter<{ greeting: [string] }>()
type GreetingListener = Emitter.ListenerType<typeof emitter, 'greeting'>
// (event: MessageEvent<string>) => void
```

> The `ListenerType` helper is in itself type-safe, allowing only known event types as the second argument.

### `ListenerReturnType`

Returns the return type of the given event's listener.

```ts
import { Emitter } from 'rettime'

const emitter = new Emitter<{ getTotalPrice: [Cart, number] }>()
type CartTotal = Emitter.ListenerReturnType<typeof emitter, 'getTotalPrice'>
// number
```

### `EventType`

Returns the `Event` type (or its subtype) representing the given listener.

```ts
import { Emitter } from 'rettime'

const emitter = new Emitter<{ greeting: [string] }>()
type GreetingEvent = Emitter.EventType<typeof emitter, 'greeting'>
// MessageEvent<string>
```
