import { Emitter, TypedEvent } from '#src/index.js'

it('infers the event type for a single event', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    expectTypeOf(event).toEqualTypeOf<TypedEvent<string>>()
  })
})

it('infers the event type as a union for multiple events', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
    farewell: TypedEvent<number>
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    expectTypeOf(event).toEqualTypeOf<TypedEvent<string> | TypedEvent<number>>()
  })
})

it('infers the event type for events with return types', () => {
  const emitter = new Emitter<{
    calculate: TypedEvent<number, number>
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    expectTypeOf(event).toEqualTypeOf<TypedEvent<number, number>>()
  })
})

it('infers the event type for custom event classes', () => {
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

  emitter.hooks.on('beforeEmit', (event) => {
    expectTypeOf(event).toEqualTypeOf<GreetingEvent<string, number>>()
  })
})

it('infers the event type for events without data', () => {
  const emitter = new Emitter<{
    ping: TypedEvent
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    expectTypeOf(event).toEqualTypeOf<TypedEvent>()
  })
})

it('allows returning boolean to control emission', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    return false
  })

  emitter.hooks.on('beforeEmit', (event) => {
    return true
  })
})

it('allows returning void', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    // no return
  })
})

it('infers the return type as boolean or void', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.hooks.on('beforeEmit', (event) => {
    expectTypeOf<typeof event>().toEqualTypeOf<TypedEvent<string>>()
    return false as boolean | void
  })
})
