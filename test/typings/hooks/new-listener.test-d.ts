import { Emitter, TypedEvent, HookListenerOptions } from '#src/index.js'

it('has the correct call signature', () => {
  const emitter = new Emitter<{
    greeting: TypedEvent<string>
  }>()

  expectTypeOf(emitter.hooks.on<'newListener'>)
    .parameter(1)
    .toEqualTypeOf<
      (
        type: 'greeting' | '*',
        listener:
          | Emitter.Listener<typeof emitter, 'greeting'>
          | Emitter.Listener<typeof emitter, '*'>,
        options: HookListenerOptions | undefined,
      ) => void
    >()
})
