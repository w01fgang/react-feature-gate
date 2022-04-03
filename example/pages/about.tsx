import { ReactElement } from 'react';
import Link from 'next/link'
import Layout from '../components/Layout'
import { FeatureGate } from 'feature-gate';

const AboutPage = (): ReactElement => (
  <Layout title="About | Next.js + TypeScript Example">
    <h1>About</h1>
    <p>This is the about page</p>
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>

    <FeatureGate name="feature1">
      <>
        <p>This is an experimental feature 1</p>
        <p>This is an experimental feature 1</p>
        <p>This is an experimental feature 1</p>
        <p>This is an experimental feature 1</p>
      </>
    </FeatureGate>
  </Layout>
)

export default AboutPage
