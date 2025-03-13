import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import { type AppProps } from "next/app"
import Head from "next/head"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { ErrorBoundary } from "react-error-boundary"
import { Toaster } from "react-hot-toast"
import { Layout } from "../components/Common"

import { OpenAPI } from "~/api-client"
import { APPLICATION_TITLE } from "~/utils"

import "~/styles/data-table.css"
import "~/styles/tailwind.css"
import "~/styles/globals.css"

dayjs.extend(localizedFormat)

OpenAPI.BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/.*$/, "")
OpenAPI.WITH_CREDENTIALS = true

const MyApp = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => (
  <SessionProvider session={session}>
    <Head>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#000000" />
      <link rel="apple-touch-icon" href="/icons/icon1.png" />
      <title>{APPLICATION_TITLE}</title>
      <meta name="A GenAI POC application @ BCG.X" content="By BCG X" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <ThemeProvider>
      <Layout>
        <ErrorBoundary fallback={null}>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
    </ThemeProvider>
    <Toaster />
  </SessionProvider>
)

export default MyApp
