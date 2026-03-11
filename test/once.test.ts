import { Emitter, TypedEvent } from '#src/index.js'

it('calls the one-time listener once', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const listener = vi.fn()
  emitter.once('hello', listener)

  expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledOnce()

  listener.mockReset()
  expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
  expect(listener).toHaveBeenCalledTimes(0)
})

it('supports the same once listener on multiple emitters', () => {
  const emitterOne = new Emitter<{ hello: TypedEvent }>()
  const emitterTwo = new Emitter<{ hello: TypedEvent }>()

  const listener = vi.fn()
  emitterOne.once('hello', listener)
  emitterTwo.once('hello', listener)

  expect(emitterOne.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledOnce()

  expect(emitterTwo.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledTimes(2)
})

it('does not treat a shared listener as once when added via .on() on another emitter', () => {
  const emitterOne = new Emitter<{ hello: TypedEvent }>()
  const emitterTwo = new Emitter<{ hello: TypedEvent }>()

  const listener = vi.fn()
  emitterOne.once('hello', listener)
  emitterTwo.on('hello', listener)

  // Calls the listener once for the ".once()" usage.
  expect(emitterOne.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledOnce()

  expect(emitterOne.emit(new TypedEvent('hello'))).toBe(false)
  expect(listener).toHaveBeenCalledOnce()

  listener.mockReset()

  // Calls the same listener multiple times for the ".on()" usage.
  expect(emitterTwo.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledOnce()

  expect(emitterTwo.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledTimes(2)
})
