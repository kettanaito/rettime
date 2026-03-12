import { Emitter, TypedEvent, HookListenerOptions } from '#src/index.js'

it('infers event type and listener for a single event', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.hooks.on('removeListener', (type, listener, options) => {
    expectTypeOf(type).toEqualTypeOf<'greeting' | '*'>()
    expectTypeOf(listener).toEqualTypeOf<
      | Emitter.Listener<typeof emitter, 'greeting'>
      | Emitter.Listener<typeof emitter, '*'>
    >()
    expectTypeOf(options).toEqualTypeOf<HookListenerOptions | undefined>()
  })
})

it('infers event type and listener for multiple events', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
    farewell: TypedEvent<number>
  }>()

  emitter.hooks.on('removeListener', (type, listener, options) => {
    expectTypeOf(type).toEqualTypeOf<'greeting' | 'farewell' | '*'>()
    expectTypeOf(listener).toEqualTypeOf<
      | Emitter.Listener<typeof emitter, 'greeting'>
      | Emitter.Listener<typeof emitter, 'farewell'>
      | Emitter.Listener<typeof emitter, '*'>
    >()
    expectTypeOf(options).toEqualTypeOf<HookListenerOptions | undefined>()
  })
})

it('infers event type and listener for events with return types', () => {
  const emitter = new Emitter<{
    calculate: TypedEvent<number, number>
  }>()

  emitter.hooks.on('removeListener', (type, listener) => {
    expectTypeOf(type).toEqualTypeOf<'calculate' | '*'>()
    expectTypeOf(listener).toEqualTypeOf<
      | Emitter.Listener<typeof emitter, 'calculate'>
      | Emitter.Listener<typeof emitter, '*'>
    >()
  })
})

it('infers event type and listener for custom event classes', () => {
  class GreetingEvent<
    I = void,
    O = void,
    T extends string = string,
  > extends TypedEvent<I, O, T> {
    public id: string
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent<string, number>
  }>()

  emitter.hooks.on('removeListener', (type, listener) => {
    expectTypeOf(type).toEqualTypeOf<'greeting' | '*'>()
    expectTypeOf(listener).toEqualTypeOf<
      | Emitter.Listener<typeof emitter, 'greeting'>
      | Emitter.Listener<typeof emitter, '*'>
    >()
  })
})

it('infers event type and listener for events without data', () => {
  const emitter = new Emitter<{
    ping: TypedEvent
  }>()

  emitter.hooks.on('removeListener', (type, listener) => {
    expectTypeOf(type).toEqualTypeOf<'ping' | '*'>()
    expectTypeOf(listener).toEqualTypeOf<
      | Emitter.Listener<typeof emitter, 'ping'>
      | Emitter.Listener<typeof emitter, '*'>
    >()
  })
})

it('infers the options type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.hooks.on('removeListener', (type, listener, options) => {
    expectTypeOf(options).toEqualTypeOf<HookListenerOptions | undefined>()
  })
})
