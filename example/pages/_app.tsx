import { useState, ReactElement } from 'react';
import { FeatureGateProvider } from 'feature-gate';
// import App from "next/app";
import type { AppProps /*, AppContext */ } from 'next/app';
import FeatureSelector from '../components/FeatureSelector'

const rules = Object.freeze({
  feature1: 'true',
  ABtest: 'A',
});

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  const [featureFlags, setFlags] = useState({});
  return (
    <FeatureGateProvider featureFlags={featureFlags} features={rules}>
      <>
        <FeatureSelector onChange={setFlags} />
        <Component {...pageProps} />
      </>
    </FeatureGateProvider>
  )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext: AppContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);

//   return { ...appProps }
// }

export default MyApp
