import { EventMap, TypedEvent } from '#src/index'

it('defaults to void for events without data type', () => {
  expectTypeOf<
    EventMap.EventData<{ greeting: TypedEvent }, 'greeting'>
  >().toBeVoid()
})

it('infers event data type', () => {
  expectTypeOf<
    EventMap.EventData<{ greeting: TypedEvent<string> }, 'greeting'>
  >().toEqualTypeOf<string>()
})

it('infers event data type of a custom event', () => {
  class GreetingEvent<
    D,
    R = void,
    T extends string = string,
  > extends TypedEvent<D, R, T> {}

  expectTypeOf<
    EventMap.EventData<{ greeting: GreetingEvent<string> }, 'greeting'>
  >().toEqualTypeOf<string>()
})
