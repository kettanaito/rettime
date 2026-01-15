import { Emitter, TypedEvent } from '#src/index.js'

it('infers event type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent
  }>()

  emitter.once('greeting', (event) => {
    expectTypeOf<typeof event>().toExtend<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toExtend<'greeting'>()
    expectTypeOf(event.data).toBeVoid()
  })
})

it('infers event type with a custom data type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  emitter.once('greeting', (event) => {
    expectTypeOf<typeof event>().toExtend<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toExtend<'greeting'>()
    expectTypeOf(event.data).toBeString()
  })
})

it('infers custom event type', () => {
  class GreetingEvent<
    I = void,
    O = void,
    T extends string = string,
  > extends TypedEvent<I, O, T> {
    public id: string
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent
  }>()

  emitter.once('greeting', (event) => {
    expectTypeOf<typeof event>().toExtend<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toExtend<'greeting'>()
    expectTypeOf(event.data).toBeVoid()
    expectTypeOf(event.id).toBeString()
  })
})

it('infers custom event type with a custom data type', () => {
  class GreetingEvent<
    I extends string,
    O = void,
    T extends string = string,
  > extends TypedEvent<I, O, T> {
    public id: string
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent<'john'>
  }>()

  emitter.once('greeting', (event) => {
    expectTypeOf<typeof event>().toExtend<
      Emitter.EventType<typeof emitter, 'greeting'>
    >()
    expectTypeOf(event.type).toExtend<'greeting'>()
    expectTypeOf(event.data).toExtend<'john'>()
    expectTypeOf(event.id).toBeString()
  })
})

it('returns the emitter reference', () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()
  const returnValue = emitter.once('greeting', () => void 0)

  expectTypeOf(returnValue).toExtend<typeof emitter>()
})
