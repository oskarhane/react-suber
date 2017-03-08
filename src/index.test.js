/* global test, expect */
import { withBus } from './'

// See react-suber branch for enzyme tests

test('exposes the withBus wrapper function', () => {
  const wb = withBus()
  expect(wb).toBeDefined()
})
