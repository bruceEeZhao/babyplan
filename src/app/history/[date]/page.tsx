import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBabyId } from "@/lib/current-baby";
import { requireFamilyContext } from "@/lib/session";
import { dateKeyToDate } from "@/lib/date";

export const dynamic = "force-dynamic";

const SKILL_LABELS: Record<string, string> = {
  GROSS_MOTOR: "大运动",
  FINE_MOTOR: "精细动作",
  LANGUAGE: "语言",
  COGNITIVE: "认知",
  SOCIAL_EMOTIONAL: "社交情感",
  SENSORY: "感官",
};

type Props = { params: Promise<{ date: string }> };

export default async function HistoryDetailPage({ params }: Props) {
  await requireFamilyContext();
  const babyId = await getCurrentBabyId();
  const { date } = await params;
  if (!babyId) notFound();

  const dateObj = dateKeyToDate(date);
  const checklist = await prisma.dailyChecklist.findUnique({
    where: { babyId_date: { babyId, date: dateObj } },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!checklist) notFound();

  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  const doneCount = checklist.items.reduce((s, i) => s + i.completedCount, 0);
  const totalCount = checklist.items.reduce((s, i) => s + i.dailyTargetCountSnapshot, 0);
  const formatDate = () =>
    dateObj.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm">
          <Link href="/history" className="text-pink-500 hover:underline">
            ← 历史记录
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-gray-800">
          {baby?.nickname ?? ""} · {formatDate()}
        </h1>
        <p className="text-sm text-gray-500">
          {checklist.stageCode} 阶段 · 完成 {doneCount}/{totalCount} 次
        </p>
      </header>

      <div className="space-y-3">
        {checklist.items.map((item) => {
          const done = item.completedCount >= item.dailyTargetCountSnapshot;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-4 ${done ? "border-green-200" : "border-gray-100"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-800">{item.titleSnapshot}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{item.descriptionSnapshot}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.skillAreasSnapshot.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
                      >
                        {SKILL_LABELS[area] ?? area}
                      </span>
                    ))}
                    {item.replacedFromActivityId && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        已替换
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                    done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {item.completedCount}/{item.dailyTargetCountSnapshot}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
