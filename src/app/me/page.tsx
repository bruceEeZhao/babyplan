import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out";

export const metadata: Metadata = { title: "我的 — BabyPlan" };

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.parent.findUnique({ where: { id: session.user.id } });
  const babyCount = me?.familyId
    ? await prisma.baby.count({ where: { familyId: me.familyId } })
    : 0;

  const items = [
    { href: "/babies", icon: "👶", title: "宝宝管理", desc: `添加/切换宝宝（当前 ${babyCount} 个）` },
    { href: "/history", icon: "📜", title: "历史记录", desc: "回看每日清单快照" },
    { href: "/onboarding", icon: "🏠", title: "家庭设置", desc: "成员、邀请码、退出家庭" },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">我的</h1>
        <p className="text-sm text-gray-500">
          {me?.nickname ?? ""} · {me?.phone ?? ""}
        </p>
      </header>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-pink-200"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="min-w-0">
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </Link>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}
