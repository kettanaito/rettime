import { EventMap, TypedEvent } from '#src/index'

it('infers listener type', () => {
  expectTypeOf<
    EventMap.Listener<{ greeting: TypedEvent }, 'greeting'>
  >().toEqualTypeOf<(event: TypedEvent & { type: 'greeting' }) => void>()
})

it('infers listener type with explicit data type', () => {
  expectTypeOf<
    EventMap.Listener<{ greeting: TypedEvent<string> }, 'greeting'>
  >().toEqualTypeOf<(event: TypedEvent<string> & { type: 'greeting' }) => void>()
})

it('infers listener type with explicit return type', () => {
  expectTypeOf<
    EventMap.Listener<{ greeting: TypedEvent<string, number> }, 'greeting'>
  >().toEqualTypeOf<
    (event: TypedEvent<string, number> & { type: 'greeting' }) => number
  >()
})

it('infers listener type of a custom event', () => {
  class GreetingEvent<
    I = unknown,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  expectTypeOf<
    EventMap.Listener<{ greeting: GreetingEvent }, 'greeting'>
  >().toEqualTypeOf<
    (event: GreetingEvent & { type: 'greeting' }) => unknown
  >()
})

it('infers listener type of a custom event with explicit data type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  expectTypeOf<
    EventMap.Listener<{ greeting: GreetingEvent<string> }, 'greeting'>
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

  expectTypeOf<
    EventMap.Listener<{ greeting: GreetingEvent<string, number> }, 'greeting'>
  >().toEqualTypeOf<
    (event: GreetingEvent<string, number> & { type: 'greeting' }) => number
  >()
})
