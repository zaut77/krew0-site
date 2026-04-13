export const metadata = {
  title: 'KREW0 — Zero People. Only AI.',
  description: 'Il tuo prossimo dipendente non esiste. KREW0 costruisce team di agenti AI su misura per PMI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, WebkitFontSmoothing: 'antialiased' }}>
        {children}
      </body>
    </html>
  );
}
