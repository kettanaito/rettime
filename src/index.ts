export type EventsMap = {
  [type: string]: [payload: unknown, listenerResult?: unknown]
}

type TypedEvent<T extends string> = Event & { type: T }

export interface StrictEventListener<E extends globalThis.Event, R = void> {
  (event: E): [R] extends [undefined] ? void : R
}

type DataToEvent<Type extends string, Data extends unknown> = [Data] extends [
  never,
]
  ? TypedEvent<Type>
  : MessageEvent<Data> & { type: Type }

type InternalListenersMap<Events extends EventsMap> = Record<
  keyof Events,
  Array<
    StrictEventListener<
      DataToEvent<keyof Events & string, Events[keyof Events][0]>,
      Events[keyof Events][1]
    >
  >
>

type EmmiterListenerOptions = {
  signal?: AbortSignal
}

const kPropagationStopped = Symbol('kPropagationStopped')

export class Emitter<Events extends EventsMap> {
  #listeners: InternalListenersMap<Events>
  #listenerOptions: WeakMap<Function, AddEventListenerOptions>
  #eventsCache: WeakMap<[string, unknown], Event>
  #abortControllers: WeakMap<Function, AbortController>

  constructor() {
    this.#listeners = {} as InternalListenersMap<Events>
    this.#listenerOptions = new WeakMap()
    this.#eventsCache = new WeakMap()
    this.#abortControllers = new WeakMap()
  }

  /**
   * Adds a listener for the given event type.
   */
  public on<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListener<
      DataToEvent<Type, Events[Type][0]>,
      Events[Type][1]
    >,
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
  public once<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListener<
      DataToEvent<Type, Events[Type][0]>,
      Events[Type][1]
    >,
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
  public earlyOn<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListener<DataToEvent<Type, Events[Type]>>,
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
  public earlyOnce<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListener<DataToEvent<Type, Events[Type]>>,
  ): AbortController {
    this.earlyOn(type, listener)

    const abortController = this.#createAbortController(type, listener)
    this.#listenerOptions.set(listener, {
      once: true,
      signal: abortController.signal,
    })

    return abortController
  }

  /**
   * Emits the given event type. Accepts the data as the
   * second argument if the event contains data.
   *
   * @returns {boolean} Returns `true` if the event had any listeners, `false` otherwise.
   */
  public emit<Type extends keyof Events & string>(
    ...args: Events[Type][0] extends [never]
      ? [type: Type]
      : [type: Type, data: Events[Type][0]]
  ): boolean {
    if (!this.#listeners[args[0]] || this.#listeners[args[0]].length === 0) {
      return false
    }

    const event = this.#createEventForData(args[0], args[1])

    for (const listener of this.#listeners[args[0]]) {
      if (this.#listenerOptions.get(listener).signal.aborted) {
        continue
      }

      if (this.#wasEventCancelled(event)) {
        break
      }

      this.#callListener(listener, event)
    }

    this.#eventsCache.delete([args[0], args[1]])

    return true
  }

  /**
   * Emits the given event and returns a Promise that resolves
   * with the array of listener results, or rejects as soon as any
   * of the listeners throw. Listeners are still called synchronously
   * to guarantee call order and prevent race conditions.
   */
  public async emitAsPromise<Type extends keyof Events & string>(
    ...args: Events[Type][0] extends [never]
      ? [type: Type]
      : [type: Type, data: Events[Type][0]]
  ): Promise<Array<unknown>> {
    if (!this.#listeners[args[0]] || this.#listeners[args[0]].length === 0) {
      return []
    }

    const event = this.#createEventForData(args[0], args[1])
    const pendingListeners: Array<Promise<unknown>> = []

    for (const listener of this.#listeners[args[0]]) {
      if (this.#listenerOptions.get(listener).signal.aborted) {
        continue
      }

      if (this.#wasEventCancelled(event)) {
        break
      }

      pendingListeners.push(
        await Promise.resolve(this.#callListener(listener, event)),
      )
    }

    this.#eventsCache.delete([args[0], args[1]])

    return Promise.allSettled(pendingListeners).then((results) => {
      return results.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason,
      )
    })
  }

  /**
   * Emits the given event and returns a generator that yields
   * the result of each listener. This way, you stop exhausting
   * the listeners once you get the expected value.
   */
  public *emitAsGenerator<Type extends keyof Events & string>(
    ...args: Events[Type][0] extends [never]
      ? [type: Type]
      : [type: Type, data: Events[Type][0]]
  ): Generator<unknown> {
    if (!this.#listeners[args[0]] || this.#listeners[args[0]].length === 0) {
      return
    }

    const event = this.#createEventForData(args[0], args[1])

    for (const listener of this.#listeners[args[0]]) {
      if (this.#listenerOptions.get(listener).signal.aborted) {
        continue
      }

      if (this.#wasEventCancelled(event)) {
        break
      }

      yield this.#callListener(listener, event)
    }

    this.#eventsCache.delete([args[0], args[1]])
  }

  /**
   * Removes the given listener.
   */
  public removeListener<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListener<DataToEvent<Type, Events[Type]>>,
  ): void {
    this.#listenerOptions.delete(listener)

    if (!this.#listeners[type]) {
      return
    }

    const nextListeners: Array<StrictEventListener<Event>> = []

    for (const existingListener of this.#listeners[type]) {
      if (existingListener !== listener) {
        nextListeners.push(existingListener)
      }
    }

    this.#listeners[type] = nextListeners
  }

  /**
   * Removes all listeners for the given event type.
   * If no event type is provided, removes all existing listeners.
   */
  public removeAllListeners<Type extends keyof Events & string>(
    type?: Type,
  ): void {
    if (type == null) {
      this.#listeners = {} as InternalListenersMap<Events>
      return
    }

    this.#listeners[type] = []
  }

  /**
   * Returns the list of listeners for the given event type.
   * If no even type is provided, returns all listeners.
   */
  public listeners<Type extends keyof Events & string>(
    type?: Type,
  ): Array<StrictEventListener<DataToEvent<Type, Events[Type]>>> {
    if (type == null) {
      return Object.values(this.#listeners).flat()
    }

    return this.#listeners[type]
  }

  /**
   * Returns the number of listeners for the given event type.
   * If no even type is provided, returns the total number of listeners.
   */
  public listenerCount<Type extends keyof Events & string>(
    type?: Type,
  ): number {
    return this.listeners(type).length
  }

  #addListener<Type extends keyof Events & string>(
    type: Type,
    listener: StrictEventListener<DataToEvent<Type, Events[Type]>>,
  ) {
    if (!this.#listeners[type]) {
      this.#listeners[type] = []
    }

    this.#listeners[type].push(listener)
  }

  #createEventForData<Type extends keyof Events & string>(
    type: Type,
    data: Events[Type][0],
  ): Event {
    const cachedEvent = this.#eventsCache.get([type, data])

    if (cachedEvent) {
      return cachedEvent
    }

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

    this.#eventsCache.set([type, data], event)

    return event
  }

  #wasEventCancelled(event: Event): boolean {
    return event.defaultPrevented || event[kPropagationStopped]
  }

  #callListener(listener: StrictEventListener<Event>, event: Event) {
    const listenerResult = listener.call(this, event)

    if (this.#listenerOptions.get(listener)?.once) {
      this.removeListener(event.type, listener)
    }

    return listenerResult
  }

  #createAbortController<Type extends keyof EventsMap & string>(
    type: Type,
    listener: StrictEventListener<Event>,
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
