import { Emitter, TypedEvent } from '#src/index'

it('returns never for an emitter without any events', () => {
  {
    const emitter = new Emitter()
    expectTypeOf<Emitter.Events<typeof emitter>>().toBeNever()
  }

  {
    const emitter = new Emitter<{}>()
    expectTypeOf<Emitter.Events<typeof emitter>>().toBeNever()
  }
})

it('returns a single TypedEvent for an emitter with a single generic event', () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()
  expectTypeOf<Emitter.Events<typeof emitter>>().toEqualTypeOf<TypedEvent>()
})

it('returns a single TypedEvent for an emitter with many generic events', () => {
  const emitter = new Emitter<{ greeting: TypedEvent; handshake: TypedEvent }>()
  expectTypeOf<Emitter.Events<typeof emitter>>().toEqualTypeOf<TypedEvent>()
})

it('returns a single custom event type for an emitter with a single custom event', () => {
  class GreetingEvent extends TypedEvent {}

  const emitter = new Emitter<{ greeting: GreetingEvent }>()
  expectTypeOf<Emitter.Events<typeof emitter>>().toEqualTypeOf<GreetingEvent>()
})

it('returns a union of all custom event types for an emitter with many custom events', () => {
  class GreetingEvent extends TypedEvent {}
  class HandshakeEvent extends TypedEvent {}

  const emitter = new Emitter<{
    greeting: GreetingEvent
    handshake: HandshakeEvent
  }>()
  expectTypeOf<Emitter.Events<typeof emitter>>().toEqualTypeOf<
    GreetingEvent | HandshakeEvent
  >()
})

it('returns a union of TypedEvent and custom event types for a mixed emitter', () => {
  class GreetingEvent extends TypedEvent {}

  const emitter = new Emitter<{
    greeting: GreetingEvent
    handshake: TypedEvent
  }>()
  expectTypeOf<Emitter.Events<typeof emitter>>().toEqualTypeOf<
    GreetingEvent | TypedEvent
  >()
})
