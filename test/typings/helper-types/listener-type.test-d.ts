import { Emitter, TypedEvent } from '#src/index.js'

it('infers listener type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent
  }>()

  expectTypeOf<
    Emitter.ListenerType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<(event: TypedEvent & { type: 'greeting' }) => any>()
})

it('infers listener type with explicit data type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  expectTypeOf<
    Emitter.ListenerType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<(event: TypedEvent<string> & { type: 'greeting' }) => any>()
})

it('infers listener type with explicit return type', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string, number>
  }>()

  expectTypeOf<
    Emitter.ListenerType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<
    (event: TypedEvent<string, number> & { type: 'greeting' }) => number
  >()
})

//
//

it('infers listener type of a custom event', () => {
  class GreetingEvent<
    I = unknown,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent
  }>()

  expectTypeOf<
    Emitter.ListenerType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<(event: GreetingEvent & { type: 'greeting' }) => unknown>()
})

it('infers listener type of a custom event with explicit data type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<string>
  }>()

  expectTypeOf<
    Emitter.ListenerType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<
    (event: GreetingEvent<string> & { type: 'greeting' }) => unknown
  >()
})

it('infers listener type of a custom event with explicit return type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<string, number>
  }>()

  expectTypeOf<
    Emitter.ListenerType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<
    (event: GreetingEvent<string, number> & { type: 'greeting' }) => number
  >()
})
