import React, { ReactChild, createRef } from 'react';
import '@testing-library/jest-dom';
import {
  render,
} from '@testing-library/react';

import {
  FeatureGateProvider,
  FeatureGate,
  FeatureSwitch,
  useFeature,
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
      const featureFlags = { feature1: 'true' };
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

    it('should render fallback when feature is disabled', () => {
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

    it('should forward ref and spread extra props to the child', () => {
      const featureFlags = { feature1: 'true' };
      const ref = createRef<HTMLDivElement>();
      const { container } = renderWithProvider(
        <FeatureGate name="feature1" ref={ref} data-testid="gated">
          <div>Hello</div>
        </FeatureGate>,
        featureFlags
      );

      expect(ref.current).toBe(container.querySelector('div'));
      expect(ref.current).toHaveAttribute('data-testid', 'gated');
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
      const { container } = renderWithProvider(
        <FeatureGate name="feature1">
          not a valid element
        </FeatureGate>,
        featureFlags
      );

      expect(container).toBeEmptyDOMElement();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Children prop is not a valid react element');
    });

    it('should render nothing and log an error when FeatureSwitch fallback is not a valid element', () => {
      const featureFlags = { ABtest: 'B' };
      const { container } = renderWithProvider(
        <FeatureSwitch fallback="not a valid element" name="ABtest">
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
      const featureFlags = { feature1: 'true' };
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
