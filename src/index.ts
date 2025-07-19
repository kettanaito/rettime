export type DefaultEventMap = {
  [type: string]: [payload: unknown, returnValue?: unknown]
}

type TypedEvent<T extends string> = Event & { type: T }

interface StrictEventListener<
  Event extends globalThis.Event,
  ReturnType = void,
> {
  (event: Event): [ReturnType] extends [undefined] ? void : ReturnType
}

type InferEventMap<Target extends Emitter<any>> = Target extends Emitter<
  infer T
>
  ? T
  : never

type DataToEvent<Type extends string, Data extends unknown> = [Data] extends [
  never,
]
  ? TypedEvent<Type>
  : MessageEvent<Data> & { type: Type }

type InternalListenersMap<
  Target extends Emitter<any>,
  EventMap extends DefaultEventMap = InferEventMap<Target>,
  Type extends string = keyof EventMap & string,
> = Record<
  keyof EventMap,
  Array<
    StrictEventListener<
      Emitter.EventType<Target, Type, EventMap>,
      Emitter.ListenerReturnType<Target, Type, EventMap>
    >
  >
>

type EmmiterListenerOptions = {
  signal?: AbortSignal
}

const kPropagationStopped = Symbol('kPropagationStopped')
const kImmediatePropagationStopped = Symbol('kImmediatePropagationStopped')

export namespace Emitter {
  /**
   * Returns the listener type for the given event type.
   *
   * @example
   * const emitter = new Emitter<{ getTotalPrice: [Cart, number] }>()
   * type Listener = ListenerType<typeof emitter, 'getTotalPrice'>
   * // (event: MessageEvent<Cart>) => number
   */
  export type ListenerType<
    Target extends Emitter<any>,
    Type extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = StrictEventListener<
    Emitter.EventType<Target, Type, EventMap>,
    Emitter.ListenerReturnType<Target, Type, EventMap>
  >

  /**
   * Returns the return type of the listener for the given event type.
   *
   * @example
   * const emitter = new Emitter<{ getTotalPrice: [Cart, number] }>()
   * type ListenerReturnType = InferListenerReturnType<typeof emitter, 'getTotalPrice'>
   * // number
   */
  export type ListenerReturnType<
    Target extends Emitter<any>,
    Type extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = EventMap[Type][1]

  /**
   * Returns an appropriate `Event` type for the given event type.
   *
   * @example
   * const emitter = new Emitter<{ greeting: [string] }>()
   * type GreetingEvent = InferEventType<typeof emitter, 'greeting'>
   * // MessageEvent<string>
   */
  export type EventType<
    Target extends Emitter<any>,
    Type extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = DataToEvent<Type, Emitter.EventDataType<Target, Type, EventMap>>

  export type EventDataType<
    Target extends Emitter<any>,
    Type extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = EventMap[Type][0]
}

export class Emitter<EventMap extends DefaultEventMap = {}> {
  #listeners: InternalListenersMap<typeof this, EventMap>
  #listenerOptions: WeakMap<Function, AddEventListenerOptions>
  #eventsCache: WeakMap<[string, unknown], Event>
  #abortControllers: WeakMap<Function, AbortController>

  constructor() {
    this.#listeners = {} as InternalListenersMap<typeof this, EventMap>
    this.#listenerOptions = new WeakMap()
    this.#eventsCache = new WeakMap()
    this.#abortControllers = new WeakMap()
  }

  /**
   * Adds a listener for the given event type.
   */
  public on<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
    options?: EmmiterListenerOptions,
  ): AbortController {
    this.#addListener(type, listener)

    const abortController = this.#createAbortController(type, listener)
    this.#listenerOptions.set(listener, {
      signal: options?.signal
        ? AbortSignal.any([abortController.signal, options.signal])
        : abortController.signal,
    })

    return abortController
  }

  /**
   * Adds a one-time listener for the given event type.
   */
  public once<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
    options?: EmmiterListenerOptions,
  ): AbortController {
    this.#addListener(type, listener)

    const abortController = this.#createAbortController(type, listener)
    this.#listenerOptions.set(listener, {
      once: true,
      signal: options?.signal
        ? AbortSignal.any([abortController.signal, options.signal])
        : abortController.signal,
    })

    return abortController
  }

  /**
   * Prepends a listener for the given event type.
   */
  public earlyOn<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
    options?: EmmiterListenerOptions,
  ): AbortController {
    if (!this.#listeners[type]) {
      this.#listeners[type] = []
    }

    this.#listeners[type].unshift(listener)

    const abortController = this.#createAbortController(type, listener)
    this.#listenerOptions.set(listener, {
      signal: options?.signal
        ? AbortSignal.any([abortController.signal, options.signal])
        : abortController.signal,
    })

    return abortController
  }

  /**
   * Prepends a one-time listener for the given event type.
   */
  public earlyOnce<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
    options?: EmmiterListenerOptions,
  ): AbortController {
    this.earlyOn(type, listener)

    const abortController = this.#createAbortController(type, listener)
    this.#listenerOptions.set(listener, {
      once: true,
      signal: options?.signal
        ? AbortSignal.any([abortController.signal, options.signal])
        : abortController.signal,
    })

    return abortController
  }

  /**
   * Emits the given event type. Accepts the data as the
   * second argument if the event contains data.
   *
   * @returns {boolean} Returns `true` if the event had any listeners, `false` otherwise.
   */
  public emit<Type extends keyof EventMap & string>(
    event: Emitter.EventType<typeof this, Type, EventMap>,
  ): boolean
  public emit<Type extends keyof EventMap & string>(
    ...args: Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
      ? [type: Type]
      : [type: Type, data: Emitter.EventDataType<typeof this, Type, EventMap>]
  ): boolean

  public emit<Type extends keyof EventMap & string>(
    ...args:
      | [Emitter.EventType<typeof this, Type, EventMap>]
      | (Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
          ? [type: Type]
          : [
              type: Type,
              data: Emitter.EventDataType<typeof this, Type, EventMap>,
            ])
  ): boolean {
    const [eventOrType, data] = args
    const isEvent = eventOrType instanceof Event
    const type = isEvent ? eventOrType.type : eventOrType

    if (!this.#listeners[type] || this.#listeners[type].length === 0) {
      return false
    }

    const event = isEvent
      ? eventOrType
      : this.createEvent.call(this, type, data)

    for (const listener of this.#listeners[type]) {
      if (
        event[kPropagationStopped] != null &&
        event[kPropagationStopped] !== this
      ) {
        return false
      }

      if (event[kImmediatePropagationStopped]) {
        break
      }

      if (this.#listenerOptions.get(listener).signal.aborted) {
        continue
      }

      this.#callListener(listener, event)
    }

    this.#eventsCache.delete([type, data])

    return true
  }

  /**
   * Emits the given event and returns a Promise that always resolves
   * with the array of listener results (either fulfilled or rejected).
   * The listeners are still called synchronously to guarantee call order
   * and prevent race conditions.
   */
  public emitAsPromise<Type extends keyof EventMap & string>(
    event: Emitter.EventType<typeof this, Type, EventMap>,
  ): Promise<Array<Emitter.ListenerReturnType<typeof this, Type, EventMap>>>
  public emitAsPromise<Type extends keyof EventMap & string>(
    ...args: Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
      ? [type: Type]
      : [type: Type, data: Emitter.EventDataType<typeof this, Type, EventMap>]
  ): Promise<Array<Emitter.ListenerReturnType<typeof this, Type, EventMap>>>

  public async emitAsPromise<Type extends keyof EventMap & string>(
    ...args:
      | [Emitter.EventType<typeof this, Type, EventMap>]
      | (Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
          ? [type: Type]
          : [
              type: Type,
              data: Emitter.EventDataType<typeof this, Type, EventMap>,
            ])
  ): Promise<Array<Emitter.ListenerReturnType<typeof this, Type, EventMap>>> {
    const [eventOrType, data] = args
    const isEvent = eventOrType instanceof Event
    const type = isEvent ? eventOrType.type : eventOrType

    if (!this.#listeners[type] || this.#listeners[type].length === 0) {
      return []
    }

    const event = isEvent
      ? eventOrType
      : this.createEvent.call(this, type, data)

    const pendingListeners: Array<
      Promise<Emitter.ListenerReturnType<typeof this, Type, EventMap>>
    > = []

    for (const listener of this.#listeners[type]) {
      if (
        event[kPropagationStopped] != null &&
        event[kPropagationStopped] !== this
      ) {
        return []
      }

      if (event[kImmediatePropagationStopped]) {
        break
      }

      if (this.#listenerOptions.get(listener)?.signal?.aborted) {
        continue
      }

      pendingListeners.push(
        // Awaiting individual listeners guarantees their call order.
        await Promise.resolve(this.#callListener(listener, event)),
      )
    }

    this.#eventsCache.delete([type, data])

    return Promise.allSettled(pendingListeners).then((results) => {
      return results.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason,
      )
    })
  }

  /**
   * Emits the given event and returns a generator that yields
   * the result of each listener in order. This way, you stop exhausting
   * the listeners once you get the expected value.
   */
  public emitAsGenerator<Type extends keyof EventMap & string>(
    event: Emitter.EventType<typeof this, Type, EventMap>,
  ): Generator<Emitter.ListenerReturnType<typeof this, Type, EventMap>>
  public emitAsGenerator<Type extends keyof EventMap & string>(
    ...args: Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
      ? [type: Type]
      : [type: Type, data: Emitter.EventDataType<typeof this, Type, EventMap>]
  ): Generator<Emitter.ListenerReturnType<typeof this, Type, EventMap>>

  public *emitAsGenerator<Type extends keyof EventMap & string>(
    ...args:
      | [event: Emitter.EventType<typeof this, Type, EventMap>]
      | (Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
          ? [type: Type]
          : [
              type: Type,
              data: Emitter.EventDataType<typeof this, Type, EventMap>,
            ])
  ): Generator<Emitter.ListenerReturnType<typeof this, Type, EventMap>> {
    const [eventOrType, data] = args
    const isEvent = eventOrType instanceof Event
    const type = isEvent ? eventOrType.type : eventOrType

    if (!this.#listeners[type] || this.#listeners[type].length === 0) {
      return
    }

    const event = isEvent
      ? eventOrType
      : this.createEvent.call(this, type, data)

    for (const listener of this.#listeners[type]) {
      if (
        event[kPropagationStopped] != null &&
        event[kPropagationStopped] !== this
      ) {
        return
      }

      if (event[kImmediatePropagationStopped]) {
        break
      }

      if (this.#listenerOptions.get(listener)?.signal?.aborted) {
        continue
      }

      yield this.#callListener(listener, event)
    }

    this.#eventsCache.delete([type, data])
  }

  /**
   * Removes the given listener.
   */
  public removeListener<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
  ): void {
    if (!this.#listeners[type]) {
      return
    }

    const nextListeners: Array<StrictEventListener<Event>> = []

    for (const existingListener of this.#listeners[type]) {
      if (existingListener === listener) {
        this.#listenerOptions.delete(existingListener)
        this.#abortControllers.delete(existingListener)
        this.#eventsCache.delete([type, existingListener])
        continue
      }

      nextListeners.push(existingListener)
    }

    this.#listeners[type] = nextListeners
  }

  /**
   * Removes all listeners for the given event type.
   * If no event type is provided, removes all existing listeners.
   */
  public removeAllListeners<Type extends keyof EventMap & string>(
    type?: Type,
  ): void {
    if (type == null) {
      this.#listeners = {} as InternalListenersMap<typeof this>
      this.#listenerOptions = new WeakMap()
      this.#abortControllers = new WeakMap()
      this.#eventsCache = new WeakMap()
      return
    }

    this.#listeners[type] = []
  }

  /**
   * Returns the list of listeners for the given event type.
   * If no even type is provided, returns all listeners.
   */
  public listeners<Type extends keyof EventMap & string>(
    type?: Type,
  ): Array<Emitter.ListenerType<typeof this, Type, EventMap>> {
    if (type == null) {
      return Object.values(this.#listeners).flat()
    }

    return this.#listeners[type]
  }

  /**
   * Returns the number of listeners for the given event type.
   * If no even type is provided, returns the total number of listeners.
   */
  public listenerCount<Type extends keyof EventMap & string>(
    type?: Type,
  ): number {
    return this.listeners(type).length
  }

  #addListener<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
  ) {
    if (!this.#listeners[type]) {
      this.#listeners[type] = []
    }

    this.#listeners[type].push(listener)
  }

  public createEvent<
    Type extends keyof EventMap & string,
    EmitterEvent extends Emitter.EventType<
      typeof this,
      Type,
      EventMap
    > = Emitter.EventType<typeof this, Type, EventMap>,
  >(
    ...args: Emitter.EventDataType<typeof this, Type, EventMap> extends [never]
      ? [type: Type]
      : [type: Type, data: Emitter.EventDataType<typeof this, Type, EventMap>]
  ): EmitterEvent {
    const [type, data] = args
    const cachedEvent = this.#eventsCache.get([type, data])

    if (cachedEvent) {
      return cachedEvent as EmitterEvent
    }

    let event =
      data == null
        ? (new Event(type, { cancelable: true }) as EmitterEvent)
        : (new MessageEvent(type, { data, cancelable: true }) as EmitterEvent)

    Object.defineProperties(event, {
      defaultPrevented: {
        enumerable: false,
        writable: true,
        value: false,
      },
      preventDefault: {
        enumerable: false,
        value: new Proxy(event.preventDefault, {
          apply: (target, thisArg, argArray) => {
            /**
             * @note Node.js 18 does NOT update the `defaultPrevented` value
             * when you call `preventDefault()`. This is a bug in Node.js.
             *
             * @fixme Remove this hack when Node.js 20 is the minimal version.
             */
            Reflect.set(event, 'defaultPrevented', true)
            return Reflect.apply(target, thisArg, argArray)
          },
        }),
      },
      stopPropagation: {
        enumerable: false,
        value: new Proxy(event.stopPropagation, {
          apply: (target, thisArg, argArray) => {
            /**
             * @note Propagation is also stopped when the immediate propagation is stopped.
             * Because of that, store the reference to the Emitter instance that stopped it.
             * (Node.js makes `thisArg` to be the `Event` that stops it).
             */
            event[kPropagationStopped] = this
            return Reflect.apply(target, thisArg, argArray)
          },
        }),
      },
      stopImmediatePropagation: {
        enumerable: false,
        value: new Proxy(event.stopImmediatePropagation, {
          apply(target, thisArg, argArray) {
            event[kImmediatePropagationStopped] = true
            return Reflect.apply(target, thisArg, argArray)
          },
        }),
      },
    })

    this.#eventsCache.set([type, data], event)

    return event
  }

  #callListener(listener: StrictEventListener<Event>, event: Event) {
    const returnValue = listener.call(this, event)

    if (this.#listenerOptions.get(listener)?.once) {
      this.removeListener(event.type, listener)
    }

    return returnValue
  }

  #createAbortController<Type extends keyof EventMap & string>(
    type: Type,
    listener: Emitter.ListenerType<typeof this, Type, EventMap>,
  ): AbortController {
    const abortController = new AbortController()

    // Since we are emitting events manually, aborting the controller
    // won't do anything by itself. We need to teach the class what to do.
    abortController.signal.addEventListener('abort', () => {
      this.removeListener(type, listener)
    })

    this.#abortControllers.set(listener, abortController)
    return abortController
  }
}
