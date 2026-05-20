import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Data Uang Kas Kelas - Pengelolaan Kas Digital',
  description: 'Aplikasi pengelolaan uang kas kelas untuk mencatat pembayaran siswa, menghitung total kas, serta mengelompokkan siswa yang sudah lunas dan belum lunas.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable} font-sans`}>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen selection:bg-emerald-500/30 selection:text-emerald-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
