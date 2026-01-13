import { Emitter, TypedEvent } from '#src/index.js'

it('supports a union of event maps', () => {
  const emitter = new Emitter<
    { a: TypedEvent<string> } | { b: TypedEvent<number> }
  >()

  emitter
    .on('a', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<string>>()
      expectTypeOf(event.type).toExtend<'a'>()
    })
    .on('b', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'b'>()
    })
    .on((event) => {
      expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'a' | 'b'>()
    })

  emitter
    .once('a', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<string>>()
      expectTypeOf(event.type).toExtend<'a'>()
    })
    .once('b', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'b'>()
    })
    .once((event) => {
      expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'a' | 'b'>()
    })

  emitter
    .earlyOn('a', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<string>>()
      expectTypeOf(event.type).toExtend<'a'>()
    })
    .earlyOn('b', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'b'>()
    })
    .earlyOn((event) => {
      expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'a' | 'b'>()
    })

  emitter
    .earlyOnce('a', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<string>>()
      expectTypeOf(event.type).toExtend<'a'>()
    })
    .earlyOnce('b', (event) => {
      expectTypeOf(event).toExtend<TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'b'>()
    })
    .earlyOnce((event) => {
      expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
      expectTypeOf(event.type).toExtend<'a' | 'b'>()
    })
})

it('merges events of the same type into a union', () => {
  const emitter = new Emitter<
    { a: TypedEvent<string> } | { a: TypedEvent<number> }
  >()

  emitter.on('a', (event) => {
    expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
    expectTypeOf(event.type).toExtend<'a'>()
  })

  emitter.once('a', (event) => {
    expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
    expectTypeOf(event.type).toExtend<'a'>()
  })

  emitter.earlyOn('a', (event) => {
    expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
    expectTypeOf(event.type).toExtend<'a'>()
  })

  emitter.earlyOnce('a', (event) => {
    expectTypeOf(event).toExtend<TypedEvent<string> | TypedEvent<number>>()
    expectTypeOf(event.type).toExtend<'a'>()
  })
})
