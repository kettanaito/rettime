export type DefaultEventMap = {
  [eventType: string]: TypedEvent<any, any>
}

/**
 * Reserved event map containing special event types like '*' for catch-all listeners.
 */
export type ReservedEventMap = {
  '*': TypedEvent<any, any>
}

type IsReservedEvent<Type extends string> = Type extends keyof ReservedEventMap
  ? true
  : false

export interface TypedEvent<
  DataType = void,
  ReturnType = void,
  EventType extends string = string,
> extends Omit<MessageEvent<DataType>, 'type'> {
  type: EventType
}

const kDefaultPrevented = Symbol('kDefaultPrevented')
const kPropagationStopped = Symbol('kPropagationStopped')
const kImmediatePropagationStopped = Symbol('kImmediatePropagationStopped')

export class TypedEvent<
    DataType = void,
    ReturnType = void,
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
type Brand<
  Event extends TypedEvent,
  EventType extends string,
  Loose extends boolean = false,
> = Loose extends true
  ? Event extends TypedEvent<infer Data, any, any>
    ? /**
       * @note Omit the `ReturnType` so emit methods can accept type events
       * where infering the return type is impossible.
       */
      TypedEvent<Data, any, EventType> & {
        type: EventType
      }
    : never
  : Event & { type: EventType }

type InferEventMap<Target extends Emitter<any>> =
  Target extends Emitter<infer EventMap> ? EventMap : never

/**
 * Extracts only user-defined events, excluding reserved event types.
 */
type UserEventMap<EventMap extends DefaultEventMap> = Omit<
  EventMap,
  keyof ReservedEventMap
>

/**
 * Merges the user EventMap with the ReservedEventMap.
 * The '*' event type accepts a union of all user-defined events.
 */
type MergedEventMap<EventMap extends DefaultEventMap> = EventMap &
  ReservedEventMap

/**
 * Creates a union of all events in the EventMap with their literal type strings.
 */
type AllEvents<EventMap extends DefaultEventMap> = {
  [K in keyof EventMap & string]: Brand<EventMap[K], K>
}[keyof EventMap & string]

type InternalListenersMap<
  Target extends Emitter<any>,
  EventMap extends DefaultEventMap = InferEventMap<Target>,
> = Partial<{
  [K in keyof MergedEventMap<EventMap>]: Array<
    Emitter.ListenerType<Target, K & string, MergedEventMap<EventMap>>
  >
}>

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
  > =
    IsReservedEvent<EventType> extends true
      ? AllEvents<UserEventMap<EventMap>>
      : Brand<EventMap[EventType], EventType>

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
    EventType extends keyof EventMap & string,
    EventMap extends DefaultEventMap = InferEventMap<Target>,
  > =
    IsReservedEvent<EventType> extends true
      ? (event: AllEvents<UserEventMap<EventMap>>) => void
      : (
          event: Emitter.EventType<Target, EventType, EventMap>,
        ) => Emitter.ListenerReturnType<Target, EventType, EventMap> extends [
          void,
        ]
          ? void
          : Emitter.ListenerReturnType<Target, EventType, EventMap>

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
    IsReservedEvent<EventType> extends true
      ? void
      : EventMap[EventType] extends TypedEvent<unknown, infer ReturnType>
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
   */
  public on<EventType extends keyof MergedEventMap<EventMap> & string>(
    type: EventType,
    listener: Emitter.ListenerType<
      typeof this,
      EventType,
      MergedEventMap<EventMap>
    >,
    options?: TypedListenerOptions,
  ): typeof this {
    return this.#addListener(type, listener, options)
  }

  /**
   * Adds a one-time listener for the given event type.
   */
  public once<EventType extends keyof MergedEventMap<EventMap> & string>(
    type: EventType,
    listener: Emitter.ListenerType<
      typeof this,
      EventType,
      MergedEventMap<EventMap>
    >,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this {
    return this.on(type, listener, {
      ...(options || {}),
      once: true,
    })
  }

  /**
   * Prepends a listener for the given event type.
   */
  public earlyOn<EventType extends keyof MergedEventMap<EventMap> & string>(
    type: EventType,
    listener: Emitter.ListenerType<
      typeof this,
      EventType,
      MergedEventMap<EventMap>
    >,
    options?: TypedListenerOptions,
  ): typeof this {
    return this.#addListener(type, listener, options, 'prepend')
  }

  /**
   * Prepends a one-time listener for the given event type.
   */
  public earlyOnce<EventType extends keyof MergedEventMap<EventMap> & string>(
    type: EventType,
    listener: Emitter.ListenerType<
      typeof this,
      EventType,
      MergedEventMap<EventMap>
    >,
    options?: Omit<TypedListenerOptions, 'once'>,
  ): typeof this {
    return this.earlyOn(type, listener, {
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
    event: Brand<EventMap[EventType], EventType, true>,
  ): boolean {
    const typelessListeners = this.#listeners['*'] || []
    const typeListeners = this.#listeners[event.type] || []
    const allListeners = [...typelessListeners, ...typeListeners]

    if (allListeners.length === 0) {
      return false
    }

    const proxiedEvent = this.#proxyEvent(event)

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

      this.#callListener(proxiedEvent.event, listener, event.type)
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
    event: Brand<EventMap[EventType], EventType, true>,
  ): Promise<
    Array<Emitter.ListenerReturnType<typeof this, EventType, EventMap>>
  > {
    const typelessListeners = this.#listeners['*'] || []
    const typeListeners = this.#listeners[event.type] || []
    const allListeners = [...typelessListeners, ...typeListeners]

    if (allListeners.length === 0) {
      return []
    }

    const pendingListeners: Array<
      Promise<Emitter.ListenerReturnType<typeof this, EventType, EventMap>>
    > = []

    const proxiedEvent = this.#proxyEvent(event)

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
          this.#callListener(proxiedEvent.event, listener, event.type),
        ),
      )
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
    event: Brand<EventMap[EventType], EventType, true>,
  ): Generator<Emitter.ListenerReturnType<typeof this, EventType, EventMap>> {
    const typelessListeners = this.#listeners['*'] || []
    const typeListeners = this.#listeners[event.type] || []
    const allListeners = [...typelessListeners, ...typeListeners]

    if (allListeners.length === 0) {
      return
    }

    const proxiedEvent = this.#proxyEvent(event)

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

      yield this.#callListener(proxiedEvent.event, listener, event.type)
    }

    proxiedEvent.revoke()
  }

  /**
   * Removes a listener for the given event type.
   */
  public removeListener<
    EventType extends keyof MergedEventMap<EventMap> & string,
  >(
    type: EventType,
    listener: Emitter.ListenerType<
      typeof this,
      EventType,
      MergedEventMap<EventMap>
    >,
  ): void {
    if (!this.#listeners[type] || this.#listeners[type]!.length === 0) {
      return
    }

    const nextListeners: Array<
      Emitter.ListenerType<typeof this, EventType, MergedEventMap<EventMap>>
    > = []

    for (const existingListener of this.#listeners[type]!) {
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
  public removeAllListeners<
    EventType extends keyof MergedEventMap<EventMap> & string,
  >(type?: EventType): void {
    if (type == null) {
      this.#listeners = {}
      return
    }

    this.#listeners[type] = []
  }

  /**
   * Returns the list of listeners for the given event type.
   * If no even type is provided, returns all listeners.
   */
  public listeners<EventType extends keyof MergedEventMap<EventMap> & string>(
    type?: EventType,
  ): Array<
    Emitter.ListenerType<typeof this, EventType, MergedEventMap<EventMap>>
  > {
    if (type == null) {
      // Return ALL listeners: typeless + all explicit listeners
      return Object.values(this.#listeners).flat() as Array<
        Emitter.ListenerType<typeof this, EventType, MergedEventMap<EventMap>>
      >
    }

    // Return ONLY explicit listeners for the given type
    return (this.#listeners[type] || []) as Array<
      Emitter.ListenerType<typeof this, EventType, MergedEventMap<EventMap>>
    >
  }

  /**
   * Returns the number of listeners for the given event type.
   * If no even type is provided, returns the total number of listeners.
   */
  public listenerCount<
    EventType extends keyof MergedEventMap<EventMap> & string,
  >(type?: EventType): number {
    return this.listeners(type).length
  }

  #addListener<EventType extends keyof MergedEventMap<EventMap> & string>(
    type: EventType,
    listener: Emitter.ListenerType<
      typeof this,
      EventType,
      MergedEventMap<EventMap>
    >,
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
            this.removeListener(type, listener)
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

  #callListener(
    event: Event,
    listener: ((event: any) => any) & {
      [kListenerOptions]?: TypedListenerOptions
    },
    listenerType: string,
  ) {
    const returnValue = listener.call(this, event)

    if (listener[kListenerOptions]?.once) {
      this.removeListener(listenerType, listener)
    }

    return returnValue
  }
}
