import { Emitter } from '#src/index.js'

it('returns 0 for an emitter with no listeners', () => {
  const emitter = new Emitter()
  expect(emitter.listenerCount()).toBe(0)
})

it('returns the total number of listeners', () => {
  const emitter = new Emitter()
  emitter.on('test', () => {})
  emitter.on('test', () => {})

  expect(emitter.listenerCount()).toBe(2)
})

it('returns the total number of listeners for a specific event type', () => {
  const emitter = new Emitter()
  emitter.on('test', () => {})
  emitter.on('test', () => {})
  emitter.on('other', () => {})

  expect.soft(emitter.listenerCount('test')).toBe(2)
  expect.soft(emitter.listenerCount('other')).toBe(1)
  expect.soft(emitter.listenerCount('missing')).toBe(0)
})
