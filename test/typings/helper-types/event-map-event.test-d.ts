import { EventMap, TypedEvent } from '#src/index'

it('infers event type', () => {
  expectTypeOf<
    EventMap.Event<{ greeting: TypedEvent }, 'greeting'>
  >().toEqualTypeOf<TypedEvent & { type: 'greeting' }>()
})

it('infers the type of an event with explicit data type', () => {
  expectTypeOf<
    EventMap.Event<{ greeting: TypedEvent<string> }, 'greeting'>
  >().toEqualTypeOf<TypedEvent<string> & { type: 'greeting' }>()
})

it('infers the type of an event with explicit return type', () => {
  expectTypeOf<
    EventMap.Event<{ greeting: TypedEvent<string, number> }, 'greeting'>
  >().toEqualTypeOf<TypedEvent<string, number> & { type: 'greeting' }>()
})

it('infers type of a custom event', () => {
  class GreetingEvent<
    I = unknown,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  expectTypeOf<
    EventMap.Event<{ greeting: GreetingEvent }, 'greeting'>
  >().toEqualTypeOf<GreetingEvent & { type: 'greeting' }>()
})

it('infers type of a custom event with explicit data type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  expectTypeOf<
    EventMap.Event<{ greeting: GreetingEvent<string> }, 'greeting'>
  >().toEqualTypeOf<GreetingEvent<string> & { type: 'greeting' }>()
})

it('infers type of a custom event with explicit return type', () => {
  class GreetingEvent<
    I,
    O = unknown,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  expectTypeOf<
    EventMap.Event<{ greeting: GreetingEvent<string, number> }, 'greeting'>
  >().toEqualTypeOf<GreetingEvent<string, number> & { type: 'greeting' }>()
})
