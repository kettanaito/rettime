type Values<M> = M[keyof M & string]

export class LensList<ValueMap extends Record<string, any>> {
  #list: Array<[string, Values<ValueMap>]>
  #lens: Map<string, Array<Values<ValueMap>>>

  constructor() {
    this.#list = []
    this.#lens = new Map()
  }

  get [Symbol.iterator]() {
    // Return the list's iterator so iteration is order-sensitive.
    return this.#list[Symbol.iterator].bind(this.#list)
  }

  public entries() {
    return this.#lens.entries()
  }

  /**
   * Return an order-sensitive list of values by the given key.
   */
  public get<K extends keyof ValueMap & string>(key: K): Array<ValueMap[K]> {
    return (this.#lens.get(key) || []) as Array<ValueMap[K]>
  }

  /**
   * Return an order-sensitive list of all values.
   */
  public getAll(): Array<Values<ValueMap>> {
    return this.#list.map(([, value]) => value)
  }

  /**
   * Append a new value to the given key.
   */
  public append<K extends keyof ValueMap & string>(
    key: K,
    value: ValueMap[K],
  ): void {
    this.#list.push([key, value])
    this.#openLens(key, (list) => list.push(value))
  }

  /**
   * Prepend a new value to the given key.
   */
  public prepend<K extends keyof ValueMap & string>(
    key: K,
    value: ValueMap[K],
  ): void {
    this.#list.unshift([key, value])
    this.#openLens(key, (list) => list.unshift(value))
  }

  /**
   * Delete the value belonging to the given key.
   * Returns `true` if the value was present and removed, `false` otherwise.
   */
  public delete<K extends keyof ValueMap & string>(
    key: K,
    value: ValueMap[K],
  ): boolean {
    if (this.size === 0) {
      return false
    }

    const values = this.#lens.get(key)
    if (!values) {
      return false
    }

    const index = values.indexOf(value)
    if (index === -1) {
      return false
    }

    values.splice(index, 1)
    this.#list.splice(
      this.#list.findIndex(
        (item) => item[0] === key && item[1] === value,
      ),
      1,
    )
    return true
  }

  /**
   * Delete all values belogning to the given key.
   */
  public deleteAll<K extends keyof ValueMap & string>(key: K): void {
    if (this.size === 0) {
      return
    }

    this.#list = this.#list.filter((item) => item[0] !== key)
    this.#lens.delete(key)
  }

  get size(): number {
    return this.#list.length
  }

  public clear(): void {
    if (this.size === 0) {
      return
    }

    this.#list.length = 0
    this.#lens.clear()
  }

  #openLens(
    key: string,
    setter: (target: Array<Values<ValueMap>>) => void,
  ): void {
    setter(this.#lens.get(key) || this.#lens.set(key, []).get(key))
  }
}
