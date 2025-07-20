import { Emitter, StrictEvent } from '#src/index.js'

it('calls the one-time listener once', () => {
  const emitter = new Emitter<{ hello: StrictEvent }>()
  const listener = vi.fn()
  emitter.once('hello', listener)

  expect(emitter.emit(new StrictEvent('hello'))).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)

  listener.mockReset()
  expect(emitter.emit(new StrictEvent('hello'))).toBe(false)
  expect(listener).toHaveBeenCalledTimes(0)
})
