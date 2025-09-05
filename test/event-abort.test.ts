import { Emitter, TypedEvent } from '#src/index.js'

it('(on) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const controller = new AbortController()

  emitter.on('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit(new TypedEvent('greeting', { data: 'John' }))

  expect(listener).not.toHaveBeenCalled()
})

it('(once) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const controller = new AbortController()
  emitter.once('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit(new TypedEvent('greeting', { data: 'John' }))

  expect(listener).not.toHaveBeenCalled()
})

it('(earlyOn) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const controller = new AbortController()
  emitter.earlyOn('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit(new TypedEvent('greeting', { data: 'John' }))

  expect(listener).not.toHaveBeenCalled()
})

it('(earlyOnce) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const controller = new AbortController()
  emitter.earlyOnce('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit(new TypedEvent('greeting', { data: 'John' }))

  expect(listener).not.toHaveBeenCalled()
})
