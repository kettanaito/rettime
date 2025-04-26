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
