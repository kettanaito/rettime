import { Emitter, TypedEvent } from '#src/index.js'

it('prepends a one-time listener for the event', () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const listenerOne = vi.fn(function one() {})
  const listenerTwo = vi.fn(function two() {})

  emitter.on('hello', listenerOne)
  emitter.earlyOnce('hello', listenerTwo)

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
