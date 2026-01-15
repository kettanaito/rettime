import { Emitter, TypedEvent } from '#src/index.js'

it('infers the event data type for an event without data', () => {
  const emitter = new Emitter<{
    hello: TypedEvent
  }>()

  emitter
    .on('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<void>()
    })
    .once('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<void>()
    })
    .earlyOn('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<void>()
    })
    .earlyOnce('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<void>()
    })
})

it('infers the event data type for a single event', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<'world'>
  }>()

  emitter
    .on('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<'world'>()
    })
    .once('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<'world'>()
    })
    .earlyOn('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<'world'>()
    })
    .earlyOnce('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello'>()
      expectTypeOf(event.data).toExtend<'world'>()
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
      expectTypeOf(event.type).toExtend<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toExtend<'world' | 'cosmos' | void>()
    })
    .once('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toExtend<'world' | 'cosmos' | void>()
    })
    .earlyOn('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toExtend<'world' | 'cosmos' | void>()
    })
    .earlyOnce('*', (event) => {
      expectTypeOf(event.type).toExtend<'hello' | 'goodbye' | 'third'>()
      expectTypeOf(event.data).toExtend<'world' | 'cosmos' | void>()
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
    expectTypeOf(event).toExtend<GreetingEvent | FarewellEvent>()

    expectTypeOf('id' in event && event.id).toExtend<string>()
    expectTypeOf('timestamp' in event && event.timestamp).toExtend<number>()
  })
})

it('infers the listener return type for a single event', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<string, number>
  }>()

  expectTypeOf(emitter.on).parameter(0).returns.toExtend<number>()
  expectTypeOf(emitter.once).parameter(0).returns.toExtend<number>()
  expectTypeOf(emitter.earlyOn).parameter(0).returns.toExtend<number>()
  expectTypeOf(emitter.earlyOnce).parameter(0).returns.toExtend<number>()

  emitter
    .on(
      '*',
      // @ts-expect-error string is not assignable to type number
      () => 'invalid',
    )
    .on('*', () => 123)
})

it('infers the listener return type for multiple events', () => {
  const emitter = new Emitter<{
    hello: TypedEvent<string, 'world'>
    goodbye: TypedEvent<string, 'cosmos'>
    third: TypedEvent
  }>()

  emitter
    .on('*', (event) => {
      if (event.type === 'hello') {
        return 'world'
      }

      if (event.type === 'goodbye') {
        return 'cosmos'
      }
    })
    /**
     * @note TypeScript doesn't support creating a discriminated union
     * to infer return type from the `event.type` type.
     */
    .on('*', (event) => {
      if (event.type === 'hello') {
        return 'cosmos'
      }

      if (event.type === 'goodbye') {
        return 'cosmos'
      }
    })
    .on(
      '*',
      // @ts-expect-error invalid return type
      (event) => {
        if (event.type === 'hello') {
          return 'wrong'
        }

        if (event.type === 'goodbye') {
          return 'also-wrong'
        }
      },
    )
    .on('*', () => {})

  expectTypeOf(emitter.on)
    .parameter(0)
    .returns.toExtend<'world' | 'cosmos' | void>()
  expectTypeOf(emitter.once)
    .parameter(0)
    .returns.toExtend<'world' | 'cosmos' | void>()
  expectTypeOf(emitter.earlyOn)
    .parameter(0)
    .returns.toExtend<'world' | 'cosmos' | void>()
  expectTypeOf(emitter.earlyOnce)
    .parameter(0)
    .returns.toExtend<'world' | 'cosmos' | void>()
})

it('accepts options parameter', () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()
  const controller = new AbortController()

  emitter.on('*', () => void 0, { signal: controller.signal })
  emitter.on('*', () => void 0, { once: true })
  emitter.once('*', () => void 0, { signal: controller.signal })
  emitter.earlyOn('*', () => void 0, { signal: controller.signal })
  emitter.earlyOnce('*', () => void 0, { signal: controller.signal })
})
