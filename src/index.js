import React from 'react'
import { getBus } from 'suber'

export const withBus = (BaseComponent) => {
  if (!BaseComponent) return null
  return (...args) => {
    return React.createElement(
      BaseComponent,
      Object.assign({}, args[0], { bus: getBus() }),
      args[0].children
    )
  }
}
