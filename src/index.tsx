import React, {
  useContext,
  createContext,
  cloneElement,
  forwardRef,
  isValidElement,
  Context,
  Ref,
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

function Gate({ children, name, fallback, ...other }: ConsumerProps, ref: Ref<HTMLElement>) {
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

  return cloneElement(children, { ref, ...other });
}

export const FeatureGate = forwardRef(Gate);

function Switch({ children, name, fallback, ...other }: SwitchProps, ref: Ref<HTMLElement>) {
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

  if (!enabled) return cloneElement(fallback, { ref, ...other });

  return cloneElement(children, { ref, ...other });
}

export const FeatureSwitch = forwardRef<HTMLElement, SwitchProps>(Switch);
