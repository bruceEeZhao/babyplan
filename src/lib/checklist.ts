import { SkillArea } from "@prisma/client";
import { prisma } from "./prisma";
import { localDateKey, dateKeyToDate } from "./date";

/** 按月龄计算所属阶段（月龄 = 出生后的整月数） */
export function monthAgeOf(birthDate: Date, now = new Date()): number {
  const ms = now.getTime() - birthDate.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
}

/** 新婴儿初始化：为其当前及之前阶段的所有里程碑创建初始状态（NOT_MET） */
export async function initBabyMilestones(babyId: string, birthDate: Date): Promise<number> {
  const monthAge = monthAgeOf(birthDate);
  const milestones = await prisma.milestone.findMany({
    where: { stage: { minMonth: { lte: monthAge } } },
    select: { id: true },
  });
  if (milestones.length === 0) return 0;
  const result = await prisma.babyMilestoneMark.createMany({
    data: milestones.map((m) => ({ babyId, milestoneId: m.id })),
  });
  return result.count;
}

/** 每日清单数量按月龄浮动（ADR-0008） */
export function dailyCountForMonthAge(monthAge: number): number {
  if (monthAge <= 1) return 3;
  if (monthAge <= 6) return 4;
  if (monthAge <= 12) return 5;
  return 6;
}

/** 里程碑加权系数（ADR-0008：未达成 ×1.5，已达成 ×0.6） */
const UNMET_WEIGHT = 1.5;
const MET_WEIGHT = 0.6;

/**
 * 生成今日清单快照（ADR-0008 加权抽取算法）
 * - 活动池 = 当月龄阶段全部活动（含跨阶段复用）
 * - 加权：按能力领域的里程碑达成状态
 * - 抽取 N 个后固化为 DailyChecklist + ChecklistItem
 */
export async function generateDailyChecklist(babyId: string): Promise<{ created: boolean; message: string }> {
  const today = dateKeyToDate(localDateKey(new Date()));

  const existing = await prisma.dailyChecklist.findUnique({
    where: { babyId_date: { babyId, date: today } },
  });
  if (existing) return { created: false, message: "今日清单已存在" };

  const baby = await prisma.baby.findUnique({
    where: { id: babyId },
    include: { family: { include: { parents: true } } },
  });
  if (!baby) return { created: false, message: "婴儿不存在" };

  const monthAge = monthAgeOf(baby.birthDate);
  const stage = await prisma.monthStage.findFirst({
    where: { minMonth: { lte: monthAge }, maxMonth: { gte: monthAge } },
    orderBy: { sortOrder: "desc" },
  });
  if (!stage) return { created: false, message: "该月龄暂无内容阶段" };

  // 该婴儿的里程碑达成状态（按能力领域聚合）
  const marks = await prisma.babyMilestoneMark.findMany({
    where: { babyId },
    include: { milestone: true },
  });
  const unmetAreas = new Set(marks.filter((m) => m.status === "NOT_MET").map((m) => m.milestone.skillArea));
  const metAreas = new Set(marks.filter((m) => m.status === "MET").map((m) => m.milestone.skillArea));

  // 活动池（含跨阶段复用的活动）
  const pool = await prisma.activity.findMany({
    where: { stages: { some: { id: stage.id } } },
    include: { milestones: true },
  });

  // 计算每个活动的权重
  const weighted = pool.map((a) => {
    let weight = 1;
    for (const area of a.skillAreas) {
      if (unmetAreas.has(area)) weight *= UNMET_WEIGHT;
      else if (metAreas.has(area)) weight *= MET_WEIGHT;
    }
    return { activity: a, weight };
  });

  // 加权随机抽取 N 个（权重高的活动被抽中概率大）
  const count = dailyCountForMonthAge(monthAge);
  // 大运动每日必练：从池中优先保证至少 1 个大运动活动，其余按加权抽取
  const grossMotor = weighted.filter((w) => w.activity.skillAreas.includes(SkillArea.GROSS_MOTOR));
  const rest = weighted.filter((w) => !w.activity.skillAreas.includes(SkillArea.GROSS_MOTOR));
  let picked: typeof weighted;
  if (grossMotor.length > 0) {
    picked = weightedPick(grossMotor, 1);
    if (count > 1 && rest.length > 0) picked.push(...weightedPick(rest, count - 1));
  } else {
    picked = weightedPick(weighted, count);
  }

  // 固化快照
  await prisma.dailyChecklist.create({
    data: {
      babyId,
      date: today,
      stageCode: stage.code,
      items: {
        create: picked.map(({ activity }, idx) => ({
          activityId: activity.id,
          titleSnapshot: activity.title,
          descriptionSnapshot: activity.description,
          imageUrlSnapshot: activity.imageUrl,
          dailyTargetCountSnapshot: activity.dailyTargetCount,
          skillAreasSnapshot: activity.skillAreas,
          sortOrder: idx,
        })),
      },
    },
  });

  return { created: true, message: `已生成今日清单（${picked.length} 项，阶段 ${stage.label}）` };
}

/** 加权随机抽样：权重越高被抽中概率越大 */
function weightedPick<T extends { weight: number }>(items: T[], count: number): T[] {
  const result: T[] = [];
  const pool = [...items];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const total = pool.reduce((s, it) => s + it.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].weight;
      if (r <= 0) {
        idx = j;
        break;
      }
    }
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}
