import { Emitter } from '../src'

it('stops immediate propagation', async () => {
  const emitter = new Emitter<{ greet: [string, Event] }>()

  emitter.on('greet', (event) => event)
  emitter.on('greet', (event) => {
    event.stopImmediatePropagation()
    return event
  })
  emitter.on('greet', (event) => event)

  const results = await emitter.emitAsPromise('greet', 'hello')
  expect(results).toEqual([expect.any(Event), expect.any(Event)])
})

it('stops propagation between different emitters', async () => {
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
