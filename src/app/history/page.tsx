import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBabyId } from "@/lib/current-baby";
import { requireFamilyContext } from "@/lib/session";
import { localDateKey } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  await requireFamilyContext();
  const babyId = await getCurrentBabyId();
  if (!babyId) return <p className="text-gray-500">还没有宝宝，请先到「婴儿管理」添加。</p>;
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return <p className="text-gray-500">未找到婴儿</p>;

  const checklists = await prisma.dailyChecklist.findMany({
    where: { babyId },
    include: { items: true },
    orderBy: { date: "desc" },
    take: 60,
  });

  const formatDate = (d: Date) => d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "short" });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">{baby.nickname} · 历史记录</h1>
        <p className="text-sm text-gray-500">共 {checklists.length} 天的清单快照</p>
      </header>

      {checklists.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          还没有历史记录，去今日清单生成一份吧
        </p>
      )}

      <div className="space-y-3">
        {checklists.map((c) => {
          const doneItems = c.items.filter((i) => i.completedCount >= i.dailyTargetCountSnapshot).length;
          const doneCount = c.items.reduce((s, i) => s + i.completedCount, 0);
          const totalCount = c.items.reduce((s, i) => s + i.dailyTargetCountSnapshot, 0);
          const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
          return (
            <Link
              key={c.id}
              href={`/history/${localDateKey(c.date)}`}
              className="block rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-pink-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{formatDate(c.date)}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {c.stageCode} 阶段 · 完成 {doneItems}/{c.items.length} 项 · {doneCount}/{totalCount} 次
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-pink-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{pct}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
