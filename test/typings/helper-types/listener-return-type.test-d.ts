import { Emitter, StrictEvent } from '#src/index.js'

it('defaults to `unknown` for events without a return type', () => {
  const emitter = new Emitter<{
    a: StrictEvent<string>
  }>()

  expectTypeOf<Emitter.ListenerReturnType<typeof emitter, 'a'>>().toBeUnknown()
})

it('defaults to `unknown` for custom events without a return type', () => {
  class CustomEvent<D, T extends string = string> extends StrictEvent<
    D,
    unknown,
    T
  > {}

  const emitter = new Emitter<{
    a: CustomEvent<string>
  }>()

  expectTypeOf<Emitter.ListenerReturnType<typeof emitter, 'a'>>().toBeUnknown()
})

it('infers listener return type', async () => {
  const emitter = new Emitter<{
    greeting: StrictEvent<string, number>
  }>()

  expectTypeOf<
    Emitter.ListenerReturnType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<number>()
})

it('infers listener return type of a custom event', async () => {
  class GreetingEvent<
    D,
    R = any,
    T extends string = string,
  > extends StrictEvent<D, R, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<string, number>
  }>()

  expectTypeOf<
    Emitter.ListenerReturnType<typeof emitter, 'greeting'>
  >().toEqualTypeOf<number>()
})
