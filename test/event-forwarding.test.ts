import { Emitter, TypedEvent } from '#src/index.js'

it('forwards event to another emitter', () => {
  const emitterOne = new Emitter<{ one: TypedEvent<string> }>()
  const emitterTwo = new Emitter<{ one: TypedEvent<string> }>()

  const listener = vi.fn()
  emitterOne.on('one', (event) => {
    emitterTwo.emit(event)
  })
  emitterTwo.on('one', listener)

  const event = new TypedEvent('one', { data: 'hello' })
  expect(emitterOne.emit(event)).toBe(true)
  expect(listener).toHaveBeenCalledOnce(1)
  expect(listener).toHaveBeenCalledWith(event)
})

it('forwards all events via a typeless listener', () => {
  const emitterOne = new Emitter<{
    one: TypedEvent<string>
    two: TypedEvent<number>
  }>()
  const emitterTwo = new Emitter<{
    one: TypedEvent<string>
    two: TypedEvent<number>
  }>()

  const listener = vi.fn()
  emitterOne.on((event) => emitterTwo.emit(event))
  emitterTwo.on(listener)

  const firstEvent = new TypedEvent('one', { data: 'hello' })

  expect(emitterOne.emit(firstEvent)).toBe(true)
  expect(listener).toHaveBeenCalledOnce()
  expect(listener).toHaveBeenCalledWith(firstEvent)

  const secondEvent = new TypedEvent('two', { data: 123 })
  expect(emitterOne.emit(secondEvent)).toBe(true)
  expect(listener).toHaveBeenCalledTimes(2)
  expect(listener).toHaveBeenCalledWith(secondEvent)
})
