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
});
