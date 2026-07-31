import { prisma } from "@/lib/prisma";
import { monthAgeOf } from "@/lib/checklist";
import { getCurrentBabyId } from "@/lib/current-baby";
import { requireFamilyContext } from "@/lib/session";
import { ConfirmMilestoneButton } from "@/components/milestone-client";
import { GrowthOverview } from "@/components/growth-overview";

export const dynamic = "force-dynamic";

const SKILL_LABELS: Record<string, string> = {
  GROSS_MOTOR: "大运动",
  FINE_MOTOR: "精细动作",
  LANGUAGE: "语言",
  COGNITIVE: "认知",
  SOCIAL_EMOTIONAL: "社交情感",
  SENSORY: "感官",
};

export default async function MilestonesPage() {
  await requireFamilyContext();
  const babyId = await getCurrentBabyId();
  if (!babyId) return <p className="text-gray-500">还没有宝宝，请先到「婴儿管理」添加。</p>;
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return <p className="text-gray-500">未找到婴儿</p>;

  const monthAge = monthAgeOf(baby.birthDate);

  const marks = await prisma.babyMilestoneMark.findMany({
    where: { babyId },
    include: { milestone: true },
    orderBy: { milestone: { stageId: "asc" } },
  });

  // 按阶段分组展示
  const marksByStage = new Map<number, typeof marks>();
  for (const m of marks) {
    const key = m.milestone.stageId;
    if (!marksByStage.has(key)) marksByStage.set(key, []);
    marksByStage.get(key)!.push(m);
  }
  const stages = await prisma.monthStage.findMany({
    where: { id: { in: [...marksByStage.keys()] } },
    orderBy: { sortOrder: "asc" },
  });

  const metCount = marks.filter((m) => m.status === "MET").length;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">{baby.nickname} · 里程碑</h1>
        <p className="text-sm text-gray-500">
          月龄 {monthAge} 个月 · 已达成 {metCount}/{marks.length}
        </p>
      </header>

      <GrowthOverview marks={marks} />

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-green-400 transition-all"
          style={{ width: `${marks.length ? (metCount / marks.length) * 100 : 0}%` }}
        />
      </div>

      {stages.map((s) => {
        const stageMarks = marksByStage.get(s.id) ?? [];
        return (
          <section key={s.id} className="space-y-2">
            <h2 className="text-sm font-medium text-gray-400">{s.label} 阶段</h2>
            {stageMarks.map((m) => {
              const ready = m.status === "NOT_MET" && m.progressCount >= m.milestone.thresholdCount;
              const pct = Math.min(100, Math.round((m.progressCount / m.milestone.thresholdCount) * 100));
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-4 ${
                    m.status === "MET" ? "border-green-200 bg-green-50" : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-800">{m.milestone.title}</h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {SKILL_LABELS[m.milestone.skillArea] ?? m.milestone.skillArea}
                        {m.status === "MET"
                          ? ` · 已于 ${m.confirmedAt ? new Date(m.confirmedAt).toLocaleDateString("zh-CN") : ""} 确认`
                          : ` · 累计 ${m.progressCount}/${m.milestone.thresholdCount} 次`}
                      </p>
                    </div>
                    {m.status === "MET" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        ✓ 已达成
                      </span>
                    ) : (
                      <ConfirmMilestoneButton markId={m.id} ready={ready} />
                    )}
                  </div>
                  {m.status !== "MET" && (
                    <div className="mt-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${ready ? "bg-green-400" : "bg-orange-300"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
