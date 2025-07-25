import { Emitter, TypedEvent } from '#src/index.js'

it('supports custom events without any data', () => {
  class FetchEvent<
    DataType = void,
    ReturnType = void,
    EventType extends string = string,
  > extends TypedEvent<void, ReturnType, EventType> {
    public id: number
    constructor(type: EventType, init: { id: number }) {
      super(type)
      this.id = init.id
    }
  }

  const emitter = new Emitter<{ fetch: FetchEvent }>()
  expect(emitter.emit(new FetchEvent('fetch', { id: 1 }))).toBe(false)

  const fetchListener = vi.fn<Emitter.ListenerType<typeof emitter, 'fetch'>>()
  emitter.on('fetch', fetchListener)

  expect(emitter.emit(new FetchEvent('fetch', { id: 2 }))).toBe(true)
  expect(fetchListener).toHaveBeenCalledOnce()
})
