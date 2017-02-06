import React from 'react'
import { getBus } from 'suber'

export const withBus = (BaseComponent) => {
  if (!BaseComponent) return null
  return (...args) => {
    return <BaseComponent {...args[0]} bus={getBus()} />
  }
}
