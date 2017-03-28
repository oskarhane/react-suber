/* global jest, test, expect */
import render from 'preact-render-to-string'
import { h, Component } from 'preact'
/** @jsx h */
import { createBus } from 'suber'
import { withBus, BusProvider, BusNotFoundError } from './'

test('exposes the withBus wrapper function', () => {
  const wb = withBus()
  expect(wb).toBeDefined()
})

test('BusProvider passes the bus in context', () => {
  // Given
  const makeSureCalled = jest.fn()
  const FnComponent = (props, context) => {
    makeSureCalled()
    expect(context.bus.take).toBeDefined()
    expect(props.orig).toEqual('myProp')
    return <div>Yo</div>
  }
  // When
  const component = render(<BusProvider bus={createBus()}><FnComponent orig='myProp' /></BusProvider>)

  // Then
  // See more assertion in component
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component).toMatchSnapshot()
})

test('withBus throws BusNotFoundError when bus isnt in context', () => {
  // Given
  const fnComponent = (props, context) => {
    return <div>Yo</div>
  }
  // When
  const BusComponent = withBus(fnComponent)

  // Then
  expect(() => render(<BusComponent orig='myProp' />)).toThrow(new BusNotFoundError())
})

test('withBus passes the bus prop and it can be used', () => {
  // Given
  const channel = 'mychannel'
  const data = {x: 1}
  const cb = jest.fn()
  const fnComponent = (props) => {
    expect(props.bus.take).toBeDefined()
    props.bus.send(channel, props.data)
    return null
  }
  const bus = createBus()

  // When
  bus.take(channel, cb)
  const BusComponent = withBus(fnComponent)
  render(<BusProvider bus={bus}><BusComponent data={data} /></BusProvider>)

  // Then
  // See more assertion in component
  expect(cb).toHaveBeenCalledWith(data)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('withBus passes the bus prop to a functional component', () => {
  // Given
  const makeSureCalled = jest.fn()
  const fnComponent = (props) => {
    makeSureCalled()
    expect(props.bus.take).toBeDefined()
    expect(props.orig).toEqual('myProp')
    return <div>Yo</div>
  }

  // When
  const BusComponent = withBus(fnComponent)
  const component = render(<BusProvider bus={createBus()}><BusComponent orig='myProp' /></BusProvider>)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component).toMatchSnapshot()
})

test('withBus passes the bus prop to a functional component with children', () => {
  // Given
  const makeSureCalled = jest.fn()

  const FnChildrenComponent = () => {
    makeSureCalled()
    return <span key='1'>Hello</span>
  }

  const fnComponent = (props) => {
    makeSureCalled()
    expect(props.bus.take).toBeDefined()
    expect(props.orig).toEqual('myProp')
    return <div>{props.children}</div>
  }

  // When
  const BusComponent = withBus(fnComponent)
  const component = render(
    <BusProvider bus={createBus()}>
      <BusComponent orig='myProp'>
        <FnChildrenComponent />
      </BusComponent>
    </BusProvider>
  )

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalledTimes(2)
  expect(component).toMatchSnapshot()
})

test('withBus passes the bus prop to a regular component', () => {
  // Given
  const makeSureCalled = jest.fn()
  class MyComponent extends Component {
    render () {
      makeSureCalled()
      expect(this.props.bus.take).toBeDefined()
      expect(this.props.orig).toEqual('myProp')
      return <h1>Hello, {this.props.name}</h1>
    }
  }
  // When
  const BusComponent = withBus(MyComponent)
  const component = render(<BusProvider bus={createBus()}><BusComponent orig='myProp' name='Stella' /></BusProvider>)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component).toMatchSnapshot()
})

test('withBus passes the bus prop to a regular component with children', () => {
  // Given
  const makeSureCalled = jest.fn()
  class MyInnerComponent extends Component {
    render () {
      makeSureCalled()
      return <span>Hello, {this.props.children}</span>
    }
  }
  class MyComponent extends Component {
    render () {
      expect(this.props.bus.take).toBeDefined()
      expect(this.props.orig).toEqual('myProp')
      return <h1><MyInnerComponent>{this.props.name}</MyInnerComponent></h1>
    }
  }
  // When
  const BusComponent = withBus(MyComponent)
  const component = render(<BusProvider bus={createBus()}><BusComponent orig='myProp' name='Molly' /></BusProvider>)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component).toMatchSnapshot()
})
