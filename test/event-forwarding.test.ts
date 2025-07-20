import { Emitter, StrictEvent } from '#src/index.js'

it('forwards event to another emitter', () => {
  const emitterOne = new Emitter<{ one: StrictEvent<string> }>()
  const emitterTwo = new Emitter<{ one: StrictEvent<string> }>()

  const listener = vi.fn()
  emitterOne.on('one', (event) => {
    emitterTwo.emit(event)
  })
  emitterTwo.on('one', listener)

  const event = new StrictEvent('one', { data: 'hello' })
  expect(emitterOne.emit(event)).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(event)
})
