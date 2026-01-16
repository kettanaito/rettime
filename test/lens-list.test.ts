import { LensList } from '../src/lens-list'

it('returns 0 as the size of an empty list', () => {
  expect(new LensList().size).toBe(0)
})

it('appends a new value by the same key', () => {
  const list = new LensList()
  list.append('a', 'one')

  expect.soft(list.size).toBe(1)
  expect.soft(list.get('a')).toEqual(['one'])
  expect.soft(list.getAll()).toEqual(['one'])

  list.append('a', 'two')

  expect.soft(list.size).toBe(2)
  expect.soft(list.get('a')).toEqual(['one', 'two'])
  expect.soft(list.getAll()).toEqual(['one', 'two'])
})

it('appends a new value across keys', () => {
  const list = new LensList()
  list.append('a', 'one')

  expect.soft(list.size).toBe(1)
  expect.soft(list.get('a')).toEqual(['one'])
  expect.soft(list.getAll()).toEqual(['one'])

  list.append('b', 'two')

  expect.soft(list.size).toBe(2)
  expect.soft(list.get('a')).toEqual(['one'])
  expect.soft(list.get('b')).toEqual(['two'])
  expect.soft(list.getAll()).toEqual(['one', 'two'])
})

it('prepends a new value to the same key', () => {
  const list = new LensList()
  list.append('a', 'one')
  list.prepend('a', 'two')

  expect.soft(list.size).toBe(2)
  expect.soft(list.get('a')).toEqual(['two', 'one'])
  expect.soft(list.getAll()).toEqual(['two', 'one'])
})

it('prepends a new value across keys', () => {
  const list = new LensList()
  list.append('a', 'one')
  list.prepend('b', 'two')

  expect.soft(list.size).toBe(2)
  expect.soft(list.get('a')).toEqual(['one'])
  expect.soft(list.get('b')).toEqual(['two'])
  expect.soft(list.getAll()).toEqual(['two', 'one'])
})

it('does nothing if deleting a non-existing value', () => {
  const list = new LensList()
  list.delete('a', 'non-existing')

  expect.soft(list.size).toBe(0)
  expect.soft(list.get('a')).toEqual([])
  expect.soft(list.getAll()).toEqual([])
})

it('deletes a value from the key', () => {
  const list = new LensList()
  list.append('a', 'one')
  list.delete('a', 'one')

  expect.soft(list.size).toBe(0)
  expect.soft(list.get('a')).toEqual([])
  expect.soft(list.getAll()).toEqual([])
})

it('deletes all values from the key', () => {
  const list = new LensList()
  list.append('a', 'one')
  list.append('a', 'two')
  list.deleteAll('a')

  expect.soft(list.size).toBe(0)
  expect.soft(list.get('a')).toEqual([])
  expect.soft(list.getAll()).toEqual([])
})

it('does nothing when clearing an empty list', () => {
  const list = new LensList()
  list.clear()

  expect.soft(list.size).toBe(0)
  expect.soft(list.getAll()).toEqual([])
})

it('clears the list', () => {
  const list = new LensList()
  list.append('a', 'one')
  list.prepend('a', 'two')
  list.prepend('b', 'three')
  list.clear()

  expect.soft(list.size).toBe(0)
  expect.soft(list.getAll()).toEqual([])
})

it('can be iterated over', () => {
  const list = new LensList()
  expect(Array.from(list)).toEqual([])

  list.append('a', 'one')
  expect(Array.from(list)).toEqual([['a', 'one']])

  list.prepend('a', 'two')
  expect(Array.from(list)).toEqual([
    ['a', 'two'],
    ['a', 'one'],
  ])

  list.prepend('b', 'three')
  expect(Array.from(list)).toEqual([
    ['b', 'three'],
    ['a', 'two'],
    ['a', 'one'],
  ])
})
