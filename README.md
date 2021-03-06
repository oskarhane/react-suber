<p align="center">
  <br>
  <b>react-suber</b>
  <br>
  <br>
  <a href="https://www.npmjs.com/package/react-suber">
    <img src="https://img.shields.io/npm/v/react-suber.svg?style=flat" alt="npm">
  </a>
  <a href="https://travis-ci.org/oskarhane/react-suber">
    <img src="https://travis-ci.org/oskarhane/react-suber.svg?branch=master" alt="travis">
  </a>
</p>

Binding function `withBus` between [React](https://github.com/facebook/react) and [Suber](https://github.com/oskarhane/suber).

## Usage

Install:

```bash
yarn add react-suber
# or
npm install react-suber --save
```

Usage:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { withBus } from 'react-suber'

// Create a component that will listen on the 'SHOW_WARNING' channel
// It expects 'bus' as a prop
class WarningBanner extends React.Component {
  constructor () {
    super()
    this.state = {
      warning: null
    }
  }
  componentDidMount() {
    // Start listening for events on component mount
    // When something arrives, set component state to the warning message
    this.stop = this.props.bus.take('SHOW_WARNING', (msg) => {
      this.setState({ warning: msg.warning })
    })
  }
  componentWillUnmount() {
    // Stop listening on unmount
    this.stop()
  }
  render () {
    // Show the warning (if present)
    if (!this.state.warning) return null
    return <blink>{ this.state.warning }</blink>
  }
}

// Create a component will can send on the 'SHOW_WARNING' channel
// when clicked. It expects 'bus' as a prop
const SenderButton = ({ bus, children }) => {
  const onClick = () => bus.send('SHOW_WARNING', { warning: 'Hacking detected!' })
  return <button onClick={ onClick }>{ children }</button>
}

// To automatically pass the bus to these components
// we wrap them with 'withBus'
const WarningBannerWithBus = withBus(WarningBanner)
const SenderButtonWithBus = withBus(SenderButton)

// We use these wrapped components just as we
// would with the original components
ReactDOM.render(
  <div>
    <WarningBannerWithBus />
    <SenderButtonWithBus>Click me!!!</SenderButtonWithBus>
  </div>
  , document.getElementById('app')
)
```

## API

### Functions
- [`withBus`](#withBus)

### <a id="withBus"></a> `withBus(component)`
Returns the wrapped component with the `bus` prop injected.

#### Arguments
- `component: Component` React component. Can be PureComponent or regular Component

#### Returns a new React Component

## Development setup

```bash
yarn
npm run dev
```
