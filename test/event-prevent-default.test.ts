import { Emitter } from '../src'

it('prevents the default of the event', () => {
  const emitter = new Emitter<{ greet: [string] }>()

  emitter.on('greet', (event) => {
    event.preventDefault()
    expect(event.defaultPrevented).toBe(true)
  })
  emitter.on('greet', (event) => {
    // Preventing the default does NOT stop event propagation.
    // The default behavior is controlled by the consumer.
    expect(event.defaultPrevented).toBe(true)
  })

  emitter.emit('greet', 'world')
  expect.assertions(2)
})
