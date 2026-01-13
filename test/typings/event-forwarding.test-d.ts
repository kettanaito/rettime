import { Emitter, TypedEvent } from '#src/index.js'

it('forwards typeless events between two emitters', () => {
  new Emitter<{ a: TypedEvent<string> }>().on((event) => {
    new Emitter<{ a: TypedEvent<string> }>().emit(event)

    new Emitter<{ a: TypedEvent<'narrower'> }>().emit(
      // @ts-expect-error string is not assignable to a narrower string
      event,
    )
    new Emitter<{ a: TypedEvent<number> }>().emit(
      // @ts-expect-error number is not assignable to string
      event,
    )
  })
})

it('forwards typeless events between multi-event maps', () => {
  const source = new Emitter<{ a: TypedEvent<string>; b: TypedEvent<number> }>()

  source.on((event) => {
    new Emitter<{ a: TypedEvent<string>; b: TypedEvent<number> }>().emit(event)

    new Emitter<{ a: TypedEvent<'narrower'> }>().emit(
      // @ts-expect-error string is not assignable to a narrower string
      event,
    )
    new Emitter<{ a: TypedEvent<number> }>().emit(
      // @ts-expect-error number is not assignable to string
      event,
    )

    new Emitter<{ b: TypedEvent<number> }>().emit(
      // @ts-expect-error unexpected event type "a"
      event,
    )
    new Emitter<{ a: TypedEvent<'custom'>; b: TypedEvent<number> }>().emit(
      // @ts-expect-error incompatible data type for event "a"
      event,
    )
  })
})

it('forwards typeless events between event map union', () => {
  const source = new Emitter<
    { a: TypedEvent<string> } | { b: TypedEvent<number> }
  >()

  source.on((event) => {
    new Emitter<{ a: TypedEvent<string>; b: TypedEvent<number> }>().emit(event)
    new Emitter<{ a: TypedEvent<string> } | { b: TypedEvent<number> }>().emit(
      event,
    )

    new Emitter<{ a: TypedEvent<'narrower'> }>().emit(
      // @ts-expect-error string is not assignable to a narrower string
      event,
    )
    new Emitter<{ a: TypedEvent<number> }>().emit(
      // @ts-expect-error number is not assignable to string
      event,
    )

    new Emitter<{ b: TypedEvent<number> }>().emit(
      // @ts-expect-error unexpected event type "a"
      event,
    )
    new Emitter<{ a: TypedEvent<'custom'>; b: TypedEvent<number> }>().emit(
      // @ts-expect-error incompatible data type for event "a"
      event,
    )
  })
})
