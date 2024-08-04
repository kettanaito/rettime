export type EventsMap = {
  [type: string]: unknown
}

type TypedEvent<T extends string> = Event & { type: T }

type EventListenerRegistration<Events extends EventsMap> = [
  type: keyof Events,
  listener: StrictEventListenerOrListenerObject<
    DataToEvent<string, Events[any]>
  >,
  options?: AddEventListenerOptions | boolean
]

export type StrictEventListenerOrListenerObject<E extends globalThis.Event> =
  | StrictEventListener<E>
  | StrictEventListenerObject<E>

export interface StrictEventListener<E extends globalThis.Event> {
  (event: E): void
}

export interface StrictEventListenerObject<E extends globalThis.Event> {
  handleEvent(event: E): void
}

type DataToEvent<Type extends string, Data extends unknown> = [Data] extends [
  never
]
  ? TypedEvent<Type>
  : MessageEvent<Data> & { type: Type }

const kPropagationStopped = Symbol('kPropagationStopped')

export class Emitter<Events extends EventsMap> {
  #listeners: Array<EventListenerRegistration<Events>>

  constructor() {
    this.#listeners = []
  }

  /**
   * Adds a listener for the given event type.
   */
  public on<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListenerOrListenerObject<
      DataToEvent<Type, Events[Type]>
    >
  ): void {
    this.#listeners.push([type, listener])
  }

  /**
   * Adds a one-time listener for the given event type.
   */
  public once<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListenerOrListenerObject<
      DataToEvent<Type, Events[Type]>
    >
  ): void {
    this.#listeners.push([type, listener, { once: true }])
  }

  /**
   * Emits the given event type. Accepts the data as the
   * second argument if the event contains data.
   */
  public emit<Type extends keyof Events & string>(
    ...args: Events[Type] extends [never]
      ? [type: Type]
      : [type: Type, data: Events[Type]]
  ): boolean {
    const [type, data] = args
    let hasListeners = false

    const listeners = Array.from(this.#listeners)
    const event = this.#createEventForData(type, data)

    for (const registration of listeners) {
      if (registration[0] === type) {
        if (event.defaultPrevented || event[kPropagationStopped]) {
          break
        }

        this.#callListener(registration, event)
        hasListeners = true
      }
    }

    return hasListeners
  }

  /**
   * Emits the given event and returns a Promise that resolves
   * with the array of listener results, or rejects as soon as any
   * of the listeners throw. Listeners are still called synchronously
   * to guarantee call order and prevent race conditions.
   */
  public async emitAsPromise<Type extends keyof Events & string>(
    ...args: Events[Type] extends [never]
      ? [type: Type]
      : [type: Type, data: Events[Type]]
  ): Promise<Array<unknown>> {
    const listeners = Array.from(this.#listeners)
    const [type, data] = args
    const event = this.#createEventForData(type, data)
    const pendingListeners: Array<Promise<unknown>> = []

    for (const registration of listeners) {
      if (event.defaultPrevented || event[kPropagationStopped]) {
        break
      }

      pendingListeners.push(
        await Promise.resolve(this.#callListener(registration, event))
      )
    }

    return Promise.allSettled(pendingListeners).then((results) => {
      return results.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason
      )
    })
  }

  /**
   * Emits the given event and returns a generator that yields
   * the result of each listener. This way, you stop exhausting
   * the listeners once you get the expected value.
   */
  public *emitAsGenerator<Type extends keyof Events & string>(
    ...args: Events[Type] extends [never]
      ? [type: Type]
      : [type: Type, data: Events[Type]]
  ): Generator<unknown> {
    const listeners = Array.from(this.#listeners)
    const [type, data] = args
    const event = this.#createEventForData(type, data)

    for (const registration of listeners) {
      if (event.defaultPrevented || event[kPropagationStopped]) {
        break
      }

      yield this.#callListener(registration, event)
    }
  }

  public dispatch<Type extends keyof Events & string>(event: TypedEvent<Type>) {
    if ('data' in event) {
      return this.emit.call(this, event.type, event.data)
    }
    return this.emit.call(this, event.type)
  }

  /**
   * Removes the given listener.
   */
  public removeListener<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListenerOrListenerObject<
      DataToEvent<Type, Events[Type]>
    >,
    options?: AddEventListenerOptions | boolean
  ): void {
    const nextListeners: Array<EventListenerRegistration<Events>> = []

    for (const registration of this.#listeners) {
      if (
        registration[0] !== type ||
        registration[1] !== listener ||
        JSON.stringify(registration[2]) !== JSON.stringify(options)
      ) {
        nextListeners.push(registration)
      }
    }

    this.#listeners = nextListeners
  }

  /**
   * Removes all listeners for the given event type.
   * If no event type is provided, removes all existing listeners.
   */
  public removeAllListeners<Type extends keyof Events & string>(
    type?: Type
  ): void {
    if (type == null) {
      this.#listeners.length = 0
      return
    }

    const nextListeners: Array<EventListenerRegistration<Events>> = []

    for (const registration of this.#listeners) {
      if (registration[0] !== type) {
        nextListeners.push(registration)
      }
    }

    this.#listeners = nextListeners
  }

  /**
   * Returns the list of listeners for the given event type.
   * If no even type is provided, returns all listeners.
   */
  public listeners<Type extends keyof Events & string>(
    type?: Type
  ): Array<
    StrictEventListenerOrListenerObject<DataToEvent<Type, Events[Type]>>
  > {
    const listeners: Array<
      StrictEventListenerOrListenerObject<DataToEvent<Type, Events[Type]>>
    > = []

    for (const registration of this.#listeners) {
      if (type == null || registration[0] === type) {
        listeners.push(registration[1])
      }
    }

    return listeners
  }

  /**
   * Returns the number of listeners for the given event type.
   * If no even type is provided, returns the total number of listeners.
   */
  public listenerCount<Type extends keyof Events & string>(
    type?: Type
  ): number {
    return this.listeners(type).length
  }

  #createEventForData<Type extends keyof Events & string>(
    type: Type,
    data: Events[Type]
  ): Event {
    let event =
      data == null
        ? new Event(type, { cancelable: true })
        : new MessageEvent(type, { data, cancelable: true })

    Object.defineProperties(event, {
      stopPropagation: {
        enumerable: false,
        value: new Proxy(event.stopPropagation, {
          apply(target, thisArg, argArray) {
            event[kPropagationStopped] = true
            return Reflect.apply(target, thisArg, argArray)
          },
        }),
      },
      stopImmediatePropagation: {
        enumerable: false,
        value: new Proxy(event.stopImmediatePropagation, {
          apply(target, thisArg, argArray) {
            event[kPropagationStopped] = true
            return Reflect.apply(target, thisArg, argArray)
          },
        }),
      },
    })

    return event
  }

  #getListenerFunction(
    listenerOrListenerObject: StrictEventListenerOrListenerObject<any>
  ): StrictEventListener<any> {
    return 'handleEvent' in listenerOrListenerObject
      ? listenerOrListenerObject.handleEvent
      : listenerOrListenerObject
  }

  #callListener(registration: EventListenerRegistration<Events>, event: Event) {
    const listener = this.#getListenerFunction(registration[1])
    const listenerResult = listener.call(this, event)

    // Remove one-time listeners.
    if (typeof registration[2] === 'object' && registration[2].once) {
      this.removeListener(registration[0], registration[1], registration[2])
    }

    return listenerResult
  }
}
