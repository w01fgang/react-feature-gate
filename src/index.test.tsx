import React, { ReactChild } from 'react';
import '@testing-library/jest-dom';
import {
  render,
} from '@testing-library/react';

import {
  FeatureGateProvider,
  FeatureGate,
  FeatureSwitch,
  Features,
  useFeature,
} from '.';

const features = Object.freeze({
  feature1: 'default',
  feature2: 'extended',
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

    it('should render children when custom validator returns true', () => {
      const featureFlags = {};
      const validator = () => true;
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={features} validator={validator}>
          <FeatureGate name="feature1">
            <div>Hello</div>
          </FeatureGate>
        </FeatureGateProvider>,
      );

      expect(container).toHaveTextContent('Hello');
    });

    it('should not render children when custom validator returns false', () => {
      const featureFlags = { feature1: 'default' };
      const validator = () => false;
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={features} validator={validator}>
          <FeatureGate name="feature1">
            <div>Hello</div>
          </FeatureGate>
        </FeatureGateProvider>,
      );

      expect(container).not.toHaveTextContent('Hello');
    });
  });

  describe('FeatureGate', () => {
    it('should render feature1', () => {
      const featureFlags = { feature1: 'default' };
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
      const featureFlags = { feature1: 'default' };
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

    it('should render fallback when the flag is absent', () => {
      const featureFlags = {};
      const { container } = renderWithProvider(
        <FeatureGate name="feature1" fallback={<div>Hi</div>}>
          <div>Hello</div>
        </FeatureGate>,
        featureFlags
      );

      expect(container).toHaveTextContent('Hi');
      expect(container).not.toHaveTextContent('Hello');
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

  describe('createFeatures', () => {
    const featuresDefinition = Object.freeze({
      feature1: 'default',
      feature2: 'extended',
      ABtest: 'A',
      BAtest: 'B',
    });

    const features = new Features(featuresDefinition);

    const userFlags = {
      feature1: 'default',
      feature2: 'not-extended',
      ABtest: 'A',
      BAtest: 'A',
    };

    const hasFeature = (name: keyof typeof featuresDefinition) => features.has(userFlags, name);

    it('should correctly identify enabled features', () => {
      expect(hasFeature('feature1')).toBe(true);
      expect(hasFeature('feature2')).toBe(false);
      expect(hasFeature('ABtest')).toBe(true);
      expect(hasFeature('BAtest')).toBe(false);
    });

    it('should return false for non-existent features', () => {
      // @ts-expect-error test of the type definition
      expect(hasFeature('nonExistentFeature')).toBe(false);
    });
  });

  describe('empty string values', () => {
    it('should render children when feature and flag are both empty strings', () => {
      const localFeatures = { theme: '' };
      const featureFlags = { theme: '' };
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={localFeatures}>
          <FeatureGate name="theme">
            <div>Hello</div>
          </FeatureGate>
        </FeatureGateProvider>,
      );

      expect(container).toHaveTextContent('Hello');
    });

    it('should render children (not fallback) in FeatureSwitch when feature and flag are both empty strings', () => {
      const localFeatures = { theme: '' };
      const featureFlags = { theme: '' };
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={localFeatures}>
          <FeatureSwitch fallback={<div>Hi</div>} name="theme">
            <div>Hello</div>
          </FeatureSwitch>
        </FeatureGateProvider>,
      );

      expect(container).toHaveTextContent('Hello');
      expect(container).not.toHaveTextContent('Hi');
    });

    it('should not render children when flag is missing even though feature is an empty string', () => {
      const localFeatures = { theme: '' };
      const featureFlags = {};
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={localFeatures}>
          <FeatureGate name="theme">
            <div>Hello</div>
          </FeatureGate>
        </FeatureGateProvider>,
      );

      expect(container).not.toHaveTextContent('Hello');
    });

    it('should render fallback in FeatureSwitch when flag is empty string but feature does not match', () => {
      const localFeatures = {};
      const featureFlags = { theme: '' };
      const { container } = render(
        <FeatureGateProvider featureFlags={featureFlags} features={localFeatures}>
          <FeatureSwitch fallback={<div>Hi</div>} name="theme">
            <div>Hello</div>
          </FeatureSwitch>
        </FeatureGateProvider>,
      );

      expect(container).toHaveTextContent('Hi');
      expect(container).not.toHaveTextContent('Hello');
    });
  });

  describe('invalid elements', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should render nothing and log an error when FeatureGate children is not a valid element', () => {
      const featureFlags = { feature1: 'true' };
      // @ts-expect-error intentionally invalid element to exercise the runtime guard
      const invalidChildren = <FeatureGate name="feature1">not a valid element</FeatureGate>;
      const { container } = renderWithProvider(
        invalidChildren,
        featureFlags
      );

      expect(container).toBeEmptyDOMElement();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Children prop is not a valid react element');
    });

    it('should render nothing and log an error when FeatureSwitch fallback is not a valid element', () => {
      const featureFlags = { ABtest: 'B' };
      const { container } = renderWithProvider(
        <FeatureSwitch
          // @ts-expect-error intentionally invalid element to exercise the runtime guard
          fallback="not a valid element"
          name="ABtest"
        >
          <div>Hello</div>
        </FeatureSwitch>,
        featureFlags
      );

      expect(container).toBeEmptyDOMElement();
      expect(consoleErrorSpy).toHaveBeenCalledWith('fallback prop is not a valid react element');
    });
  });

  describe('useFeature', () => {
    let result: ReturnType<typeof useFeature> | undefined;

    function Probe({ name }: { name: string }) {
      result = useFeature(name);
      return null;
    }

    afterEach(() => {
      result = undefined;
    });

    it('should report present and enabled when the flag matches the feature', () => {
      const featureFlags = { feature1: 'default' };
      renderWithProvider(<Probe name="feature1" />, featureFlags);

      expect(result).toEqual({
        present: true,
        enabled: true,
        features,
        featureFlags,
      });
    });

    it('should report present but not enabled when the flag does not match the feature', () => {
      const featureFlags = { feature1: 'false' };
      renderWithProvider(<Probe name="feature1" />, featureFlags);

      expect(result).toEqual({
        present: true,
        enabled: false,
        features,
        featureFlags,
      });
    });

    it('should report not present and not enabled when the flag is absent', () => {
      const featureFlags = {};
      renderWithProvider(<Probe name="feature1" />, featureFlags);

      expect(result).toEqual({
        present: false,
        enabled: false,
        features,
        featureFlags,
      });
    });
  });

  describe('outside provider', () => {
    it('should render nothing for FeatureGate without a provider', () => {
      const { container } = render(
        <FeatureGate name="feature1">
          <div>Hello</div>
        </FeatureGate>,
      );

      expect(container).not.toHaveTextContent('Hello');
    });

    it('should render fallback for FeatureGate without a provider', () => {
      const { container } = render(
        <FeatureGate name="feature1" fallback={<div>Hi</div>}>
          <div>Hello</div>
        </FeatureGate>,
      );

      expect(container).toHaveTextContent('Hi');
      expect(container).not.toHaveTextContent('Hello');
    });

    it('should render nothing for FeatureSwitch without a provider', () => {
      const { container } = render(
        <FeatureSwitch fallback={<div>Hi</div>} name="feature1">
          <div>Hello</div>
        </FeatureSwitch>,
      );

      expect(container).not.toHaveTextContent('Hi');
      expect(container).not.toHaveTextContent('Hello');
    });
  });
});
