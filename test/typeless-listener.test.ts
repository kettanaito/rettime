import { Emitter, TypedEvent } from '#src/index.js'

describe('on (without type)', () => {
  it('calls the listener for any event type', () => {
    const emitter = new Emitter<{
      hello: TypedEvent
      goodbye: TypedEvent
    }>()
    const listener = vi.fn()
    emitter.on(listener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)

    expect(emitter.emit(new TypedEvent('goodbye'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('calls the listener alongside typed listeners', () => {
    const emitter = new Emitter<{
      hello: TypedEvent
      goodbye: TypedEvent
    }>()
    const allListener = vi.fn()
    const helloListener = vi.fn()
    const goodbyeListener = vi.fn()

    emitter.on(allListener)
    emitter.on('hello', helloListener)
    emitter.on('goodbye', goodbyeListener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(allListener).toHaveBeenCalledTimes(1)
    expect(helloListener).toHaveBeenCalledTimes(1)
    expect(goodbyeListener).not.toHaveBeenCalled()

    expect(emitter.emit(new TypedEvent('goodbye'))).toBe(true)
    expect(allListener).toHaveBeenCalledTimes(2)
    expect(helloListener).toHaveBeenCalledTimes(1)
    expect(goodbyeListener).toHaveBeenCalledTimes(1)
  })

  it('calls multiple all-events listeners', () => {
    const emitter = new Emitter<{
      hello: TypedEvent
      goodbye: TypedEvent
    }>()
    const listenerOne = vi.fn()
    const listenerTwo = vi.fn()

    emitter.on(listenerOne)
    emitter.on(listenerTwo)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listenerOne).toHaveBeenCalledTimes(1)
    expect(listenerTwo).toHaveBeenCalledTimes(1)

    expect(emitter.emit(new TypedEvent('goodbye'))).toBe(true)
    expect(listenerOne).toHaveBeenCalledTimes(2)
    expect(listenerTwo).toHaveBeenCalledTimes(2)
  })

  it('calls typed listeners before all-events listeners', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const allListener = vi.fn()
    const typedListener = vi.fn()

    emitter.on('hello', typedListener)
    emitter.on(allListener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(typedListener).toHaveBeenCalledOnce()
    expect(allListener).toHaveBeenCalledOnce()
    expect(typedListener.mock.invocationCallOrder[0]).toBeLessThan(
      allListener.mock.invocationCallOrder[0],
    )
  })

  it('receives events with data', () => {
    const emitter = new Emitter<{ hello: TypedEvent<string> }>()
    const listener = vi.fn()
    emitter.on(listener)

    const event = new TypedEvent('hello', { data: 'world' })
    expect(emitter.emit(event)).toBe(true)
    expect(listener).toHaveBeenCalledWith(event)
    expect(listener.mock.calls[0][0].data).toBe('world')
  })

  it('supports options parameter', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listener = vi.fn()
    const controller = new AbortController()

    emitter.on(listener, { signal: controller.signal })

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)

    controller.abort()
    listener.mockClear()

    expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('once (without type)', () => {
  it('calls the listener once for any event type', () => {
    const emitter = new Emitter<{
      hello: TypedEvent
      goodbye: TypedEvent
    }>()
    const listener = vi.fn()
    emitter.once(listener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)

    listener.mockReset()
    expect(emitter.emit(new TypedEvent('goodbye'))).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('removes itself after being called once', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listener = vi.fn()
    emitter.once(listener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)

    listener.mockReset()
    expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('works alongside typed listeners', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const allListener = vi.fn()
    const typedListener = vi.fn()

    emitter.once(allListener)
    emitter.on('hello', typedListener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(allListener).toHaveBeenCalledTimes(1)
    expect(typedListener).toHaveBeenCalledTimes(1)

    allListener.mockReset()
    typedListener.mockReset()

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(allListener).not.toHaveBeenCalled()
    expect(typedListener).toHaveBeenCalledTimes(1)
  })

  it('supports options parameter', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listener = vi.fn()
    const controller = new AbortController()

    emitter.once(listener, { signal: controller.signal })

    controller.abort()
    expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('earlyOn (without type)', () => {
  it('prepends an all-events listener', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listenerOne = vi.fn()
    const listenerTwo = vi.fn()

    emitter.on(listenerOne)
    emitter.earlyOn(listenerTwo)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listenerTwo).toHaveBeenCalledOnce()
    expect(listenerOne).toHaveBeenCalledOnce()
    expect(listenerTwo.mock.invocationCallOrder[0]).toBeLessThan(
      listenerOne.mock.invocationCallOrder[0],
    )
  })

  it('prepends the only all-events listener', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listener = vi.fn()
    emitter.earlyOn(listener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('calls early all-events listener after typed listeners', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const allListener = vi.fn()
    const typedListener = vi.fn()

    emitter.on('hello', typedListener)
    emitter.earlyOn(allListener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(allListener).toHaveBeenCalledOnce()
    expect(typedListener).toHaveBeenCalledOnce()
    // Typed listeners are always called before all-events listeners
    expect(typedListener.mock.invocationCallOrder[0]).toBeLessThan(
      allListener.mock.invocationCallOrder[0],
    )
  })

  it('prepends a listener for async emit', async () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listenerOne = vi.fn(() => 1)
    const listenerTwo = vi.fn(() => 2)

    emitter.on(listenerOne)
    emitter.earlyOn(listenerTwo)

    const result = await emitter.emitAsPromise(new TypedEvent('hello'))

    expect(result).toEqual([2, 1])
    expect(listenerTwo).toHaveBeenCalledOnce()
    expect(listenerOne).toHaveBeenCalledOnce()
    expect(listenerTwo.mock.invocationCallOrder[0]).toBeLessThan(
      listenerOne.mock.invocationCallOrder[0],
    )
  })

  it('prepends a listener for generator emit', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listenerOne = vi.fn(() => 1)
    const listenerTwo = vi.fn(() => 2)

    emitter.on(listenerOne)
    emitter.earlyOn(listenerTwo)

    const generator = emitter.emitAsGenerator(new TypedEvent('hello'))

    expect(generator.next()).toEqual({ value: 2, done: false })
    expect(generator.next()).toEqual({ value: 1, done: false })
    expect(generator.next()).toEqual({ value: undefined, done: true })
  })

  it('supports options parameter', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listener = vi.fn()
    const controller = new AbortController()

    emitter.earlyOn(listener, { signal: controller.signal })

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)

    controller.abort()
    listener.mockClear()

    expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('earlyOnce (without type)', () => {
  it('prepends a one-time all-events listener', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listenerOne = vi.fn()
    const listenerTwo = vi.fn()

    emitter.on(listenerOne)
    emitter.earlyOnce(listenerTwo)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listenerTwo).toHaveBeenCalledOnce()
    expect(listenerOne).toHaveBeenCalledOnce()
    expect(listenerTwo.mock.invocationCallOrder[0]).toBeLessThan(
      listenerOne.mock.invocationCallOrder[0],
    )

    listenerOne.mockClear()
    listenerTwo.mockClear()

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(listenerOne).toHaveBeenCalledOnce()
    expect(listenerTwo).not.toHaveBeenCalled()
  })

  it('calls after typed listeners and removes after first call', () => {
    const emitter = new Emitter<{
      hello: TypedEvent
      goodbye: TypedEvent
    }>()
    const allListener = vi.fn()
    const typedListener = vi.fn()

    emitter.on('hello', typedListener)
    emitter.on('goodbye', typedListener)
    emitter.earlyOnce(allListener)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(allListener).toHaveBeenCalledOnce()
    expect(typedListener).toHaveBeenCalledOnce()
    // Typed listeners are always called before all-events listeners
    expect(typedListener.mock.invocationCallOrder[0]).toBeLessThan(
      allListener.mock.invocationCallOrder[0],
    )

    allListener.mockClear()
    typedListener.mockClear()

    expect(emitter.emit(new TypedEvent('goodbye'))).toBe(true)
    expect(allListener).not.toHaveBeenCalled()
    expect(typedListener).toHaveBeenCalledOnce()
  })

  it('supports options parameter', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listener = vi.fn()
    const controller = new AbortController()

    emitter.earlyOnce(listener, { signal: controller.signal })

    controller.abort()
    expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('all-events listeners with event propagation', () => {
  it('stops immediate propagation for all-events listeners', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const typedListener = vi.fn((event) => {
      event.stopImmediatePropagation()
    })
    const allListenerOne = vi.fn()
    const allListenerTwo = vi.fn()

    emitter.on('hello', typedListener)
    emitter.on(allListenerOne)
    emitter.on(allListenerTwo)

    expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
    expect(typedListener).toHaveBeenCalledOnce()
    // All-events listeners come after typed listeners, so they are not called
    expect(allListenerOne).not.toHaveBeenCalled()
    expect(allListenerTwo).not.toHaveBeenCalled()
  })

  it('stops propagation for all-events listeners across emitters', () => {
    const emitterOne = new Emitter<{ hello: TypedEvent }>()
    const emitterTwo = new Emitter<{ hello: TypedEvent }>()
    const listenerOne = vi.fn((event) => {
      event.stopPropagation()
    })
    const listenerTwo = vi.fn()

    emitterOne.on(listenerOne)
    emitterTwo.on(listenerTwo)

    const event = new TypedEvent('hello')

    expect(emitterOne.emit(event)).toBe(true)
    expect(emitterTwo.emit(event)).toBe(false)

    expect(listenerOne).toHaveBeenCalledOnce()
    expect(listenerTwo).not.toHaveBeenCalled()
  })
})

describe('all-events listeners with async emit', () => {
  it('calls all-events listeners in emitAsPromise', async () => {
    const emitter = new Emitter<{
      hello: TypedEvent
      goodbye: TypedEvent
    }>()
    const allListener = vi.fn(() => 'all')
    const typedListener = vi.fn(() => 'typed')

    emitter.on('hello', typedListener)
    emitter.on(allListener)

    const result = await emitter.emitAsPromise(new TypedEvent('hello'))

    expect(result).toEqual(['typed', 'all'])
    expect(allListener).toHaveBeenCalledOnce()
    expect(typedListener).toHaveBeenCalledOnce()
  })

  it('respects immediate propagation stop in emitAsPromise', async () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const listenerOne = vi.fn((event) => {
      event.stopImmediatePropagation()
      return 1
    })
    const listenerTwo = vi.fn(() => 2)

    emitter.on('hello', listenerOne)
    emitter.on(listenerTwo)

    const result = await emitter.emitAsPromise(new TypedEvent('hello'))

    expect(result).toEqual([1])
    expect(listenerOne).toHaveBeenCalledOnce()
    expect(listenerTwo).not.toHaveBeenCalled()
  })
})

describe('all-events listeners with generator emit', () => {
  it('yields results from all-events listeners', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const typedListener = vi.fn(() => 'typed')
    const allListener = vi.fn(() => 'all')

    emitter.on('hello', typedListener)
    emitter.on(allListener)

    const generator = emitter.emitAsGenerator(new TypedEvent('hello'))

    expect(generator.next()).toEqual({ value: 'typed', done: false })
    expect(generator.next()).toEqual({ value: 'all', done: false })
    expect(generator.next()).toEqual({ value: undefined, done: true })
  })

  it('stops yielding on immediate propagation stop', () => {
    const emitter = new Emitter<{ hello: TypedEvent }>()
    const typedListener = vi.fn((event) => {
      event.stopImmediatePropagation()
      return 1
    })
    const allListener = vi.fn(() => 2)

    emitter.on('hello', typedListener)
    emitter.on(allListener)

    const generator = emitter.emitAsGenerator(new TypedEvent('hello'))

    expect(generator.next()).toEqual({ value: 1, done: false })
    expect(generator.next()).toEqual({ value: undefined, done: true })
    // All-events listener comes after typed listener, so it's not called
    expect(allListener).not.toHaveBeenCalled()
  })
})

it('returns a typeless listener when listing all listeners', () => {
  const emitter = new Emitter()
  const listener = vi.fn()
  emitter.on(listener)

  expect(emitter.listeners()).toEqual([listener])
  expect(emitter.listenerCount()).toBe(1)
})

it('returns a typess listener when listing listeners for a certain type', () => {
  const emitter = new Emitter()
  const listener = vi.fn()
  emitter.on(listener)

  /**
   * @note Since typeless listeners match all events, they must be listed
   * when you list any particular event type. The library does not assume
   * whether you've handled "one" in the typeless listener.
   */
  expect(emitter.listeners('one')).toEqual([listener])
  expect(emitter.listenerCount()).toBe(1)
  expect(emitter.listenerCount('one')).toBe(1)
})
