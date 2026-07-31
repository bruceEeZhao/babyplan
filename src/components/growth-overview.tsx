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

type MarkLike = { status: string; milestone: { skillArea: string } };

export function GrowthOverview({ marks }: { marks: MarkLike[] }) {
  const areas = Object.keys(SKILL_LABELS).map((key) => {
    const total = marks.filter((m) => m.milestone.skillArea === key).length;
    const met = marks.filter((m) => m.milestone.skillArea === key && m.status === "MET").length;
    return {
      key,
      label: SKILL_LABELS[key],
      color: SKILL_COLORS[key],
      total,
      met,
      pct: total ? Math.round((met / total) * 100) : 0,
    };
  });

  const total = marks.length;
  const metCount = marks.filter((m) => m.status === "MET").length;
  const overall = total ? Math.round((metCount / total) * 100) : 0;
  const CIRC = 2 * Math.PI * 44;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="mb-4 font-medium text-gray-800">成长概览</h2>

      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" strokeWidth="10" className="stroke-gray-100" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - overall / 100)}
              className="stroke-pink-400 transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{overall}%</span>
            <span className="text-xs text-gray-400">已达成</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {areas.map((a) => (
            <div key={a.key}>
              <div className="mb-0.5 flex justify-between text-xs">
                <span className="text-gray-500">{a.label}</span>
                <span className="text-gray-400">
                  {a.met}/{a.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 border-t border-gray-50 pt-3 text-xs text-gray-400">
        基于当前月龄前全部里程碑的达成情况，持续完成每日清单可提升各领域进度
      </p>
    </section>
  );
}
