export type DefaultEventMap = {
  [eventType: string]: TypedEvent<any, any>
}

export interface TypedEvent<
  DataType = void,
  ReturnType = any,
  EventType extends string = string,
> extends Omit<MessageEvent<DataType>, 'type'> {
  type: EventType
}

const kDefaultPrevented = Symbol('kDefaultPrevented')
const kPropagationStopped = Symbol('kPropagationStopped')
const kImmediatePropagationStopped = Symbol('kImmediatePropagationStopped')
const kAllEvents = Symbol('kAllEvents')

export class TypedEvent<
    DataType = void,
    ReturnType = any,
    EventType extends string = string,
  >
  extends MessageEvent<DataType>
  implements TypedEvent<DataType, ReturnType, EventType>
{
  /**
   * @note Keep a placeholder property with the return type
   * because the type must be set somewhere in order to be
   * correctly associated and inferred from the event.
   */
  #returnType: ReturnType;

  [kDefaultPrevented]: boolean;
  [kPropagationStopped]?: Emitter<any>;
  [kImmediatePropagationStopped]?: boolean

  constructor(
    ...args: [DataType] extends [void]
      ? [type: EventType]
      : [type: EventType, init: { data: DataType }]
  ) {
    super(args[0], args[1])
    this[kDefaultPrevented] = false
  }

  get defaultPrevented(): boolean {
    return this[kDefaultPrevented]
  }

  public preventDefault(): void {
    super.preventDefault()
    this[kDefaultPrevented] = true
  }

  public stopImmediatePropagation(): void {
    /**
     * @note Despite `.stopPropagation()` and `.stopImmediatePropagation()` being defined
     * in Node.js, they do nothing. It is safe to re-define them.
     */
    super.stopImmediatePropagation()
    this[kImmediatePropagationStopped] = true
  }
}

/**
 * Brands a TypedEvent or its subclass while preserving its (narrower) type.
 */
type Brand<Event extends TypedEvent, EventType extends string> = Event & {
  type: EventType
}

type InferEventMap<Target extends Emitter<any>> =
  Target extends Emitter<infer EventMap> ? EventMap : never

/**
 * Creates a union of all events in the EventMap with their literal type strings.
 */
type AllEvents<EventMap extends DefaultEventMap> = {
  [K in keyof EventMap & string]: Brand<EventMap[K], K>
}[keyof EventMap & string]

/**
 * Extracts a union of all return types from all events in the EventMap.
 */
type AllEventsReturnType<EventMap extends DefaultEventMap> = {
  [K in keyof EventMap]: EventMap[K] extends TypedEvent<any, infer R> ? R : any
}[keyof EventMap]

/**
 * Creates a listener type for all events that accepts any event and returns union of all return types.
 */
type AllEventsListenerType<
  Target extends Emitter<any>,
  EventMap extends DefaultEventMap,
> = (
  event: AllEvents<EventMap>,
) => AllEventsReturnType<EventMap> extends [void]
  ? void
  : AllEventsReturnType<EventMap>

type InternalListenersMap<
  Target extends Emitter<any>,
  EventMap extends DefaultEventMap = InferEventMap<Target>,
  EventType extends string = keyof EventMap & string,
> = Record<
  keyof EventMap | typeof kAllEvents,
  Array<Emitter.ListenerType<Target, EventType, EventMap>>
>

export type TypedListenerOptions = {
  once?: boolean
  signal?: AbortSignal
}

const kListenerOptions = Symbol('kListenerOptions')

export namespace Emitter {
  /**
   * Returns an appropriate `Event` type for the given event type.
   *
   * @example
   * const emitter = new Emitter<{ greeting: TypedEvent<string> }>()
   * type GreetingEvent = Emitter.InferEventType<typeof emitter, 'greeting'>
   * // TypedEvent<string>
   */
  export type EventType<
    Target extends Emitter<any>,
    EventType extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = Brand<EventMap[EventType], EventType>

  export type EventDataType<
    Target extends Emitter<any>,
    EventType extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = EventMap[EventType] extends TypedEvent<infer DataType> ? DataType : never

  /**
   * Returns the listener type for the given event type.
   *
   * @example
   * const emitter = new Emitter<{ getTotalPrice: TypedEvent<Cart, number> }>()
   * type Listener = Emitter.ListenerType<typeof emitter, 'getTotalPrice'>
   * // (event: TypedEvent<Cart>) => number
   */
  export type ListenerType<
    Target extends Emitter<any>,
    Type extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > = (
    event: Emitter.EventType<Target, Type, EventMap>,
  ) => Emitter.ListenerReturnType<Target, Type, EventMap> extends [void]
    ? void
    : Emitter.ListenerReturnType<Target, Type, EventMap>

  /**
   * Returns the return type of the listener for the given event type.
   *
   * @example
   * const emitter = new Emitter<{ getTotalPrice: TypedEvent<Cart, number> }>()
   * type ListenerReturnType = Emitter.InferListenerReturnType<typeof emitter, 'getTotalPrice'>
   * // number
   */
  export type ListenerReturnType<
    Target extends Emitter<any>,
    EventType extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > =
    EventMap[EventType] extends TypedEvent<unknown, infer ReturnType>
      ? ReturnType
      : never
}

export class Emitter<EventMap extends DefaultEventMap> {
  #listeners: InternalListenersMap<typeof this, EventMap>

  constructor() {
    this.#listeners = {} as InternalListenersMap<typeof this, EventMap>
  }

  /**
   * Adds a listener for the given event type.
   * When called without a type, adds a listener for all events.
   */
  public on<EventType extends keyof EventMap & string>(
    type: EventType,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap>,
    options?: TypedListenerOptions,
  ): typeof this
  public on(
    listener: AllEventsListenerType<typeof this, EventMap>,
    options?: TypedListenerOptions,
  ): typeof this
  public on<EventType extends keyof EventMap & string>(
    typeOrListener:
      | EventType
      | ((
          event: EventMap[EventType],
        ) => Emitter.ListenerReturnType<typeof this, EventType, EventMap>),
    listenerOrOptions?:
      | Emitter.ListenerType<typeof this, EventType, EventMap>
      | TypedListenerOptions,
    options?: TypedListenerOptions,
  ): typeof this {
    if (typeof typeOrListener === 'function') {
      return this.#addListener(
        kAllEvents,
        typeOrListener as any,
        listenerOrOptions as TypedListenerOptions,
      )
    }

    return this.#addListener(
      typeOrListener,
      listenerOrOptions as Emitter.ListenerType<
        typeof this,
        EventType,
        EventMap
      >,
      options,
    )
  }

  /**
   * Adds a one-time listener for the given event type.
   * When called without a type, adds a one-time listener for all events.
   */
  public once<EventType extends keyof EventMap & string>(
    type: EventType,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap>,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this
  public once(
    listener: AllEventsListenerType<typeof this, EventMap>,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this
  public once<EventType extends keyof EventMap & string>(
    typeOrListener:
      | EventType
      | ((
          event: EventMap[EventType],
        ) => Emitter.ListenerReturnType<typeof this, EventType, EventMap>),
    listenerOrOptions?:
      | Emitter.ListenerType<typeof this, EventType, EventMap>
      | Omit<TypedListenerOptions, 'once'>,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this {
    if (typeof typeOrListener === 'function') {
      return this.on(typeOrListener as any, {
        ...(listenerOrOptions as TypedListenerOptions),
        once: true,
      })
    }

    return this.on(typeOrListener, listenerOrOptions as any, {
      ...(options || {}),
      once: true,
    })
  }

  /**
   * Prepends a listener for the given event type.
   * When called without a type, prepends a listener for all events.
   */
  public earlyOn<EventType extends keyof EventMap & string>(
    type: EventType,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap>,
    options?: TypedListenerOptions,
  ): typeof this
  public earlyOn(
    listener: AllEventsListenerType<typeof this, EventMap>,
    options?: TypedListenerOptions,
  ): typeof this
  public earlyOn<EventType extends keyof EventMap & string>(
    typeOrListener:
      | EventType
      | ((
          event: EventMap[EventType],
        ) => Emitter.ListenerReturnType<typeof this, EventType, EventMap>),
    listenerOrOptions?:
      | Emitter.ListenerType<typeof this, EventType, EventMap>
      | TypedListenerOptions,
    options?: TypedListenerOptions,
  ): typeof this {
    if (typeof typeOrListener === 'function') {
      return this.#addListener(
        kAllEvents,
        typeOrListener as any,
        listenerOrOptions as TypedListenerOptions,
        'prepend',
      )
    }

    return this.#addListener(
      typeOrListener,
      listenerOrOptions as Emitter.ListenerType<
        typeof this,
        EventType,
        EventMap
      >,
      options,
      'prepend',
    )
  }

  /**
   * Prepends a one-time listener for the given event type.
   * When called without a type, prepends a one-time listener for all events.
   */
  public earlyOnce<EventType extends keyof EventMap & string>(
    type: EventType,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap>,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this
  public earlyOnce(
    listener: AllEventsListenerType<typeof this, EventMap>,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this
  public earlyOnce<EventType extends keyof EventMap & string>(
    typeOrListener:
      | EventType
      | ((
          event: EventMap[EventType],
        ) => Emitter.ListenerReturnType<typeof this, EventType, EventMap>),
    listenerOrOptions?:
      | Emitter.ListenerType<typeof this, EventType, EventMap>
      | Omit<TypedListenerOptions, 'once'>,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this {
    if (typeof typeOrListener === 'function') {
      return this.earlyOn(typeOrListener as any, {
        ...(listenerOrOptions as TypedListenerOptions),
        once: true,
      })
    }

    return this.earlyOn(typeOrListener, listenerOrOptions as any, {
      ...(options || {}),
      once: true,
    })
  }

  /**
   * Emits the given typed event.
   *
   * @returns {boolean} Returns `true` if the event had any listeners, `false` otherwise.
   */
  public emit<EventType extends keyof EventMap & string>(
    event: Brand<EventMap[EventType], EventType>,
  ): boolean {
    const typeListeners = this.#listeners[event.type] || []
    const allListeners = this.#listeners[kAllEvents] || []

    if (typeListeners.length === 0 && allListeners.length === 0) {
      return false
    }

    const proxiedEvent = this.#proxyEvent(event)

    for (const listener of typeListeners) {
      if (
        proxiedEvent.event[kPropagationStopped] != null &&
        proxiedEvent.event[kPropagationStopped] !== this
      ) {
        proxiedEvent.revoke()
        return false
      }

      if (proxiedEvent.event[kImmediatePropagationStopped]) {
        break
      }

      this.#callListener(proxiedEvent.event, listener, event.type)
    }

    if (!proxiedEvent.event[kImmediatePropagationStopped]) {
      for (const listener of allListeners) {
        if (
          proxiedEvent.event[kPropagationStopped] != null &&
          proxiedEvent.event[kPropagationStopped] !== this
        ) {
          proxiedEvent.revoke()
          return false
        }

        if (proxiedEvent.event[kImmediatePropagationStopped]) {
          break
        }

        this.#callListener(proxiedEvent.event, listener, kAllEvents)
      }
    }

    proxiedEvent.revoke()

    return true
  }

  /**
   * Emits the given typed event and returns a promise that resolves
   * when all the listeners for that event have settled.
   *
   * @returns {Promise<Array<Emitter.ListenerReturnType>>} A promise that resolves
   * with the return values of all listeners.
   */
  public async emitAsPromise<EventType extends keyof EventMap & string>(
    event: Brand<EventMap[EventType], EventType>,
  ): Promise<
    Array<Emitter.ListenerReturnType<typeof this, EventType, EventMap>>
  > {
    const typeListeners = this.#listeners[event.type] || []
    const allListeners = this.#listeners[kAllEvents] || []

    if (typeListeners.length === 0 && allListeners.length === 0) {
      return []
    }

    const pendingListeners: Array<
      Promise<Emitter.ListenerReturnType<typeof this, EventType, EventMap>>
    > = []

    const proxiedEvent = this.#proxyEvent(event)

    for (const listener of typeListeners) {
      if (
        proxiedEvent.event[kPropagationStopped] != null &&
        proxiedEvent.event[kPropagationStopped] !== this
      ) {
        proxiedEvent.revoke()
        return []
      }

      if (proxiedEvent.event[kImmediatePropagationStopped]) {
        break
      }

      pendingListeners.push(
        await Promise.resolve(
          this.#callListener(proxiedEvent.event, listener, event.type),
        ),
      )
    }

    if (!proxiedEvent.event[kImmediatePropagationStopped]) {
      for (const listener of allListeners) {
        if (
          proxiedEvent.event[kPropagationStopped] != null &&
          proxiedEvent.event[kPropagationStopped] !== this
        ) {
          proxiedEvent.revoke()
          return []
        }

        if (proxiedEvent.event[kImmediatePropagationStopped]) {
          break
        }

        pendingListeners.push(
          await Promise.resolve(
            this.#callListener(proxiedEvent.event, listener, kAllEvents),
          ),
        )
      }
    }

    proxiedEvent.revoke()

    return Promise.allSettled(pendingListeners).then((results) => {
      return results.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason,
      )
    })
  }

  /**
   * Emits the given event and returns a generator that yields
   * the result of each listener in the order of their registration.
   * This way, you stop exhausting the listeners once you get the expected value.
   */
  public *emitAsGenerator<EventType extends keyof EventMap & string>(
    event: Brand<EventMap[EventType], EventType>,
  ): Generator<Emitter.ListenerReturnType<typeof this, EventType, EventMap>> {
    const typeListeners = this.#listeners[event.type] || []
    const allListeners = this.#listeners[kAllEvents] || []

    if (typeListeners.length === 0 && allListeners.length === 0) {
      return
    }

    const proxiedEvent = this.#proxyEvent(event)

    for (const listener of typeListeners) {
      if (
        proxiedEvent.event[kPropagationStopped] != null &&
        proxiedEvent.event[kPropagationStopped] !== this
      ) {
        proxiedEvent.revoke()
        return
      }

      if (proxiedEvent.event[kImmediatePropagationStopped]) {
        break
      }

      yield this.#callListener(proxiedEvent.event, listener, event.type)
    }

    if (!proxiedEvent.event[kImmediatePropagationStopped]) {
      for (const listener of allListeners) {
        if (
          proxiedEvent.event[kPropagationStopped] != null &&
          proxiedEvent.event[kPropagationStopped] !== this
        ) {
          proxiedEvent.revoke()
          return
        }

        if (proxiedEvent.event[kImmediatePropagationStopped]) {
          break
        }

        yield this.#callListener(proxiedEvent.event, listener, kAllEvents)
      }
    }

    proxiedEvent.revoke()
  }

  /**
   * Removes a listener for the given event type.
   */
  public removeListener<EventType extends keyof EventMap & string>(
    type: EventType,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap>,
  ): void {
    if (this.listenerCount(type) === 0) {
      return
    }

    const nextListeners: Array<
      Emitter.ListenerType<typeof this, EventType, EventMap>
    > = []

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
  public removeAllListeners<EventType extends keyof EventMap & string>(
    type?: EventType,
  ): void {
    if (type == null) {
      this.#listeners = {} as InternalListenersMap<typeof this>
      return
    }

    this.#listeners[type] = []
  }

  /**
   * Returns the list of listeners for the given event type.
   * If no even type is provided, returns all listeners.
   */
  public listeners<EventType extends keyof EventMap & string>(
    type?: EventType,
  ): Array<Emitter.ListenerType<typeof this, EventType, EventMap>> {
    if (type == null) {
      return Object.values(this.#listeners).flat()
    }

    return this.#listeners[type] || []
  }

  /**
   * Returns the number of listeners for the given event type.
   * If no even type is provided, returns the total number of listeners.
   */
  public listenerCount<EventType extends keyof EventMap & string>(
    type?: EventType,
  ): number {
    return this.listeners(type).length
  }

  #addListener<EventType extends keyof EventMap & string>(
    type: EventType | typeof kAllEvents,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap>,
    options: TypedListenerOptions | undefined,
    insertMode: 'append' | 'prepend' = 'append',
  ): typeof this {
    this.#listeners[type] ??= []

    if (insertMode === 'prepend') {
      this.#listeners[type].unshift(listener)
    } else {
      this.#listeners[type].push(listener)
    }

    if (options) {
      Object.defineProperty(listener, kListenerOptions, {
        value: options,
        enumerable: false,
        writable: false,
      })

      if (options.signal) {
        options.signal.addEventListener(
          'abort',
          () => {
            if (type === kAllEvents) {
              const allListeners = this.#listeners[kAllEvents]
              if (allListeners) {
                this.#listeners[kAllEvents] = allListeners.filter(
                  (l) => l !== listener,
                )
              }
            } else {
              this.removeListener(type as EventType, listener)
            }
          },
          { once: true },
        )
      }
    }

    return this
  }

  #proxyEvent<Event extends TypedEvent>(
    event: Event,
  ): { event: Event; revoke: () => void } {
    const { stopPropagation } = event

    event.stopPropagation = new Proxy(event.stopPropagation, {
      apply: (target, thisArg, argArray) => {
        event[kPropagationStopped] = this
        return Reflect.apply(target, thisArg, argArray)
      },
    })

    return {
      event,
      revoke() {
        event.stopPropagation = stopPropagation
      },
    }
  }

  #callListener<EventType extends keyof EventMap & string>(
    event: Event,
    listener: Emitter.ListenerType<typeof this, EventType, EventMap> & {
      [kListenerOptions]?: TypedListenerOptions
    },
    listenerType: EventType | typeof kAllEvents,
  ) {
    const returnValue = listener.call(this, event)

    if (listener[kListenerOptions]?.once) {
      if (listenerType === kAllEvents) {
        const allListeners = this.#listeners[kAllEvents]
        if (allListeners) {
          this.#listeners[kAllEvents] = allListeners.filter(
            (l) => l !== listener,
          )
        }
      } else {
        this.removeListener(event.type, listener)
      }
    }

    return returnValue
  }
}
