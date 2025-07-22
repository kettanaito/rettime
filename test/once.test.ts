import { Emitter, TypedEvent } from '#src/index.js'

it('calls the one-time listener once', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const listener = vi.fn()
  emitter.once('hello', listener)

  expect(emitter.emit(new TypedEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)

  listener.mockReset()
  expect(emitter.emit(new TypedEvent('hello'))).toBe(false)
  expect(listener).toHaveBeenCalledTimes(0)
})
