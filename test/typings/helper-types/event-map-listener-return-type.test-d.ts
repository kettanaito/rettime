import { EventMap, TypedEvent } from '#src/index'

it('defaults to void for events without a return type', () => {
  expectTypeOf<
    EventMap.ListenerReturnType<{ a: TypedEvent<string> }, 'a'>
  >().toBeVoid()
})

it('defaults to unknown for custom events without a return type', () => {
  class CustomEvent<D, T extends string = string> extends TypedEvent<
    D,
    unknown,
    T
  > {}

  expectTypeOf<
    EventMap.ListenerReturnType<{ a: CustomEvent<string> }, 'a'>
  >().toBeUnknown()
})

it('infers listener return type', () => {
  expectTypeOf<
    EventMap.ListenerReturnType<{ greeting: TypedEvent<string, number> }, 'greeting'>
  >().toEqualTypeOf<number>()
})

it('infers listener return type of a custom event', () => {
  class GreetingEvent<D, R = any, T extends string = string> extends TypedEvent<
    D,
    R,
    T
  > {}

  expectTypeOf<
    EventMap.ListenerReturnType<{ greeting: GreetingEvent<string, number> }, 'greeting'>
  >().toEqualTypeOf<number>()
})
