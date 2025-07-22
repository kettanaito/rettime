import { Emitter, TypedEvent } from '#src/index.js'

it('emits an event', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()

  await emitter.emitAsPromise(new TypedEvent('greeting'))
  await emitter.emitAsPromise(
    // @ts-expect-error Redundant data.
    new TypedEvent('greeting', { data: 'hello' }),
  )
})

it('emits an event with custom data type', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()

  await emitter.emitAsPromise(new TypedEvent('greeting', { data: 'hello' }))
  await emitter.emitAsPromise(
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

  await emitter.emitAsPromise(new GreetingEvent('greeting'))
  await emitter.emitAsPromise(
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

  await emitter.emitAsPromise(new GreetingEvent('greeting', { data: 'john' }))
  await emitter.emitAsPromise(
    // @ts-expect-error Missing data.
    new GreetingEvent('greeting'),
  )
  await emitter.emitAsPromise(
    // @ts-expect-error Invalid data type.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )
})
