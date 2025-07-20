import { Emitter, StrictEvent } from '#src/index.js'

it('infers event type', () => {
  const emitter = new Emitter<{
    greeting: StrictEvent
  }>()

  emitter.on('greeting', (event) => {
    expectTypeOf<typeof event>().toEqualTypeOf<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toEqualTypeOf<'greeting'>()
    expectTypeOf(event.data).toBeVoid()
  })
})

it('infers event type with a custom data type', () => {
  const emitter = new Emitter<{
    greeting: StrictEvent<string>
  }>()

  emitter.on('greeting', (event) => {
    expectTypeOf<typeof event>().toEqualTypeOf<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toEqualTypeOf<'greeting'>()
    expectTypeOf(event.data).toBeString()
  })
})

it('infers custom event type', () => {
  class GreetingEvent<
    I = void,
    O = void,
    T extends string = string,
  > extends StrictEvent<I, O, T> {
    public id: string
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent
  }>()

  emitter.on('greeting', (event) => {
    expectTypeOf<typeof event>().toEqualTypeOf<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toEqualTypeOf<'greeting'>()
    expectTypeOf(event.data).toBeVoid()
    expectTypeOf(event.id).toBeString()
  })
})

it('infers custom event type with a custom data type', () => {
  class GreetingEvent<
    I extends string,
    O = void,
    T extends string = string,
  > extends StrictEvent<I, O, T> {
    public id: string
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent<'john'>
  }>()

  emitter.on('greeting', (event) => {
    expectTypeOf<typeof event>().toEqualTypeOf<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toEqualTypeOf<'greeting'>()
    expectTypeOf(event.data).toEqualTypeOf<'john'>()
    expectTypeOf(event.id).toBeString()
  })
})
