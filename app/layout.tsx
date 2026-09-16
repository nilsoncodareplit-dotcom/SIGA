import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SIGA Pará',
  description: 'Sistema Integrado de Gestão da Agricultura do Pará.',
  openGraph: {
    title: 'SIGA Pará',
    description: 'Sistema Integrado de Gestão da Agricultura.',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
