import { Emitter, TypedEvent } from '#src/index'

it('returns never for an emitter without any events', () => {
  {
    const emitter = new Emitter()
    expectTypeOf<Emitter.AllEventTypes<typeof emitter>>().toBeNever()
  }

  {
    const emitter = new Emitter<{}>()
    expectTypeOf<Emitter.AllEventTypes<typeof emitter>>().toEqualTypeOf<'*'>()
  }
})

it('returns a single event type for an emitter with a single event', () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()
  expectTypeOf<Emitter.AllEventTypes<typeof emitter>>().toEqualTypeOf<
    '*' | 'greeting'
  >()
})

it('returns a union of all event types for an emitter with many events', () => {
  const emitter = new Emitter<{ greeting: TypedEvent; handshake: TypedEvent }>()
  expectTypeOf<Emitter.AllEventTypes<typeof emitter>>().toEqualTypeOf<
    '*' | 'greeting' | 'handshake'
  >()
})
