/* global test, expect, jest */
import React from "react";
import { render, Simulate } from "react-testing-library";
import "jest-dom/extend-expect";

import { createBus } from "suber";
import { withBus, BusProvider } from "./";

test("exposes the withBus wrapper function", () => {
  const wb = withBus(() => <div />);
  expect(wb).toBeDefined();
});

test("withBus passes the bus prop to a functional component", () => {
  // Given
  const bus = createBus();
  const makeSureCalled = jest.fn();
  const FnComponent = props => {
    makeSureCalled();
    expect(props.bus.take).toBeDefined();
    expect(props.orig).toEqual("myProp");
    return <div>Yo</div>;
  };
  // When
  const MyComp = withBus(FnComponent);
  const { container } = render(
    <BusProvider bus={bus}>
      <MyComp orig="myProp" />
    </BusProvider>
  );

  // Then
  // See more assertion in component
  expect(makeSureCalled).toHaveBeenCalled();
  expect(container).toMatchSnapshot();
});

test("passes the bus prop to a functional component with children", () => {
  // Given
  const bus = createBus();
  const makeSureCalled = jest.fn();

  const FnChildrenComponent = () => {
    makeSureCalled();
    return <span key="1">Hello</span>;
  };

  const fnComponent = props => {
    makeSureCalled();
    expect(props.bus.take).toBeDefined();
    expect(props.orig).toEqual("myProp");
    return <div>{props.children}</div>;
  };

  // When
  const BusComponent = withBus(fnComponent);
  const { container } = render(
    <BusProvider bus={bus}>
      <BusComponent orig="myProp">
        <FnChildrenComponent />
      </BusComponent>
    </BusProvider>
  );

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined();
  expect(makeSureCalled).toHaveBeenCalledTimes(2);
  expect(container).toMatchSnapshot();
});

test("withBus passes the bus prop to a regular component", () => {
  // Given
  const bus = createBus();
  const makeSureCalled = jest.fn();
  class MyComponent extends React.Component {
    render() {
      makeSureCalled();
      expect(this.props.bus.take).toBeDefined();
      expect(this.props.orig).toEqual("myProp");
      return <h1>Hello, {this.props.name}</h1>;
    }
  }
  // When
  const BusComponent = withBus(MyComponent);
  const { container } = render(
    <BusProvider bus={bus}>
      <BusComponent orig="myProp" name="Stella" />
    </BusProvider>
  );

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined();
  expect(makeSureCalled).toHaveBeenCalled();
  expect(container).toMatchSnapshot();
});

test("withBus passes the bus prop to a regular component with children", () => {
  // Given
  const bus = createBus();
  const makeSureCalled = jest.fn();
  class MyInnerComponent extends React.Component {
    render() {
      makeSureCalled();
      return <span>Hello, {this.props.children}</span>;
    }
  }
  class MyComponent extends React.Component {
    render() {
      expect(this.props.bus.take).toBeDefined();
      expect(this.props.orig).toEqual("myProp");
      return (
        <h1>
          <MyInnerComponent>{this.props.name}</MyInnerComponent>
        </h1>
      );
    }
  }
  // When
  const BusComponent = withBus(MyComponent);
  const { container } = render(
    <BusProvider bus={bus}>
      <BusComponent orig="myProp" name="Molly" />
    </BusProvider>
  );

  // Then
  // See more assertion in component
  expect(BusComponent).toBeDefined();
  expect(makeSureCalled).toHaveBeenCalled();
  expect(container).toMatchSnapshot();
});

test("communication works", () => {
  // Given
  const bus = createBus();
  class WarningBanner extends React.Component {
    constructor() {
      super();
      this.state = {
        warning: null
      };
    }
    componentDidMount() {
      // Start listening for events on component mount
      // When something arrives, set component state to the warning message
      this.stop = this.props.bus.take("SHOW_WARNING", msg => {
        this.setState({ warning: msg.warning });
      });
    }
    componentWillUnmount() {
      // Stop listening on unmount
      this.stop();
    }
    render() {
      // Show the warning (if present)
      if (!this.state.warning)
        return <div data-testid="no-warning" className="no-warning" />;
      return <blink data-testid="warning">{this.state.warning}</blink>;
    }
  }
  const SenderButton = ({ bus, children }) => {
    const onClick = () =>
      bus.send("SHOW_WARNING", { warning: "Hacking detected!" });
    return (
      <button data-testid="click-btn" onClick={onClick}>
        {children}
      </button>
    );
  };

  // When
  const WarningBannerWithBus = withBus(WarningBanner);
  const SenderButtonWithBus = withBus(SenderButton);
  const { container, getByText, queryByTestId } = render(
    <BusProvider bus={bus}>
      <WarningBannerWithBus />
      <SenderButtonWithBus>Click</SenderButtonWithBus>
    </BusProvider>
  );

  // Then
  expect(queryByTestId("no-warning")).not.toBeNull();
  expect(queryByTestId("warning")).toBeNull();
  expect(container).toMatchSnapshot();

  // When
  Simulate.click(getByText("Click"));

  // Then
  expect(queryByTestId("no-warning")).toBeNull();
  expect(queryByTestId("warning")).not.toBeNull();
  expect(container).toMatchSnapshot();
});
