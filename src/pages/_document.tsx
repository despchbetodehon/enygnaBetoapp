import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core/styles';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
   
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Cinzel:400,700|Roboto:300,400,500,700&display=swap"
          />
          <link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap"
  rel="stylesheet"
/>

        </Head>
        <body suppressHydrationWarning={true}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  };
};
