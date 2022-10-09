# React feature gate
inspired by https://github.com/w01fgang/react-permission-gate

Easily render or hide pieces of UI relative to the user's feature flags.

### Supports Typescript and Flow type


### Example
full example [here](example)
```javascript
import { FeatureGateProvider } from 'feature-gate';

// define or get from api features and freeze them
const features = Object.freeze({
  feature1: 'default',
  feature2: 'extended',
  ABtest: 'A',
});

function MyApp() {
  const featureFlags = {  // get from user api
    feature1: 'default',
    feature2: 'none',
    ABtest: 'B',
  };

  return (
    <FeatureGateProvider featureFlags={featureFlags} features={features}>
      <App />
    </FeatureGateProvider>
  )
}
```
then anywhere in the app use names of features defined in the features map

```javascript
import { FeatureGate } from 'feature-gate';

<FeatureGate name="feature1">
  <div>Component available for user with feature1 enabled</div>
</FeatureGate>

```
```javascript
import { FeatureSwitch } from 'feature-gate';

<FeatureSwitch name="ABtest" fallback={<div>B test</div>}>
  <div>A test</div>
</FeatureSwitch>

```
or use hook
```javascript
import { useFeature } from 'feature-gate';
...

const { enabled: showFeature1 } = useFeature('feature1');
// feature status for the current user
...
{showFeature1 && <div>Component available for user with feature1 enabled</div>}
```
### Advanced usage
A validator function can be provided
```javascript
import { FeatureGateProvider } from 'feature-gate';
...

// define or get from api rules and freeze them
const features = Object.freeze({
  feature1: 'default',
  ABtest: 'A',
});

function validator({ featureFlags, features, name }) {
  // default validator implementation
  const feature = featureFlags[name];
  if (!feature) return false;

  return features[name] === feature;
}

function MyApp() {
  const featureFlags = { // get from user api
    feature1: 'off',
    ABtest: 'A',
  };

  return (
    <FeatureGateProvider featureFlags={featureFlags} features={features} validator={validator}>
      <App />
    </FeatureGateProvider>
  )
}
```
