import { Emitter } from '../src'

it('(on) supports aborting a listener by calling `abort()` on its controller', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: [string] }>()
  const controller = emitter.on('greeting', listener)

  controller.abort()
  emitter.emit('greeting', 'John')

  expect(listener).not.toHaveBeenCalled()
})

it('(on) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: [string] }>()
  const controller = new AbortController()
  emitter.on('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit('greeting', 'John')

  expect(listener).not.toHaveBeenCalled()
})

it('(once) supports aborting a listener by calling `abort()` on its controller', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: [string] }>()
  const controller = emitter.once('greeting', listener)

  controller.abort()
  emitter.emit('greeting', 'John')

  expect(listener).not.toHaveBeenCalled()
})

it('(once) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: [string] }>()
  const controller = new AbortController()
  emitter.once('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit('greeting', 'John')

  expect(listener).not.toHaveBeenCalled()
})

it('(earlyOn) supports aborting a listener by calling `abort()` on its controller', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: [string] }>()
  const controller = emitter.earlyOn('greeting', listener)

  controller.abort()
  emitter.emit('greeting', 'John')

  expect(listener).not.toHaveBeenCalled()
})

it('(earlyOn) supports aborting a listener by providing it a custom `AbortController`', () => {
  const listener = vi.fn()
  const emitter = new Emitter<{ greeting: [string] }>()
  const controller = new AbortController()
  emitter.earlyOn('greeting', listener, { signal: controller.signal })

  controller.abort()
  emitter.emit('greeting', 'John')

  expect(listener).not.toHaveBeenCalled()
})
