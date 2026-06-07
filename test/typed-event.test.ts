import { TypedEvent } from '#src/index.js'

it('does not depend on global MessageEvent', () => {
  const original = globalThis.MessageEvent

  globalThis.MessageEvent = undefined

  try {
    const event = new TypedEvent('hello', { data: 'world' })

    expect(event.type).toBe('hello')
    expect(event.data).toBe('world')
  } finally {
    globalThis.MessageEvent = original
  }
})

it('tracks default and propagation state without DOM inheritance', () => {
  const event = new TypedEvent('hello')

  expect(event.defaultPrevented).toBe(false)

  event.preventDefault()
  event.stopImmediatePropagation()
  event.stopPropagation()

  expect(event.defaultPrevented).toBe(true)
})
