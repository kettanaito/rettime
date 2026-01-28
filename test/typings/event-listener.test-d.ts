/**
 * @see https://github.com/kettanaito/rettime/issues/26
 */
import { Emitter, TypedEvent } from '#src/index'

it('does not hang forever due to the "No error for last overload signature" error', () => {
  type CustomEventMap = {
    frame: TypedEvent
  }

  class Source {
    emitter: Emitter<CustomEventMap>

    public on<Type extends keyof CustomEventMap>(
      type: Type,
      listener: Emitter.ListenerType<typeof this.emitter, Type>,
    ): void {
      this.emitter.on(type, listener)
    }
  }
})
