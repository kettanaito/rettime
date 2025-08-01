import { Emitter, TypedEvent } from '#src/index.js'

it('resolves with empty array if no matching listeners found', async () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const promise = emitter.emitAsPromise(new TypedEvent('hello'))
  await expect(promise).resolves.toEqual([])
})

it('resolves with sequential listener results', async () => {
  const emitter = new Emitter<{ hello: TypedEvent<void, number> }>()
  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => 2)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const promise = emitter.emitAsPromise(new TypedEvent('hello'))

  await expect(promise).resolves.toEqual([1, 2])
})

it('rejects if one of the listeners throws', async () => {
  const emitter = new Emitter<{ hello: TypedEvent<void, number> }>()
  const listenerOne = vi.fn(() => 1)
  const listenerTwo = vi.fn(() => {
    throw new Error('Oops')
  })
  const listenerThree = vi.fn(() => 3)
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  emitter.on('hello', listenerThree)
  const promise = emitter.emitAsPromise(new TypedEvent('hello'))

  await expect(promise).rejects.toThrow(new Error('Oops'))
  expect(listenerThree).not.toHaveBeenCalled()
})

it('stops calling listeners if immediate propagation is stopped', async () => {
  const emitter = new Emitter<{ hello: TypedEvent }>()
  const listenerOne = vi.fn((event: Event) => event.stopImmediatePropagation())
  const listenerTwo = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const promise = emitter.emitAsPromise(new TypedEvent('hello'))

  await expect(promise).resolves.toEqual([undefined])
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})

it('stops calling listeners if propagation is stopped', async () => {
  const emitterOne = new Emitter<{ greet: TypedEvent<string, Event> }>()
  const emitterTwo = new Emitter<{ greet: TypedEvent<string, Event> }>()

  emitterOne.on('greet', (event) => event)
  emitterOne.on('greet', (event) => {
    event.stopPropagation()
    return event
  })
  emitterTwo.on('greet', (event) => event)
  emitterTwo.on('greet', (event) => event)

  // Propagation can be prevented only when the event is shared.
  const event = new TypedEvent('greet', { data: 'hello' })

  await expect(emitterOne.emitAsPromise(event)).resolves.toEqual([
    expect.any(Event),
    expect.any(Event),
  ])
  await expect(emitterTwo.emitAsPromise(event)).resolves.toEqual([])
})
