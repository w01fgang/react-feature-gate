import React, { ReactElement, ReactNode } from 'react'
import { FeatureGate } from 'feature-gate';
import Link from 'next/link'
import Head from 'next/head'

type Props = {
  children: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props): ReactElement => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header>
      <nav>
        <Link href="/">
          <a>Home</a>
        </Link>
        {' | '}
        <Link href="/about">
          <a>About</a>
        </Link>

        <FeatureGate name="users">
          <>
            {' | '}
            <Link href="/users">
              <a>Users List</a>
            </Link>
          </>
        </FeatureGate>

        <FeatureGate name="users-api">
          <span>{' | '}<a href="/api/users">Users API</a></span>
        </FeatureGate>
      </nav>
    </header>
    {children}
    <footer>
      <hr />
      <span>I&apos;m here to stay (Footer)</span>
    </footer>
  </div>
)

export default Layout
