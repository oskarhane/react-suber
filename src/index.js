import React, { Component } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

const BusContext = React.createContext();

export const withBus = createHOCFromRenderProp({
  prop: "bus",
  Consumer: BusContext.Consumer
});

export class BusProvider extends Component {
  render() {
    return (
      <BusContext.Provider value={this.props.bus}>
        {this.props.children}
      </BusContext.Provider>
    );
  }
}

function createHOCFromRenderProp({ prop, Consumer }) {
  return Component => {
    function Wrapper(props, ref) {
      return (
        <Consumer>
          {value => <Component {...{ ...props, [prop]: value, ref }} />}
        </Consumer>
      );
    }
    const upperProp = prop.slice(0, 1).toUpperCase() + prop.slice(1);
    const componentName = Component.displayName || Component.name;
    Wrapper.displayName = `with${upperProp}(${componentName})`;
    return hoistNonReactStatics(React.forwardRef(Wrapper), Component);
  };
}
