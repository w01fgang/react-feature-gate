import React, { ReactChild  } from 'react';
import '@testing-library/jest-dom';
import {
  render,
} from '@testing-library/react';

import {
  FeatureGateProvider,
  FeatureGate,
  FeatureSwitch
} from '.';

const features = Object.freeze({
  feature1: 'true',
  ABtest: 'A',
});

const renderWithProvider = (ui: ReactChild, featureFlags: Record<string, string>) => render(
  <FeatureGateProvider featureFlags={featureFlags} features={features}>
    {ui}
  </FeatureGateProvider>
)

const TestComponent = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div {...props} ref={ref} data-testid="test-component" />
));

describe('FeatureGate', () => {
  describe('FeatureGateProvider', () => {
    it('should render children', () => {
      const featureFlags = {};
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={features}>
          <div>Hello</div>
        </FeatureGateProvider>,
      );

      expect(container).toHaveTextContent('Hello');
    });

    it('should use custom validator', () => {
      const featureFlags = {};
      const validator = jest.fn(() => true);
      render(
        <FeatureGateProvider featureFlags={featureFlags} features={features} validator={validator}>
          <FeatureGate name="feature1">
            <div>Hello</div>
          </FeatureGate>
        </FeatureGateProvider>,
      );

      expect(validator).toBeCalledWith({
        features,
        featureFlags,
        name: 'feature1',
      });
    });
  });

  describe('FeatureGate', () => {
    it('should render feature1', () => {
      const featureFlags = { feature1: 'true' };
      const { container } = renderWithProvider(
        <FeatureGate name="feature1">
          <div>Hello</div>
        </FeatureGate>,
        featureFlags
      );

      expect(container).toHaveTextContent('Hello');
    });

    it('should not render feature1', () => {
      const featureFlags = { feature1: 'true' };
      const { container } = renderWithProvider(
        <FeatureGate name="feature2">
          <div>Hello</div>
        </FeatureGate>,
        featureFlags
      );

      expect(container).not.toHaveTextContent('Hello');
    });

    it('should forward ref to the wrapped component', () => {
      const featureFlags = { feature1: 'true' };
      const ref = React.createRef<HTMLDivElement>();
      const { getByTestId } = renderWithProvider(
        <FeatureGate name="feature1">
          <TestComponent ref={ref} />
        </FeatureGate>,
        featureFlags
      );

      const testComponent = getByTestId('test-component');
      expect(ref.current).toBe(testComponent);
    });

    it('should render fallback when feature is not enabled', () => {
      const featureFlags = { feature1: 'false' };
      const { container } = renderWithProvider(
        <FeatureGate name="feature1" fallback={<div>Fallback</div>}>
          <div>Hello</div>
        </FeatureGate>,
        featureFlags
      );

      expect(container).toHaveTextContent('Fallback');
    });


  });

  describe('FeatureSwitch', () => {
    it('should render ABtest A', () => {
      const featureFlags = { ABtest: 'A' };
      const { container } = renderWithProvider(
        <FeatureSwitch fallback={<div>Hi</div>}  name="ABtest">
          <div>Hello</div>
        </FeatureSwitch>,
        featureFlags
      );

      expect(container).toHaveTextContent('Hello');
    });

    it('should not render ABtest B', () => {
      const featureFlags = { ABtest: 'B' };
      const { container } = renderWithProvider(
        <FeatureSwitch fallback={<div>Hi</div>} name="ABtest">
          <div>Hello</div>
        </FeatureSwitch>,
        featureFlags
      );

      expect(container).toHaveTextContent('Hi');
    });

    it('should not render anything', () => {
      const featureFlags = {};
      const { container } = renderWithProvider(
        <FeatureSwitch fallback={<div>Hi</div>} name="ABtest">
          <div>Hello</div>
        </FeatureSwitch>,
        featureFlags
      );

      expect(container).not.toHaveTextContent('Hi');
      expect(container).not.toHaveTextContent('Hello');
    });

    it('should forward ref to the wrapped component', () => {
      const featureFlags = { ABtest: 'A' };
      const ref = React.createRef<HTMLDivElement>();
      const { getByTestId } = renderWithProvider(
        <FeatureSwitch fallback={<div>Hi</div>} name="ABtest">
          <TestComponent ref={ref} />
        </FeatureSwitch>,
        featureFlags
      );

      const testComponent = getByTestId('test-component');
      expect(ref.current).toBe(testComponent);
    });

    it('should not render if fallback prop is invalid in FeatureSwitch', () => {
      const featureFlags = { ABtest: 'B' };
      const { container } = renderWithProvider(
        <FeatureSwitch fallback={<div>Fallback</div>} name="ABtest">
          <div>Hello</div>
        </FeatureSwitch>,
        featureFlags
      );

      expect(container).toHaveTextContent('Fallback');
    });
  });
});
