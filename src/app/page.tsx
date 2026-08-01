import { prisma } from "@/lib/prisma";
import { monthAgeOf } from "@/lib/checklist";
import { getCurrentBabyId } from "@/lib/current-baby";
import { requireFamilyContext } from "@/lib/session";
import { localDateKey, dateKeyToDate } from "@/lib/date";
import { CompleteButton, ReplacePanel, GenerateButton } from "@/components/checklist-client";
import { ConfirmMilestoneButton } from "@/components/milestone-client";

export const dynamic = "force-dynamic";

const SKILL_LABELS: Record<string, string> = {
  GROSS_MOTOR: "大运动",
  FINE_MOTOR: "精细动作",
  LANGUAGE: "语言",
  COGNITIVE: "认知",
  SOCIAL_EMOTIONAL: "社交情感",
  SENSORY: "感官",
};

export default async function TodayPage() {
  await requireFamilyContext();
  const babyId = await getCurrentBabyId();
  if (!babyId) return <p className="text-gray-500">还没有宝宝，请先到「婴儿管理」添加。</p>;
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return <p className="text-gray-500">未找到婴儿</p>;

  const monthAge = monthAgeOf(baby.birthDate);
  const today = dateKeyToDate(localDateKey(new Date()));

  const checklist = await prisma.dailyChecklist.findUnique({
    where: { babyId_date: { babyId, date: today } },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const stage = await prisma.monthStage.findFirst({
    where: { minMonth: { lte: monthAge }, maxMonth: { gte: monthAge } },
    orderBy: { sortOrder: "desc" },
  });

  // 替换候选：当月龄阶段活动池（排除已在清单中的）
  const inChecklistIds = (checklist?.items.map((i) => i.activityId).filter(Boolean) ?? []) as string[];
  const candidates = stage
    ? await prisma.activity.findMany({
        where: { stages: { some: { id: stage.id } }, id: { notIn: inChecklistIds } },
      })
    : [];

  // 达阈值待确认的里程碑（内存过滤：progressCount >= milestone.thresholdCount）
  const readyMarks = checklist
    ? (
        await prisma.babyMilestoneMark.findMany({
          where: { babyId, status: "NOT_MET" },
          include: { milestone: true },
        })
      ).filter((m) => m.progressCount >= m.milestone.thresholdCount)
    : [];

  const totalCompleted = checklist?.items.reduce((s, i) => s + i.completedCount, 0) ?? 0;
  const totalTarget = checklist?.items.reduce((s, i) => s + i.dailyTargetCountSnapshot, 0) ?? 0;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">
          {baby.nickname} · 今日清单
        </h1>
        <p className="text-sm text-gray-500">
          月龄 {monthAge} 个月{stage ? ` · ${stage.label} 阶段` : ""} ·{" "}
          {checklist ? `已完成 ${totalCompleted}/${totalTarget} 次` : "今日清单未生成"}
        </p>
      </header>

      {!checklist && (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-6 text-center">
          <p className="mb-4 text-sm text-gray-500">今天还没有清单，生成一份吧！</p>
          <GenerateButton hasChecklist={false} />
        </div>
      )}

      {checklist && (
        <>
          {readyMarks.length > 0 && (
            <div className="space-y-2">
              {readyMarks.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-green-200 bg-green-50 p-4"
                >
                  <p className="text-sm font-medium text-green-800">
                    🎉 宝宝似乎已能做到「{m.milestone.title}」
                  </p>
                  <p className="mt-1 text-xs text-green-700">
                    累计完成 {m.progressCount}/{m.milestone.thresholdCount} 次，确认后每日推荐将调整该领域活动
                  </p>
                  <div className="mt-2">
                    <ConfirmMilestoneButton markId={m.id} ready />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {checklist.items.map((item) => {
              const done = item.completedCount >= item.dailyTargetCountSnapshot;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-4 ${
                    done ? "border-green-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrlSnapshot}
                        alt={item.titleSnapshot}
                        className="h-12 w-12 shrink-0 rounded-xl bg-orange-50 p-2 object-contain"
                      />
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
                        </div>
                      </div>
                    </div>
                    <CompleteButton
                      itemId={item.id}
                      completed={item.completedCount}
                      target={item.dailyTargetCountSnapshot}
                    />
                  </div>
                  <div className="mt-3 border-t border-gray-50 pt-2">
                    <ReplacePanel
                      itemId={item.id}
                      currentTitle={item.titleSnapshot}
                      candidates={candidates.map((c) => ({
                        id: c.id,
                        title: c.title,
                        dailyTargetCount: c.dailyTargetCount,
                      }))}
                      isProtected={item.skillAreasSnapshot.includes("GROSS_MOTOR")}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <GenerateButton hasChecklist />
        </>
      )}
    </div>
  );
}
