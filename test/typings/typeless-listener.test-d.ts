import { Emitter, TypedEvent } from '#src/index.js'

it('infers the event data type for an event without data', () => {
  const emitter = new Emitter<{
    hello: TypedEvent
  }>()

  emitter
    .on('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<void>()
    })
    .once('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<void>()
    })
    .earlyOn('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<void>()
    })
    .earlyOnce('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<void>()
    })
})

it('infers the event data type for a single event', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<'world'>
  }>()

  emitter
    .on('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<'world'>()
    })
    .once('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<'world'>()
    })
    .earlyOn('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<'world'>()
    })
    .earlyOnce('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello'>()
      expectTypeOf(event.data).toEqualTypeOf<'world'>()
    })
})

it('infers the event data type for multiple events', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<'world'>
    goodbye: TypedEvent<'cosmos'>
    third: TypedEvent
  }>()

  emitter
    .on('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toEqualTypeOf<'world' | 'cosmos' | void>()
    })
    .once('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toEqualTypeOf<'world' | 'cosmos' | void>()
    })
    .earlyOn('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toEqualTypeOf<'world' | 'cosmos' | void>()
    })
    .earlyOnce('*', (event) => {
      expectTypeOf(event.type).toEqualTypeOf<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toEqualTypeOf<'world' | 'cosmos' | void>()
    })
})

it('infers the event data type for custom events', () => {
  class GreetingEvent extends TypedEvent<string> {
    public id: string
  }
  class FarewellEvent extends TypedEvent<number> {
    public timestamp: number
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent
    farewell: FarewellEvent
  }>()

  emitter.on('*', (event) => {
    expectTypeOf(event).toEqualTypeOf<
      | Emitter.Event<typeof emitter, 'greeting'>
      | Emitter.Event<typeof emitter, 'farewell'>
    >()

    expectTypeOf('id' in event && event.id).toEqualTypeOf<string>()
    expectTypeOf(
      'timestamp' in event && event.timestamp,
    ).toEqualTypeOf<number>()
  })
})

it('infers the listener return type for a single event', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<string, number>
  }>()

  emitter
    .on('*', () => 123)
    .once('*', () => 123)
    .earlyOn('*', () => 123)
    .earlyOnce('*', () => 123)
})

it('infers the listener return type for multiple events', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<string, 'world'>
    goodbye: TypedEvent<string, 'cosmos'>
    third: TypedEvent
  }>()

  emitter.on('*', () => {
    return 'sdg'
  })

  emitter
    .on('*', () => 'foo')
    .once('*', () => 'foo')
    .earlyOn('*', () => 'foo')
    .earlyOnce('*', () => 'foo')
})

it('accepts options parameter', () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()
  const controller = new AbortController()

  emitter.on('*', () => {}, { signal: controller.signal })
  emitter.on('*', () => {}, { once: true })
  emitter.once('*', () => {}, { signal: controller.signal })
  emitter.earlyOn('*', () => {}, { signal: controller.signal })
  emitter.earlyOnce('*', () => {}, { signal: controller.signal })
})
