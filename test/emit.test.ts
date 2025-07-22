import { Emitter, StrictEvent } from '#src/index.js'

it('emits event without any data', () => {
  const emitter = new Emitter<{ hello: StrictEvent }>()
  const listener = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>()
  emitter.on('hello', listener)

  const event = new StrictEvent('hello')
  const hasListeners = emitter.emit(event)

  expect(hasListeners).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(event)
})

it('emits event with data', () => {
  const emitter = new Emitter<{ hello: StrictEvent<'world'> }>()
  const listener = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>()
  emitter.on('hello', listener)

  const event = new StrictEvent('hello', { data: 'world' as const })
  const hasListeners = emitter.emit(event)

  expect(hasListeners).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(event)
})

it('calls all listeners for the event', () => {
  const emitter = new Emitter<{ hello: StrictEvent }>()
  const listenerOne = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>()
  const listenerTwo = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)

  const event = new StrictEvent('hello')
  const hasListeners = emitter.emit(event)

  expect(hasListeners).toBe(true)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerOne).toHaveBeenCalledWith(event)
  expect(listenerTwo).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledWith(event)
})

it('does not call listeners for non-matching event', () => {
  const emitter = new Emitter<{
    one: StrictEvent
    two: StrictEvent
  }>()
  const listener = vi.fn<Emitter.ListenerType<typeof emitter, 'one'>>()
  emitter.on('one', listener)
  const hasListeners = emitter.emit(new StrictEvent('two'))

  expect(hasListeners).toBe(false)
  expect(listener).not.toHaveBeenCalled()
})

it('removes the one-time listener after it has been called', () => {
  const emitter = new Emitter<{ hello: StrictEvent }>()
  const listener = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>()
  emitter.once('hello', listener)

  const event = new StrictEvent('hello')
  expect(emitter.emit(event)).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(event)
  expect(emitter.listeners('hello')).toEqual([])

  listener.mockReset()
  expect(emitter.emit(event)).toBe(false)
  expect(listener).not.toHaveBeenCalled()
})

it('stops calling listeners if the immediate propagation is stopped', () => {
  const emitter = new Emitter<{ hello: StrictEvent }>()
  const listenerOne = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>(
    (event) => {
      event.stopImmediatePropagation()
    },
  )
  const listenerTwo = vi.fn<Emitter.ListenerType<typeof emitter, 'hello'>>()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)

  expect(emitter.emit(new StrictEvent('hello'))).toBe(true)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})

it('stops calling listeners if the propagation is stopped', async () => {
  const emitterOne = new Emitter<{ greet: StrictEvent<string> }>()
  const emitterTwo = new Emitter<{ greet: StrictEvent<string> }>()

  const listenerOne = vi.fn<Emitter.ListenerType<typeof emitterOne, 'greet'>>()
  const listenerTwo = vi.fn<Emitter.ListenerType<typeof emitterOne, 'greet'>>(
    (event) => event.stopPropagation(),
  )

  emitterOne.on('greet', listenerOne)
  emitterOne.on('greet', listenerTwo)
  emitterTwo.on('greet', listenerOne)
  emitterTwo.on('greet', listenerOne)

  // Propagation can be prevented only when the event is shared.
  const event = new StrictEvent('greet', { data: 'hello' })

  expect(emitterOne.emit(event)).toBe(true)
  expect(emitterTwo.emit(event)).toBe(false)

  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)
})
