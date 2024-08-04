import { Emitter } from '../emitter'

it('returns empty generator if no matching listeners found', async () => {
  const emitter = new Emitter<{ hello: never }>()
  const result = emitter.emitAsGenerator('hello')
  expect(result.next()).toEqual({ done: true, value: undefined })
})

it('returns sequential listener results', async () => {
  const emitter = new Emitter<{ hello: never }>()
  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const result = emitter.emitAsGenerator('hello')

  expect(result.next()).toEqual({ done: false, value: 1 })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()

  expect(result.next()).toEqual({ done: false, value: 2 })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)

  expect(result.next()).toEqual({ done: true, value: undefined })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)
})
