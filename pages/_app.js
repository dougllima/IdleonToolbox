import React from "react";
import { CacheProvider, ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import '../polyfills';
import createEmotionCache from "../utility/createEmotionCache";
import darkTheme from "../styles/theme/darkTheme";
import "../styles/globals.css";
import Head from "next/head";
import Script from 'next/script'
import AppProvider from "../components/common/context/AppProvider";
import WaitForRouter from "../components/common/WaitForRouter";
import NavBar from "../components/common/NavBar";
import { DefaultSeo } from 'next-seo';

const clientSideEmotionCache = createEmotionCache();
// remove overlay of error in dev mode.
const noOverlayWorkaroundScript = `
  window.addEventListener('error', event => {
    event.stopImmediatePropagation()
  })

  window.addEventListener('unhandledrejection', event => {
    event.stopImmediatePropagation()
  })
`;

const preConnections = ['https://firestore.googleapis.com', 'https://tpc.googlesyndication.com',
  'https://partner.googleadservices.com', 'https://pagead2.googlesyndication.com',
  'https://identitytoolkit.googleapis.com', 'https://googleads.g.doubleclick.net', 'https://www.google-analytics.com',
  'https://adservice.google.co.il', 'https://www.googletagmanager.com', 'https://adservice.google.com']

const MyApp = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <>
      <Head>
        <title>Idleon Toolbox</title>
        <meta
          name="description"
          content="Follow your Legends of Idleon progression with ease with the help of alerts dashboard, account and characters' overview, craft calculator and more!"
        />
        <meta name="googlebot" content="index,follow"/>
        {preConnections?.map((link) => <link key={link} rel="preconnect" href={link}/>)}
      </Head>
      {process.env.NODE_ENV !== 'production' &&
      <Script id={'remove-error-layout'} dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}/>}
      {/*Global site tag (gtag.js) - Google Analytics */}
      <Script strategy='afterInteractive'
              src="https://www.googletagmanager.com/gtag/js?id=G-YER8JY07QK"/>
      <Script id='ga-analytics'>
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-YER8JY07QK');          
          `}
      </Script>
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1842647313167572"
              id={'ads-by-google'}
              strategy={'afterInteractive'}
              crossOrigin="anonymous">
      </Script>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={darkTheme}>
          <EmotionThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <WaitForRouter>
              <AppProvider>
                <NavBar>
                  <DefaultSeo
                    openGraph={{
                      type: 'website',
                      locale: 'en_US',
                      url: 'https://www.idleontoolbox.com/',
                      siteName: 'Idleon Toolbox',
                    }}
                  />
                  <Component {...pageProps} />
                </NavBar>
              </AppProvider>
            </WaitForRouter>
          </EmotionThemeProvider>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
};

export default MyApp;
