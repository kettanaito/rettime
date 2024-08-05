# Emitter

Type-safe dependency-free EventTarget-inspired event emitter for browser and Node.js.

## Features

- 🎯 **Event-based**. Control event flow: prevent defaults, stop propagation, cancel events. Something your common `Emitter` can't do.
- 🗼 **Emitter-inspired**. Emit event types and data, don't bother with creating `Event` instances. A bit less verbosity than a common `EventTarget`.
- ⛑️ **Type-safe**. Describe the exact event types and payloads accepted by the emitter. Never emit or listen to unknown events.
- 🧰 **Convenience methods** like `.emitAsPromise()` and `.emitAsGenerator()` to build more complex event-driven systems.
- 🐙 **Tiny**. 700B gzipped.

> [!WARNING]
> This library **does not** have performance as the end goal. In fact, since it operates on events and supports event cancellation, it will likely be slower than other emitters out there.

## API

### `.on(type, listener)`

Adds an event listener for the given event type.

```ts
const emitter = new Emitter<{ hello: string }>()

emitter.on('hello', 'John') // ✅
emitter.on('hello', 123) // ❌ number is not assignable to type string
emitter.on('hello') // ❌ missing data argument of type string
```

### `.once(type, listener)`

Adds a one-time event listener for the given event type.

### `.emit(type[, data])`

Emits the given event with optional data.

```ts
const emitter = new Emitter<{ hello: string }>()

emitter.on('hello', (event) => console.log(event.data))

emitter.emit('hello', 'John')
```

### `.emitAsPromise(type[, data])`

Emits the given event with optional data, and returns a Promise that resolves with the returned data of all matching event listeners, or rejects whenever any of the matching event listeners throws an error.

```ts
const emitter = new Emitter<{ hello: number }>()

emitter.on('hello', async (event) => {
  await sleep(100)
  return event.data + 1
})
emitter.on('hello', async (event) => event.data + 2)

const values = await emitter.emitAsPromise('hello', 1)
// [2, 3]
```

### `.emitAsGenerator(type[, data])`

Emits the given event with optional data, and returns a generator function that exhausts all matching event listeners. Using a generator gives you granular control over what listeners are called.

```ts
const emitter = new Emitter<{ hello: string }>()

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

### `.removeListener(type, listener[, options])`

Removes the event listener for the given event type.

### `.removeAllListeners([type])`

Removes all event listeners for the given event type. If no event `type` is provided, removes all existing event listeners.
