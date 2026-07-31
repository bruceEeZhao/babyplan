import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBabyId } from "@/lib/current-baby";
import { requireFamilyContext } from "@/lib/session";
import { localDateKey } from "@/lib/date";

export const dynamic = "force-dynamic";

const SKILL_LABELS: Record<string, string> = {
  GROSS_MOTOR: "大运动",
  FINE_MOTOR: "精细动作",
  LANGUAGE: "语言",
  COGNITIVE: "认知",
  SOCIAL_EMOTIONAL: "社交情感",
  SENSORY: "感官",
};

const SKILL_COLORS: Record<string, string> = {
  GROSS_MOTOR: "bg-orange-400",
  FINE_MOTOR: "bg-pink-400",
  LANGUAGE: "bg-blue-400",
  COGNITIVE: "bg-purple-400",
  SOCIAL_EMOTIONAL: "bg-green-400",
  SENSORY: "bg-cyan-400",
};

type Props = { searchParams: Promise<{ range?: string }> };

export default async function StatsPage({ searchParams }: Props) {
  await requireFamilyContext();
  const babyId = await getCurrentBabyId();
  const { range } = await searchParams;
  if (!babyId) notFound();

  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) notFound();

  const days = range === "30" ? 30 : 7;
  const rangeLabel = days === 30 ? "近 30 天" : "近 7 天";
  // RSC 动态渲染需当前时间计算统计窗口（配合 dynamic = "force-dynamic"）
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const checklists = await prisma.dailyChecklist.findMany({
    where: { babyId, date: { gte: since } },
    include: { items: true },
    orderBy: { date: "desc" },
  });

  // 聚合统计
  const doneDays = new Set(
    checklists.filter((c) => c.items.some((i) => i.completedCount > 0)).map((c) => localDateKey(c.date))
  ).size;

  let totalCount = 0;
  const skillCount = new Map<string, number>();
  const activityCount = new Map<string, number>();
  for (const c of checklists) {
    for (const item of c.items) {
      if (item.completedCount === 0) continue;
      totalCount += item.completedCount;
      for (const area of item.skillAreasSnapshot) {
        skillCount.set(area, (skillCount.get(area) ?? 0) + item.completedCount);
      }
      activityCount.set(item.titleSnapshot, (activityCount.get(item.titleSnapshot) ?? 0) + item.completedCount);
    }
  }

  const skills = Object.keys(SKILL_LABELS)
    .map((key) => ({ key, label: SKILL_LABELS[key], color: SKILL_COLORS[key], count: skillCount.get(key) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const maxSkill = Math.max(1, ...skills.map((s) => s.count));

  const topActivities = [...activityCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const milestonesMet = await prisma.babyMilestoneMark.count({
    where: { babyId, status: "MET", confirmedAt: { gte: since } },
  });

  const pct = days === 7 ? Math.round((doneDays / 7) * 100) : Math.round((doneDays / 30) * 100);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">{baby.nickname} · 统计报告</h1>
        <p className="text-sm text-gray-500">{rangeLabel}互动总结</p>
      </header>

      <div className="flex gap-2">
        <Link
          href="/stats"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            days === 7 ? "bg-pink-500 text-white" : "bg-white text-gray-500"
          }`}
        >
          近 7 天
        </Link>
        <Link
          href="/stats?range=30"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            days === 30 ? "bg-pink-500 text-white" : "bg-white text-gray-500"
          }`}
        >
          近 30 天
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {doneDays}
            <span className="text-sm font-normal text-gray-400">/{days} 天</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">坚持互动</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
          <p className="mt-0.5 text-xs text-gray-500">完成活动次数</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{milestonesMet}</p>
          <p className="mt-0.5 text-xs text-gray-500">确认里程碑</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{pct}%</p>
          <p className="mt-0.5 text-xs text-gray-500">坚持率</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-3 font-medium text-gray-800">能力领域分布</h2>
        {totalCount === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">该时间段还没有完成记录</p>
        ) : (
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.key}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="text-gray-400">{s.count} 次</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${(s.count / maxSkill) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-3 font-medium text-gray-800">最常完成的活动</h2>
        {topActivities.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">该时间段还没有完成记录</p>
        ) : (
          <ol className="space-y-2">
            {topActivities.map(([title, count], idx) => (
              <li key={title} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 text-center font-bold text-gray-300">{idx + 1}</span>
                  {title}
                </span>
                <span className="text-gray-400">{count} 次</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
