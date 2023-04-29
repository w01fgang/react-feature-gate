import React, {
  useContext,
  createContext,
  forwardRef,
  isValidElement,
  Context,
  ReactChild,
  ReactElement,
} from "react";

export type Rules = {
  featureFlags: Record<string, string>,
  features: Record<string, string>,
  validator?: (params: Rules & { name: string }) => boolean,
};

const FeatureContext: Context<Rules> = createContext({
  featureFlags: {},
  features: {},
});

type ProviderProps = {
  children: ReactChild,
} & Rules;

type ConsumerProps = {
  children: ReactChild,
  fallback?: ReactChild,
  name: string,
};

type SwitchProps = {
  children: ReactChild,
  fallback: ReactChild,
  name: string,
};

export function FeatureGateProvider({ children, featureFlags, features, validator }: ProviderProps): ReactElement {
  return (
    <FeatureContext.Provider value={{ featureFlags, features, validator }}>
      {children}
    </FeatureContext.Provider>
  )
}

const hasFeature = ({ features, featureFlags, name }: Rules & { name: string }): boolean => {
  const feature = featureFlags[name];
  if (!feature) return false;

  return features[name] === feature;
};

export function useFeature(name: string): Rules & { enabled: boolean, present: boolean } {
  const { featureFlags, features, validator = hasFeature }: Rules = useContext(FeatureContext);

  const present = Boolean(featureFlags[name]);
  const enabled = validator({ features, featureFlags, name });
  return { present, enabled, features, featureFlags };
}

function Gate({ children, name, fallback }: ConsumerProps) {
  const { enabled } = useFeature(name);

  if (!isValidElement(children)) {
    console.error("Children prop is not a valid react element");
    return null;
  }

  if (fallback !== undefined && !isValidElement(fallback)) {
    console.error("Children prop is not a valid react element");
    return null;
  }

  if (!enabled) return fallback || null;

  return children;
}

export const FeatureGate = forwardRef(Gate);

function Switch({ children, name, fallback }: SwitchProps) {
  const { enabled, present } = useFeature(name);

  if (!isValidElement(fallback)) {
    console.error("fallback prop is not a valid react element");
    return null;
  }

  if (!isValidElement(children)) {
    console.error("children prop is not a valid react element");
    return null;
  }

  if (!present) return null;

  if (!enabled) return fallback;

  return children;
}

export const FeatureSwitch = forwardRef<HTMLElement, SwitchProps>(Switch);

export class Features<T extends Record<string, string>> {
  validator: typeof hasFeature;

  constructor(
    public features: T,
    validator?: typeof hasFeature
  ) {
    this.features = features;
    this.validator = validator || hasFeature;
  }

  public has<K extends keyof T>(featureFlags: Record<string, string>, name: K): boolean {
    return this.validator({ features: this.features, featureFlags, name: name as string });
  }
}
