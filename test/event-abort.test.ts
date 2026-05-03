import { getEventListeners } from 'node:events'
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

it('unsubscribes from the signal once the listener is manually removed', () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const removeHook = vi.fn()
  emitter.hooks.on('removeListener', removeHook)

  const controller = new AbortController()
  const listener = vi.fn()
  emitter.on('greeting', listener, { signal: controller.signal })
  emitter.removeListener('greeting', listener)

  controller.abort()

  // The hook must fire once for the manual remove; the abort
  // must not re-trigger it because the subscription was cleaned up.
  expect(removeHook).toHaveBeenCalledTimes(1)
})

it('unsubscribes from the signal after a once listener has fired', () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const removeHook = vi.fn()
  emitter.hooks.on('removeListener', removeHook)

  const controller = new AbortController()
  const listener = vi.fn()
  emitter.once('greeting', listener, { signal: controller.signal })
  emitter.emit(new TypedEvent('greeting', { data: 'John' }))

  controller.abort()

  expect(removeHook).toHaveBeenCalledTimes(1)
})

it('unsubscribes from the signal when removeAllListeners() is called', () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const removeHook = vi.fn()
  emitter.hooks.on('removeListener', removeHook, { persist: true })

  const controller = new AbortController()
  emitter.on('greeting', vi.fn(), { signal: controller.signal })
  emitter.on('greeting', vi.fn(), { signal: controller.signal })
  emitter.removeAllListeners()

  // The hook fires once per removed listener.
  expect(removeHook).toHaveBeenCalledTimes(2)

  controller.abort()

  // The abort must not re-trigger the hook because the
  // signal subscriptions were cleaned up on removal.
  expect(removeHook).toHaveBeenCalledTimes(2)
})

it('does not register the listener when the signal is already aborted', () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const newHook = vi.fn()
  const removeHook = vi.fn()
  emitter.hooks.on('newListener', newHook)
  emitter.hooks.on('removeListener', removeHook)

  const controller = new AbortController()
  controller.abort()

  const listener = vi.fn()
  emitter.on('greeting', listener, { signal: controller.signal })

  expect(emitter.listenerCount('greeting')).toBe(0)
  expect(newHook).not.toHaveBeenCalled()
  expect(removeHook).not.toHaveBeenCalled()
  expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
})

it('does not register the hook when the hook signal is already aborted', () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const controller = new AbortController()
  controller.abort()

  const hook = vi.fn()
  emitter.hooks.on('beforeEmit', hook, { signal: controller.signal })

  emitter.emit(new TypedEvent('greeting', { data: 'John' }))

  expect(hook).not.toHaveBeenCalled()
  expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
})

it('unsubscribes from the signal when a hook listener is removed', () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
  const controller = new AbortController()
  emitter.hooks.on('beforeEmit', vi.fn(), { signal: controller.signal })
  emitter.hooks.on('beforeEmit', vi.fn(), { signal: controller.signal })
  emitter.removeAllListeners()

  // The signal must hold no abort subscriptions from the emitter
  // after the hooks were removed.
  expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
})
