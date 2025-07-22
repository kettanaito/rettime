import { Emitter, TypedEvent } from '../../src'

it('infers event return type', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()

  emitter.emitAsPromise(new TypedEvent('greeting')).then((value) => {
    expectTypeOf(value).toEqualTypeOf<any[]>()
  })

  for (const value of emitter.emitAsGenerator(new TypedEvent('greeting'))) {
    expectTypeOf(value).toBeAny()
  }
})

it('infers return type of the event with explicit return type', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent<void, string> }>()

  emitter.emitAsPromise(new TypedEvent('greeting')).then((value) => {
    /**
     * @note Emitting an event returns an array of all listener results.
     * That is why it's annotated as T[].
     */
    expectTypeOf(value).toEqualTypeOf<string[]>()
  })

  for (const value of emitter.emitAsGenerator(new TypedEvent('greeting'))) {
    /**
     * @note Emitting as generator returns individual return values
     * of listeners as the emitter calls them.
     */
    expectTypeOf(value).toBeString()
  }
})
