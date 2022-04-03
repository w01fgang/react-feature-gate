import { ChangeEvent, ReactElement } from 'react';
import { useFeature } from 'feature-gate';

const removeUndefined = (val: Record<string, string | undefined>) => JSON.parse(JSON.stringify(val));

type Props = {
  onChange: (flags: Record<string, string>) => void,
};

const FeatureSelector = (props: Props): ReactElement => {
  const { featureFlags, features } = useFeature("users");
  console.log("🚀 ~ file: FeatureSelector.tsx ~ line 10 ~ FeatureSelector ~ featureFlags", featureFlags)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.getAttribute('data-value');
    if (e.target.checked) {
      const newFlags = { ...featureFlags, [e.target.name]: value };
      props.onChange(newFlags);
    } else {
      const newFlags = { ...featureFlags, [e.target.name]: undefined };
      props.onChange(removeUndefined(newFlags));
    }
  };

  return (
    <div id="feature-selector">
      <span>Select features:</span>
      <div className="container">
        {Object.entries(features).map(([feature, flag]) => (
          <div key={feature}>
            <input
              type="checkbox"
              id={feature}
              name={feature}
              data-value={flag}
              checked={featureFlags[feature] === flag}
              onChange={handleChange}
            />
            <label htmlFor={feature}>{feature}</label>
          </div>
        ))}

        <div>
          <input
            type="checkbox"
            id="ABtest"
            name="ABtest"
            data-value={'B'}
            checked={featureFlags['ABtest'] === 'B'}
            onChange={handleChange}
          />
          <label htmlFor="ABtest">ABtest - B</label>
        </div>
      </div>
      <style jsx>{`
          #feature-selector {
            margin: 8px 0;
          }
          .container {
            display: flex;
            gap: 8px;
            padding: 8px;
          }
      `}</style>
    </div>
  )
}

export default FeatureSelector
