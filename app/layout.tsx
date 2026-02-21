import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘 뭐 먹지? - 음식 결정 도우미",
  description: "혼자, 커플, 가족, 친구와 함께 먹을 음식을 즉시 추천받으세요. 만들어 먹기, 배달, 외식까지 완벽한 결정 엔진.",
  keywords: ["음식 추천", "메뉴 추천", "오늘 뭐 먹지", "식사 결정", "음식 고민"],
  manifest: "/manifest.json",
  themeColor: "#FF8C42",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "오늘 뭐 먹지?",
    description: "음식 선택 고민 끝! 즉시 추천받으세요.",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "오늘 뭐 먹지 앱 아이콘",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "오늘 뭐 먹지?",
    description: "음식 선택 고민 끝! 즉시 추천받으세요.",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="오늘 뭐 먹지" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="오늘 뭐 먹지" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#FF8C42" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#FF8C42" media="(prefers-color-scheme: dark)" />
        
        {/* Links */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
