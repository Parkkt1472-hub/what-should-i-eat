import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘 뭐 먹지? - 음식 결정 도우미",
  description: "혼자, 커플, 가족, 친구와 함께 먹을 음식을 즉시 추천받으세요. 만들어 먹기, 배달, 외식까지 완벽한 결정 엔진.",
  keywords: ["음식 추천", "메뉴 추천", "오늘 뭐 먹지", "식사 결정", "음식 고민"],
  openGraph: {
    title: "오늘 뭐 먹지?",
    description: "음식 선택 고민 끝! 즉시 추천받으세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
