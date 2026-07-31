import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out";
import "./globals.css";

export const metadata: Metadata = {
  title: "BabyPlan — 婴儿互动助手",
  description: "按月龄推荐互动活动，帮助新手爸妈与宝宝一起成长",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const loggedIn = Boolean(session?.user?.id);

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-orange-50/50">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <Link href={loggedIn ? "/" : "/login"} className="text-lg font-bold text-pink-500">
              BabyPlan
            </Link>
            <div className="flex items-center gap-2">
              {loggedIn ? (
                <>
                  <nav className="flex gap-1">
                    <Link
                      href="/"
                      className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-orange-50 hover:text-pink-500"
                    >
                      今日清单
                    </Link>
                    <Link
                      href="/milestones"
                      className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-orange-50 hover:text-pink-500"
                    >
                      里程碑
                    </Link>
                    <Link
                      href="/babies"
                      className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-orange-50 hover:text-pink-500"
                    >
                      宝宝
                    </Link>
                    <Link
                      href="/history"
                      className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-orange-50 hover:text-pink-500"
                    >
                      历史
                    </Link>
                    <Link
                      href="/stats"
                      className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-orange-50 hover:text-pink-500"
                    >
                      统计
                    </Link>
                    <Link
                      href="/onboarding"
                      className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-orange-50 hover:text-pink-500"
                    >
                      家庭
                    </Link>
                  </nav>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-pink-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
