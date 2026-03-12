import { Emitter, TypedEvent } from '#src/index.js'

it('calls the removeListener hook when a listener is removed via .removeListener()', () => {
  const emitter = new Emitter<{
    hello: TypedEvent
    goodbye: TypedEvent
  }>()

  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  const listener = vi.fn()
  emitter.on('hello', listener)
  emitter.removeListener('hello', listener)

  expect(hook).toHaveBeenCalledExactlyOnceWith('hello', listener, undefined)
})

it('calls the removeListener hook when a once listener is removed after firing', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  const listener = vi.fn()
  emitter.once('hello', listener)
  emitter.emit(new TypedEvent('hello'))

  expect(hook).toHaveBeenCalledExactlyOnceWith('hello', listener, {
    once: true,
  })
})

it('calls the removeListener hook when a listener is removed via signal abort', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  const controller = new AbortController()
  const listener = vi.fn()
  emitter.on('hello', listener, { signal: controller.signal })
  controller.abort()

  expect(hook).toHaveBeenCalledExactlyOnceWith('hello', listener, {
    signal: controller.signal,
  })
})

it('passes listener options to the removeListener hook', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  const controller = new AbortController()
  const listener = vi.fn()
  emitter.on('hello', listener, { once: true, signal: controller.signal })
  emitter.removeListener('hello', listener)

  expect(hook).toHaveBeenCalledWith('hello', listener, {
    once: true,
    signal: controller.signal,
  })
})

it('calls the removeListener hook for every listener removed', () => {
  const emitter = new Emitter<{
    hello: TypedEvent
    goodbye: TypedEvent
  }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  const helloListener = vi.fn()
  const goodbyeListener = vi.fn()
  emitter.on('hello', helloListener)
  emitter.on('goodbye', goodbyeListener)
  emitter.removeListener('hello', helloListener)
  emitter.removeListener('goodbye', goodbyeListener)

  expect(hook).toHaveBeenCalledTimes(2)
  expect(hook).toHaveBeenNthCalledWith(1, 'hello', helloListener, undefined)
  expect(hook).toHaveBeenNthCalledWith(2, 'goodbye', goodbyeListener, undefined)
})

it('calls multiple removeListener hooks', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hookOne = vi.fn()
  const hookTwo = vi.fn()
  emitter.hooks.on('removeListener', hookOne)
  emitter.hooks.on('removeListener', hookTwo)

  const listener = vi.fn()
  emitter.on('hello', listener)
  emitter.removeListener('hello', listener)

  expect(hookOne).toHaveBeenCalledOnce()
  expect(hookTwo).toHaveBeenCalledOnce()
})

it('calls the removeListener hook when a wildcard listener is removed', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  const listener = vi.fn()
  emitter.on('*', listener)
  emitter.removeListener('*', listener)

  expect(hook).toHaveBeenCalledExactlyOnceWith('*', listener, undefined)
})

it('fires the removeListener hook after the listener is removed', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const listenerCounts: Array<number> = []

  emitter.hooks.on('removeListener', () => {
    listenerCounts.push(emitter.listenerCount('hello'))
  })

  const listenerOne = vi.fn()
  const listenerTwo = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  emitter.removeListener('hello', listenerOne)
  emitter.removeListener('hello', listenerTwo)

  // The hook fires after the listener is removed,
  // so the count is 1 when removing the first, 0 when removing the second.
  expect(listenerCounts).toEqual([1, 0])
})

it('removes the removeListener hook via hooks.removeListener()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)
  emitter.hooks.removeListener('removeListener', hook)

  const listener = vi.fn()
  emitter.on('hello', listener)
  emitter.removeListener('hello', listener)

  expect(hook).not.toHaveBeenCalled()
})

it('removes the removeListener hook when the hook signal is aborted', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  const controller = new AbortController()
  emitter.hooks.on('removeListener', hook, { signal: controller.signal })

  const listenerOne = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.removeListener('hello', listenerOne)
  expect(hook).toHaveBeenCalledOnce()

  controller.abort()
  hook.mockClear()

  const listenerTwo = vi.fn()
  emitter.on('hello', listenerTwo)
  emitter.removeListener('hello', listenerTwo)
  expect(hook).not.toHaveBeenCalled()
})

it('removes the removeListener hook via emitter.removeAllListeners()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('removeListener', hook)

  emitter.removeAllListeners()

  const listener = vi.fn()
  emitter.on('hello', listener)
  emitter.removeListener('hello', listener)

  expect(hook).not.toHaveBeenCalled()
})
