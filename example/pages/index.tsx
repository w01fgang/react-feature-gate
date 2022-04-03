import { ReactNode } from 'react';
import Link from 'next/link'
import Layout from '../components/Layout'
import { FeatureGate, FeatureSwitch } from 'feature-gate';

const IndexPage = (): ReactNode => {
  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
      <p>
        <Link href="/about">
          <a>About</a>
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

      <FeatureSwitch fallback={<p>This is an A/B testing: Variant B</p>} name="ABtest">
        <p>This is an A/B testing: Variant A</p>
      </FeatureSwitch>
    </Layout>
  )
}

export default IndexPage
