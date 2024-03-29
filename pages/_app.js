import "nextra-theme-blog/style.css"
import Head from "next/head"

import { Prism } from "prism-react-renderer";
(typeof global !== "undefined" ? global : window).Prism = Prism
await import("prismjs/components/prism-applescript")

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS"
          href="/rss.xml"
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
