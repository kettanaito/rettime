import { Emitter, StrictEvent } from '../../src'

it('infers event return type', async () => {
  const emitter = new Emitter<{ greeting: StrictEvent }>()

  emitter.emitAsPromise('greeting').then((value) => {
    expectTypeOf(value).toEqualTypeOf<unknown[]>()
  })

  for (const value of emitter.emitAsGenerator('greeting')) {
    expectTypeOf(value).toBeUnknown()
  }
})

it('infers return type of the event with explicit return type', async () => {
  const emitter = new Emitter<{ greeting: StrictEvent<never, string> }>()

  emitter.emitAsPromise('greeting').then((value) => {
    /**
     * @note Emitting an event returns an array of ALL listener results.
     * That is why it's annotated as T[].
     */
    expectTypeOf(value).toEqualTypeOf<string[]>()
  })

  for (const value of emitter.emitAsGenerator('greeting')) {
    /**
     * @note Emitting as generator returns individual return values
     * of listeners as the emitter calls them.
     */
    expectTypeOf(value).toBeString()
  }
})
