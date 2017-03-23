import { h, Component } from 'preact'

export function BusNotFoundError () {
  this.name = 'BusNotFoundError'
  this.message = 'Suber bus not found in context. Did you wrap your app in <BusProvider>?'
  this.stack = (new Error()).stack
}
BusNotFoundError.prototype = Object.create(Error.prototype)
BusNotFoundError.prototype.constructor = BusNotFoundError

export const withBus = (BaseComponent) => {
  if (!BaseComponent) return null
  return (props, context) => {
    if (!context.bus) {
      throw new BusNotFoundError()
    }
    return h(
      BaseComponent,
      Object.assign(
        {},
        Object.assign({}, props),
        { bus: context.bus }
      )
    )
  }
}

export class BusProvider extends Component {
  getChildContext () {
    return { bus: this.props.bus }
  }
  render (props) {
    return props.children && props.children[0] || null
  }
}
