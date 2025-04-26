import { Emitter } from '../src'

it('resolves with empty array if no matching listeners found', async () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const promise = emitter.emitAsPromise('hello')
  await expect(promise).resolves.toEqual([])
})

it('resolves with sequential listener results', async () => {
  const emitter = new Emitter<{ hello: [never, number] }>()
  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const promise = emitter.emitAsPromise('hello')

  await expect(promise).resolves.toEqual([1, 2])
})

it('rejects if one of the listeners throws', async () => {
  const emitter = new Emitter<{ hello: [never, number] }>()
  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => {
    throw new Error('Oops')
  })
  const listenerThree = vi.fn(() => 3)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  emitter.on('hello', listenerThree)
  const promise = emitter.emitAsPromise('hello')

  await expect(promise).rejects.toThrow(new Error('Oops'))
  expect(listenerThree).not.toHaveBeenCalled()
})

it('stops calling listeners if immediate propagation is stopped', async () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const listenerOne = vi.fn((event: Event) => event.stopImmediatePropagation())
  const listenerTwo = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const promise = emitter.emitAsPromise('hello')

  await expect(promise).resolves.toEqual([undefined])
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})

it('stops calling listeners if propagation is stopped', async () => {
  const emitterOne = new Emitter<{ greet: [string, Event] }>()
  const emitterTwo = new Emitter<{ greet: [string, Event] }>()

  emitterOne.on('greet', (event) => event)
  emitterOne.on('greet', (event) => {
    event.stopPropagation()
    return event
  })
  emitterTwo.on('greet', (event) => event)
  emitterTwo.on('greet', (event) => event)

  // Propagation can be prevented only when the event is shared.
  const event = emitterOne.createEvent('greet', 'hello')

  await expect(emitterOne.emitAsPromise(event)).resolves.toEqual([
    expect.any(Event),
    expect.any(Event),
  ])
  await expect(emitterTwo.emitAsPromise(event)).resolves.toEqual([])
})
