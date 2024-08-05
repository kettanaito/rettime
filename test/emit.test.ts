import { Emitter } from '../src'

it('emits event without any data', () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const listener = vi.fn()
  emitter.on('hello', listener)
  const hasListeners = emitter.emit('hello')

  expect(hasListeners).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(new Event('hello'))
})

it('emits event with data', () => {
  const emitter = new Emitter<{ hello: ['world'] }>()
  const listener = vi.fn()
  emitter.on('hello', listener)
  const hasListeners = emitter.emit('hello', 'world')

  expect(hasListeners).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(
    new MessageEvent('hello', { data: 'world' })
  )
})

it('calls all listeners for the event', () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const listenerOne = vi.fn()
  const listenerTwo = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const hasListeners = emitter.emit('hello')

  expect(hasListeners).toBe(true)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerOne).toHaveBeenCalledWith(new Event('hello'))
  expect(listenerTwo).toHaveBeenCalledTimes(1)
  expect(listenerTwo).toHaveBeenCalledWith(new Event('hello'))
})

it('does not call listeners for non-matching event', () => {
  const emitter = new Emitter<{ one: [never]; two: [never] }>()
  const listener = vi.fn()
  emitter.on('one', listener)
  const hasListeners = emitter.emit('two')

  expect(hasListeners).toBe(false)
  expect(listener).not.toHaveBeenCalled()
})

it('removes the one-time listener after it has been called', () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const listener = vi.fn()
  emitter.once('hello', listener)

  expect(emitter.emit('hello')).toBe(true)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(listener).toHaveBeenCalledWith(new Event('hello'))
  expect(emitter.listeners('hello')).toEqual([])

  listener.mockReset()
  expect(emitter.emit('hello')).toBe(false)
  expect(listener).not.toHaveBeenCalled()
})

it('stops calling listeners if event default is prevented', () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const listenerOne = vi.fn((event: Event) => event.preventDefault())
  const listenerTwo = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const hasListeners = emitter.emit('hello')

  expect(hasListeners).toBe(true)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})

it('stops calling listeners if event propagation is stopped', () => {
  const emitter = new Emitter<{ hello: [never] }>()
  const listenerOne = vi.fn((event: Event) => event.stopImmediatePropagation())
  const listenerTwo = vi.fn()
  emitter.on('hello', listenerOne)
  emitter.on('hello', listenerTwo)
  const hasListeners = emitter.emit('hello')

  expect(hasListeners).toBe(true)
  expect(listenerOne).toHaveBeenCalledTimes(1)
  expect(listenerTwo).not.toHaveBeenCalled()
})
