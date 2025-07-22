import { Emitter, TypedEvent } from '#src/index.js'

it('emits an event', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent }>()

  emitter.emit(new TypedEvent('greeting'))
  emitter.emit(
    // @ts-expect-error Redundant data.
    new TypedEvent('greeting', { data: 'hello' }),
  )

  await emitter.emitAsPromise(new TypedEvent('greeting'))
  await emitter.emitAsPromise(
    // @ts-expect-error Redundant data.
    new TypedEvent('greeting', { data: 'hello' }),
  )

  emitter.emitAsGenerator(new TypedEvent('greeting'))
  emitter.emitAsGenerator(
    // @ts-expect-error Event does not specifiy data type.
    new TypedEvent('greeting', { data: 'hello' }),
  )
})

it('emits an event with custom data type', async () => {
  const emitter = new Emitter<{ greeting: TypedEvent<string> }>()

  emitter.emit(new TypedEvent('greeting', { data: 'hello' }))
  // @ts-expect-error Missing data.
  emitter.emit(new TypedEvent('greeting'))
  emitter.emit(
    // @ts-expect-error Invalid data type.
    new TypedEvent('greeting', { data: 123 }),
  )

  await emitter.emitAsPromise(new TypedEvent('greeting', { data: 'hello' }))
  await emitter.emitAsPromise(
    // @ts-expect-error Event is missing data.
    new TypedEvent('greeting'),
  )

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

  emitter.emit(new GreetingEvent('greeting'))
  emitter.emit(
    // @ts-expect-error Redundant data.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )

  await emitter.emitAsPromise(new GreetingEvent('greeting'))
  await emitter.emitAsPromise(
    // @ts-expect-error Redundant data.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )

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

  emitter.emit(new GreetingEvent('greeting', { data: 'john' }))
  emitter.emit(
    // @ts-expect-error Missing data.
    new GreetingEvent('greeting'),
  )
  emitter.emit(
    // @ts-expect-error Invalid data type.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )

  await emitter.emitAsPromise(new GreetingEvent('greeting', { data: 'john' }))
  await emitter.emitAsPromise(
    // @ts-expect-error Missing data.
    new GreetingEvent('greeting'),
  )
  await emitter.emitAsPromise(
    // @ts-expect-error Invalid data type.
    new GreetingEvent('greeting', { data: 'redundant' }),
  )

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
