import { Emitter, TypedEvent } from '#src/index.js'

it('emits an event', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()

  emitter.emitAsGenerator(new TypedEvent('greeting'))
  emitter.emitAsGenerator(
    // @ts-expect-error Event does not specifiy data type.
    new TypedEvent('greeting', { data: 'hello' }),
  )
})

it('emits an event with custom data type', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()

  emitter.emitAsGenerator(new TypedEvent('greeting', { data: 'hello' }))
  emitter.emitAsGenerator(
    // @ts-expect-error Event is missing data.
    new TypedEvent('greeting'),
  )
})

it('emits a custom event', async () => {
  class GreetingEvent<
    I = void,
    O = void,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent
  }>()

  emitter.emitAsGenerator(new GreetingEvent('greeting'))
  emitter.emitAsGenerator(
    // @ts-expect-error Redundant data.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )
})

it('emits a custom event with a custom data type', async () => {
  class GreetingEvent<
    I extends string,
    O = void,
    T extends string = string,
  > extends TypedEvent<I, O, T> {}

  const emitter = new Emitter<{
    greeting: GreetingEvent<'john'>
  }>()

  emitter.emitAsGenerator(new GreetingEvent('greeting', { data: 'john' }))
  emitter.emitAsGenerator(
    // @ts-expect-error Missing data.
    new GreetingEvent('greeting'),
  )
  emitter.emitAsGenerator(
    // @ts-expect-error Invalid data type.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )
})
