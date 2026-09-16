import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GYMIN — Your Fitness Journey. One Place.',
  description: 'The all-in-one personal fitness companion. Personalized workout plans, intelligent nutrition & Indian food tracking, analytics, and personal AI fitness assistant.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-neutral-100 antialiased selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
