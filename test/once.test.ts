import { Emitter } from '../src'

it('calls the one-time listener once', () => {
  const emitter = new Emitter<{ hello: never }>()
  const listener = vi.fn()
  emitter.once('hello', listener)

  expect(emitter.emit('hello')).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)

  listener.mockReset()
  expect(emitter.emit('hello')).toBe(false)
  expect(listener).toHaveBeenCalledTimes(0)
})
