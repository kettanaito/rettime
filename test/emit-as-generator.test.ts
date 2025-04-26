import { Emitter } from '../src'

it('returns empty generator if no matching listeners found', async () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const result = emitter.emitAsGenerator('hello')
  expect(result.next()).toEqual({ done: true, value: undefined })
})

it('returns sequential listener results', async () => {
  const emitter = new Emitter<{ hello: [never, number] }>()
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

  expect(result.next()).toEqual({ done: true, value: undefined })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledTimes(1)
})

it('supports breaking amidst the listener calls', async () => {
  const emitter = new Emitter<{ hello: [never, number] }>()

  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)

  for (const listenerResult of emitter.emitAsGenerator('hello')) {
    if (listenerResult === 1) {
      break
    }
  }

  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})

it('stops calling listeners if immediate propagation is stopped', async () => {
  const emitter = new Emitter<{ hello: [never, number] }>()
  const listenerOne = vi.fn((event) => {
    event.stopImmediatePropagation()
    return 1
  })
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const result = emitter.emitAsGenerator('hello')

  expect(result.next()).toEqual({ done: false, value: 1 })
  expect(result.next()).toEqual({ done: true, value: undefined })
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})

it('stops calling listeners if propagation is stopped', async () => {
  const emitterOne = new Emitter<{ hello: [never, number] }>()
  const emitterTwo = new Emitter<{ hello: [never, number] }>()

  emitterOne.on('hello', () => 1)
  emitterOne.on('hello', () => {
    event.stopPropagation()
    return 2
  })
  emitterTwo.on('hello', () => 3)
  emitterTwo.on('hello', () => 4)

  // Propagation can be prevented only when the event is shared.
  const event = emitterOne.createEvent('hello')
  const resultOne = emitterOne.emitAsGenerator(event)
  const resultTwo = emitterTwo.emitAsGenerator(event)

  expect(resultOne.next()).toEqual({ done: false, value: 1 })
  expect(resultOne.next()).toEqual({ done: false, value: 2 })
  expect(resultOne.next()).toEqual({ done: true, value: undefined })

  expect(resultTwo.next()).toEqual({ done: true, value: undefined })
})
