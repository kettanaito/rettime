import { Emitter, TypedEvent } from '#src/index.js'

it('infers event type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    TypedEvent & { type: 'greeting' }
  >()
})

it('infers the type of an event with explicit data type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    TypedEvent<string> & { type: 'greeting' }
  >()
})

it('infers the type of an event with explicit return type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string, number>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    TypedEvent<string, number> & { type: 'greeting' }
  >()
})

it('infers type of a custom event', () => {
  class GreetingEvent<
    I = unknown,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    GreetingEvent & { type: 'greeting' }
  >()
})

it('infers type of a custom event with explicit data type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<string>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    GreetingEvent<string> & { type: 'greeting' }
  >()
})

it('infers type of a custom event with explicit return type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<string, number>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    GreetingEvent<string, number> & { type: 'greeting' }
  >()
})
