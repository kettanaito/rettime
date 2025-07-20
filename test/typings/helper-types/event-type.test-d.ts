import { Emitter, StrictEvent } from '#src/index.js'

it('infers event type', () => {
  const emitter = new Emitter<{
    greeting: StrictEvent
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    StrictEvent & { type: 'greeting' }
  >()
})

it('infers the type of an event with explicit data type', () => {
  const emitter = new Emitter<{
    greeting: StrictEvent<string>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    StrictEvent<string> & { type: 'greeting' }
  >()
})

it('infers the type of an event with explicit return type', () => {
  const emitter = new Emitter<{
    greeting: StrictEvent<string, number>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    StrictEvent<string, number> & { type: 'greeting' }
  >()
})

it('infers type of a custom event', () => {
  class GreetingEvent<
    I = unknown,
    O = unknown,
    T extends string = string,
  > extends StrictEvent<I, O, T> {}

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
  > extends StrictEvent<I, O, T> {}

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
  > extends StrictEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<string, number>
  }>()

  expectTypeOf<Emitter.EventType<typeof emitter, 'greeting'>>().toEqualTypeOf<
    GreetingEvent<string, number> & { type: 'greeting' }
  >()
})
