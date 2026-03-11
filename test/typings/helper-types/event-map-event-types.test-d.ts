import { EventMap, TypedEvent } from '#src/index'

it('returns never for an empty event map', () => {
  expectTypeOf<EventMap.EventTypes<{}>>().toBeNever()
})

it('returns a single event type for an event map with a single event', () => {
  expectTypeOf<
    EventMap.EventTypes<{ greeting: TypedEvent }>
  >().toEqualTypeOf<'greeting'>()
})

it('returns a union of all event types for an event map with many events', () => {
  expectTypeOf<
    EventMap.EventTypes<{ greeting: TypedEvent; handshake: TypedEvent }>
  >().toEqualTypeOf<'greeting' | 'handshake'>()
})
