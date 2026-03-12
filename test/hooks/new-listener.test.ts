import { Emitter, TypedEvent } from '#src/index.js'

it('calls the newListener hook when a listener is added via .on()', () => {
  const emitter = new Emitter<{
    hello: TypedEvent
    goodbye: TypedEvent
  }>()

  const newListenerListener = vi.fn()
  emitter.hooks.on('newListener', newListenerListener)

  const listener = vi.fn()
  emitter.on('hello', listener)

  expect(newListenerListener).toHaveBeenCalledExactlyOnceWith(
    'hello',
    listener,
    undefined,
  )
})

it('calls the newListener hook when a listener is added via .once()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  const listener = vi.fn()
  emitter.once('hello', listener)

  expect(hook).toHaveBeenCalledOnce()
  expect(hook).toHaveBeenCalledWith('hello', listener, { once: true })
})

it('calls the newListener hook when a listener is added via .earlyOn()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  const listener = vi.fn()
  emitter.earlyOn('hello', listener)

  expect(hook).toHaveBeenCalledOnce()
  expect(hook).toHaveBeenCalledWith('hello', listener, undefined)
})

it('calls the newListener hook when a listener is added via .earlyOnce()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  const listener = vi.fn()
  emitter.earlyOnce('hello', listener)

  expect(hook).toHaveBeenCalledExactlyOnceWith('hello', listener, {
    once: true,
  })
})

it('calls the newListener hook for every listener added', () => {
  const emitter = new Emitter<{
    hello: TypedEvent
    goodbye: TypedEvent
  }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  const helloListener = vi.fn()
  const goodbyeListener = vi.fn()
  emitter.on('hello', helloListener)
  emitter.on('goodbye', goodbyeListener)

  expect(hook).toHaveBeenCalledTimes(2)
  expect(hook).toHaveBeenNthCalledWith(1, 'hello', helloListener, undefined)
  expect(hook).toHaveBeenNthCalledWith(2, 'goodbye', goodbyeListener, undefined)
})

it('calls multiple newListener hooks', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hookOne = vi.fn()
  const hookTwo = vi.fn()
  emitter.hooks.on('newListener', hookOne)
  emitter.hooks.on('newListener', hookTwo)

  const listener = vi.fn()
  emitter.on('hello', listener)

  expect(hookOne).toHaveBeenCalledOnce()
  expect(hookTwo).toHaveBeenCalledOnce()
})

it('calls the newListener hook when a wildcard listener is added', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  const listener = vi.fn()
  emitter.on('*', listener)

  expect(hook).toHaveBeenCalledExactlyOnceWith('*', listener, undefined)
})

it('fires the newListener hook before the listener is added', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const listenerCounts: Array<number> = []

  emitter.hooks.on('newListener', () => {
    listenerCounts.push(emitter.listenerCount('hello'))
  })

  emitter.on('hello', vi.fn())
  emitter.on('hello', vi.fn())

  // The hook fires before the listener is added,
  // so the count is 0 when adding the first, 1 when adding the second.
  expect(listenerCounts).toEqual([0, 1])
})

it('exposes listener options in the newListener hook', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  const controller = new AbortController()
  const listener = vi.fn()
  emitter.on('hello', listener, { once: true, signal: controller.signal })

  expect(hook).toHaveBeenCalledExactlyOnceWith('hello', listener, {
    once: true,
    signal: controller.signal,
  })
})

it('removes the newListener hook via hooks.removeListener()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)
  emitter.hooks.removeListener('newListener', hook)

  emitter.on('hello', vi.fn())

  expect(hook).not.toHaveBeenCalled()
})

it('removes the newListener hook via emitter.removeAllListeners()', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const hook = vi.fn()
  emitter.hooks.on('newListener', hook)

  emitter.removeAllListeners()
  emitter.on('hello', vi.fn())

  expect(hook).not.toHaveBeenCalled()
})
