import { Emitter } from '../emitter'

it('forwards event to another emitter', () => {
  const emitterOne = new Emitter<{ one: string }>()
  const emitterTwo = new Emitter<{ one: string }>()

  const listener = vi.fn()
  emitterOne.on('one', (event) => {
    emitterTwo.emit(event.type, event.data)
  })
  emitterTwo.on('one', listener)

  expect(emitterOne.emit('one', 'hello')).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(
    new MessageEvent('one', { data: 'hello' })
  )
})
