import { EventMap, TypedEvent } from '#src/index'

it('returns never for an empty event map', () => {
  expectTypeOf<EventMap.Events<{}>>().toBeNever()
})

it('returns a single TypedEvent for an event map with a single generic event', () => {
  expectTypeOf<
    EventMap.Events<{ greeting: TypedEvent }>
  >().toEqualTypeOf<TypedEvent>()
})

it('returns a single TypedEvent for an event map with many generic events', () => {
  expectTypeOf<
    EventMap.Events<{ greeting: TypedEvent; handshake: TypedEvent }>
  >().toEqualTypeOf<TypedEvent>()
})

it('returns a single custom event type for an event map with a single custom event', () => {
  class GreetingEvent extends TypedEvent {}

  expectTypeOf<
    EventMap.Events<{ greeting: GreetingEvent }>
  >().toEqualTypeOf<GreetingEvent>()
})

it('returns a union of all custom event types for an event map with many custom events', () => {
  class GreetingEvent extends TypedEvent {}
  class HandshakeEvent extends TypedEvent {}

  expectTypeOf<
    EventMap.Events<{ greeting: GreetingEvent; handshake: HandshakeEvent }>
  >().toEqualTypeOf<GreetingEvent | HandshakeEvent>()
})

it('returns a union of TypedEvent and custom event types for a mixed event map', () => {
  class GreetingEvent extends TypedEvent {}

  expectTypeOf<
    EventMap.Events<{ greeting: GreetingEvent; handshake: TypedEvent }>
  >().toEqualTypeOf<GreetingEvent | TypedEvent>()
})
