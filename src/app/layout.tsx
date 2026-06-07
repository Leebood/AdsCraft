import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdsCraft - Facebook Ads Decision Engine',
  description: 'Facebook广告决策引擎 - 停止猜测,开始决策',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}