import { Emitter } from '#src/index.js'

it('returns an empty array for emitter with no listeners', () => {
  const emitter = new Emitter()
  expect(emitter.listeners()).toEqual([])
})

it('returns an empty array for a specific event type with no listeners', () => {
  const emitter = new Emitter()
  expect(emitter.listeners('test')).toEqual([])
})

it('returns the list of all listeners', () => {
  const emitter = new Emitter()
  const listener1 = () => {}
  const listener2 = () => {}
  emitter.on('test', listener1)
  emitter.on('test', listener2)
  expect(emitter.listeners('test')).toEqual([listener1, listener2])
})

it('returns the list of listeners for a specific event type', () => {
  const emitter = new Emitter()
  const firstListenerOne = () => {}
  const firstListnerTwo = () => {}
  const secondListener = () => {}
  emitter.on('test', firstListenerOne)
  emitter.on('test', firstListnerTwo)
  emitter.on('other', secondListener)
  expect(emitter.listeners('test')).toEqual([firstListenerOne, firstListnerTwo])
  expect(emitter.listeners('other')).toEqual([expect.any(Function)])
})
