# React permission gate
inspired by https://isamatov.com/react-permissions-and-roles/

Easily render or hide pieces of UI relative to the user's access role.

### Supports Typescript and Flow type


### Example
full example [here](example)
```javascript
import { FeatureGateProvider } from 'feature-gate';

// define or get from api features and freeze them
const features = Object.freeze({
  feature1: 'true',
  ABtest: 'A',
});

function MyApp() {
  const featureFlags = {}; // get from user api

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
  <div>Component available for authorized user</div>
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
{showFeature1 && <div>Component available for authorized user</div>}
```
### Advanced usage
A validator function can be provided
```javascript
import { FeatureGateProvider } from 'feature-gate';
...

// define or get from api rules and freeze them
const features = Object.freeze({
  feature1: 'true',
  ABtest: 'A',
});

function validator({ featureFlags, features, name }) {
  // default validator implementation
  const feature = featureFlags[name];
  if (!feature) return false;

  return features[name] === feature;
}

function MyApp() {
  const featureFlags = {}; // get from user api

  return (
    <FeatureGateProvider featureFlags={featureFlags} features={features} validator={validator}>
      <App />
    </FeatureGateProvider>
  )
}
```
