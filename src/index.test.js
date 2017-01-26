/* global test, expect, jest */
import React from 'react'
import { shallow, mount } from 'enzyme'
import { withBus } from './'

test('exposes the withBus wrapper function', () => {
  const wb = withBus()
  expect(wb).toBeDefined()
})

test('passes the bus prop to a functional component', () => {
  // Given
  const makeSureCalled = jest.fn()
  const fnComponent = (props) => {
    makeSureCalled()
    expect(props.bus.take).toBeDefined()
    expect(props.orig).toEqual('myProp')
    return React.createElement('div', null, 'Yo')
  }

  // When
  const busComponent = withBus(fnComponent)({orig: 'myProp'})
  const component = shallow(busComponent)

  // Then
  // See more assertion in component
  expect(busComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component.text()).toEqual('Yo')
})

test('passes the bus prop to a functional component with children', () => {
  // Given
  const makeSureCalled = jest.fn()

  const fnChildrenComponent = () => {
    makeSureCalled()
    return React.createElement('span', { key: 1 }, 'Hello')
  }

  const fnComponent = (props) => {
    makeSureCalled()
    expect(props.bus.take).toBeDefined()
    expect(props.orig).toEqual('myProp')
    return React.createElement('div', null, props.children)
  }

  // When
  const busComponent = withBus(fnComponent)({ orig: 'myProp', children: [fnChildrenComponent()] })
  const component = shallow(busComponent)

  // Then
  // See more assertion in component
  expect(busComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalledTimes(2)
  expect(component.text()).toEqual('Hello')
})

test('passes the bus prop to a regular component', () => {
  // Given
  const makeSureCalled = jest.fn()
  class MyComponent extends React.Component {
    render () {
      makeSureCalled()
      expect(this.props.bus.take).toBeDefined()
      expect(this.props.orig).toEqual('myProp')
      return <h1>Hello, {this.props.name}</h1>
    }
  }
  // When
  const BusComponent = withBus(MyComponent)
  const component = mount(<BusComponent orig='myProp' name='Stella' />)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component.text()).toEqual('Hello, Stella')
})

test('passes the bus prop to a regular component with children', () => {
  // Given
  const makeSureCalled = jest.fn()
  class MyInnerComponent extends React.Component {
    render () {
      makeSureCalled()
      return <span>Hello, {this.props.children}</span>
    }
  }
  class MyComponent extends React.Component {
    render () {
      expect(this.props.bus.take).toBeDefined()
      expect(this.props.orig).toEqual('myProp')
      return <h1><MyInnerComponent>{this.props.name}</MyInnerComponent></h1>
    }
  }
  // When
  const BusComponent = withBus(MyComponent)
  const component = mount(<BusComponent orig='myProp' name='Molly' />)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component.text()).toEqual('Hello, Molly')
})
