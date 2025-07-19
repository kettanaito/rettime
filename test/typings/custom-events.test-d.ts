import { Emitter, StrictEvent } from '../../src'

it('supports custom events', () => {
  class GreetingEvent<D, T extends string = string> extends StrictEvent<D, T> {
    public id: string = 'abc-123'
  }

  const emitter = new Emitter<{
    a: StrictEvent<string>
    greeting: GreetingEvent<number>
  }>()

  emitter.emit(new StrictEvent('a', { data: 'hello' }))

  emitter.emit(new StrictEvent('a', { data: 123 }))
  emitter.emit(new StrictEvent('invalid', { data: 'hello' }))
  emitter.emit(new MessageEvent('a'))

  emitter.emit(new GreetingEvent('greeting', { data: 123 }))
  emitter.emit(new GreetingEvent('greeting', { data: 'invalid' }))
  emitter.emit(new GreetingEvent('greeting'))
  emitter.emit(new GreetingEvent('invalid'))
  emitter.emit(new StrictEvent('greeting', { data: 123 }))
  emitter.emit(new MessageEvent('greeting'))
})

it('infers listener type', () => {
  const emitter = new Emitter<{
    greeting: StrictEvent<string>
  }>()

  emitter.on('greeting', (event) => {
    expectTypeOf(event.type).toEqualTypeOf<'greeting'>()
    expectTypeOf(event.data).toBeString()
  })
})

it('infers listener type of a custom event', () => {
  class GreetingEvent<D, T extends string = string> extends StrictEvent<D, T> {
    public id: string
  }

  const emitter = new Emitter<{
    greeting: GreetingEvent<'john'>
  }>()

  emitter.on('greeting', (event) => {
    expectTypeOf(event.type).toEqualTypeOf<'greeting'>()
    expectTypeOf(event.id).toBeString()
    expectTypeOf(event.data).toEqualTypeOf<'john'>()
  })
})
