import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata = {
  title: 'AEO Copilot — AI Answer Engine Optimization',
  description: 'Scan your website, diagnose SEO and AI visibility issues, and get auto-generated fixes. Schema markup, llms.txt, content restructuring, and AI citation tracking.',
  openGraph: {
    title: 'AEO Copilot — AI Answer Engine Optimization',
    description: 'Scan your website, diagnose SEO and AI visibility issues, and get auto-generated fixes.',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
