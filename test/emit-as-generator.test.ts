import { Emitter } from '../src'

it('returns empty generator if no matching listeners found', async () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const result = emitter.emitAsGenerator('hello')
  expect(await result.next()).toEqual({ done: true, value: undefined })
})

it('returns sequential listener results', async () => {
  const emitter = new Emitter<{ hello: [never, number] }>()
  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const result = emitter.emitAsGenerator('hello')

  expect(await result.next()).toEqual({ done: false, value: 1 })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()

  expect(await result.next()).toEqual({ done: false, value: 2 })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)

  expect(await result.next()).toEqual({ done: true, value: undefined })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)
})

it('supports async generators as listeners', async () => {
  const emitter = new Emitter<{ hello: [never, Promise<number>] }>()
  const listenerOne = vi.fn(async () => 1)
  const listenerTwo = vi.fn(async () => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const result = emitter.emitAsGenerator('hello')

  await expect(result.next().value).resolves.toBe(1)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()

  await expect(result.next().value).resolves.toBe(2)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)

  await expect(result.next()).toEqual({ done: true, value: undefined })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)
})

it('supports breaking amidst the listener calls', async () => {
  const emitter = new Emitter<{ hello: [string, number] }>()

  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)

  for (const listenerResult of emitter.emitAsGenerator('hello', 'John')) {
    if (listenerResult === 1) {
      break
    }
  }

  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})
