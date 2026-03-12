import { Emitter, TypedEvent } from '#src/index.js'

it('calls the hook before an event is emitted', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()

  const beforeEmitHook = vi.fn()
  emitter.hooks.on('beforeEmit', beforeEmitHook)

  const listener = vi.fn()
  emitter.on('hello', listener)

  const event = new TypedEvent('hello')
  emitter.emit(event)

  expect(beforeEmitHook).toHaveBeenCalledExactlyOnceWith(event)
})

it('allows modifying the event before it is emitted', () => {
  class GreetingEvent extends TypedEvent<void, void, 'hello'> {
    public person: string
  }

  const emitter = new Emitter<{ hello: GreetingEvent }>()

  emitter.hooks.on('beforeEmit', (event) => {
    event.person = 'john'
  })

  const listener = vi.fn()
  emitter.on('hello', listener)

  const event = new GreetingEvent('hello')
  emitter.emit(event)

  expect(listener).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      type: 'hello',
      person: 'john',
    }),
  )
})

it('prevents event from being emitted if the hook returns false', () => {
  const emitter = new Emitter<{ hello: TypedEvent; goodbye: TypedEvent }>()

  emitter.hooks.on('beforeEmit', (event) => event.type !== 'hello')

  const helloListener = vi.fn()
  emitter.on('hello', helloListener)

  const goodbyeListener = vi.fn()
  emitter.on('goodbye', goodbyeListener)

  emitter.emit(new TypedEvent('hello'))
  expect(helloListener).not.toHaveBeenCalled()
  expect(goodbyeListener).not.toHaveBeenCalled()

  emitter.emit(new TypedEvent('goodbye'))
  expect(goodbyeListener).toHaveBeenCalledOnce()
  expect(helloListener).not.toHaveBeenCalled()
})
