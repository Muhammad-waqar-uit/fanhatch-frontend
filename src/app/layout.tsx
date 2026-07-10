import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fans.tech',
  description: 'Social-token platform — clubs, keys, chat, and a creator wallet.',
}

/**
 * Dev-only: browser extensions (Bitdefender `bis_skin_checked`, Grammarly, …) rewrite
 * every <div> before React hydrates, which React reports as a hydration-attribute
 * mismatch on every page. `suppressHydrationWarning` only covers the element it's on,
 * not descendants, so it can't silence a whole-tree rewrite. This runs before hydration
 * and drops just that one warning class (extension-signature or the exact attribute-
 * mismatch message). ponytail: real hydration bugs of ours are ruled out (deterministic
 * renders); if you ever suspect one, comment this out to see it.
 */
const SUPPRESS_EXT_HYDRATION = `(function(){var s=['bis_skin_checked','bis_register','__processed_','data-gr-','data-new-gr','cz-shortcut-listen','grammarly'],o=console.error;console.error=function(){try{var m='';for(var i=0;i<arguments.length;i++){var a=arguments[i];m+=(typeof a==='string'?a:(a&&a.toString?a.toString():''))+' '}if(s.some(function(x){return m.indexOf(x)!==-1})||m.indexOf('hydrated but some attributes')!==-1)return}catch(e){}return o.apply(console,arguments)}})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: extensions inject attributes onto <html>/<body> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {process.env.NODE_ENV !== 'production' ? (
          // eslint-disable-next-line react/no-danger
          <script dangerouslySetInnerHTML={{ __html: SUPPRESS_EXT_HYDRATION }} />
        ) : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
