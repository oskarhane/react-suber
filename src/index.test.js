/* global test, expect, jest */
import preact from 'preact'
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
    return <div>Yo</div>
  }

  // When
  const BusComponent = withBus(fnComponent)
  const component = mount(<BusComponent orig='myProp' />)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalled()
  expect(component.text()).toEqual('Yo')
})

test('passes the bus prop to a functional component with children', () => {
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
  const component = mount(<BusComponent orig='myProp'><FnChildrenComponent /></BusComponent>)

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined()
  expect(makeSureCalled).toHaveBeenCalledTimes(2)
  expect(component.text()).toEqual('Hello')
})

test('passes the bus prop to a regular component', () => {
  // Given
  const makeSureCalled = jest.fn()
  class MyComponent extends preact.Component {
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
  class MyInnerComponent extends preact.Component {
    render () {
      makeSureCalled()
      return <span>Hello, {this.props.children}</span>
    }
  }
  class MyComponent extends preact.Component {
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

test('communication works', () => {
  // Given
  class WarningBanner extends preact.Component {
    constructor () {
      super()
      this.state = {
        warning: null
      }
    }
    componentDidMount () {
      // Start listening for events on component mount
      // When something arrives, set component state to the warning message
      this.stop = this.props.bus.take('SHOW_WARNING', (msg) => {
        this.setState({ warning: msg.warning })
      })
    }
    componentWillUnmount () {
      // Stop listening on unmount
      this.stop()
    }
    render () {
      // Show the warning (if present)
      if (!this.state.warning) return <div className='no-warning' />
      return <blink>{ this.state.warning }</blink>
    }
  }
  const SenderButton = ({ bus, children }) => {
    const onClick = () => bus.send('SHOW_WARNING', { warning: 'Hacking detected!' })
    return <button onClick={onClick}>{ children }</button>
  }

  // When
  const WarningBannerWithBus = withBus(WarningBanner)
  const SenderButtonWithBus = withBus(SenderButton)
  const wrapper = mount(
    <div>
      <WarningBannerWithBus />
      <SenderButtonWithBus>Click</SenderButtonWithBus>
    </div>
  )

  // Then
  expect(wrapper.find('.no-warning').length).toBe(1)
  expect(wrapper.find('blink').length).toBe(0)

  // When
  wrapper.find('button').simulate('click')

  // Then
  expect(wrapper.find('.no-warning').length).toBe(0)
  expect(wrapper.find('blink').length).toBe(1)
  expect(wrapper.find('blink').text()).toBe('Hacking detected!')
})
