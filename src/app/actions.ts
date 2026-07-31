"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateDailyChecklist, initBabyMilestones } from "@/lib/checklist";
import { CURRENT_BABY_COOKIE, getCurrentBabyId } from "@/lib/current-baby";
import { getCurrentParentId } from "@/lib/session";

/** 切换当前婴儿（存 cookie，须属于当前家庭） */
export async function switchBaby(babyId: string): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const baby = await prisma.baby.findFirst({
    where: { id: babyId, family: { parents: { some: { id: parentId } } } },
  });
  if (!baby) return { ok: false, message: "婴儿不存在" };
  const store = await cookies();
  store.set(CURRENT_BABY_COOKIE, babyId, { maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/");
  revalidatePath("/milestones");
  return { ok: true, message: `已切换至「${baby.nickname}」` };
}

/** 生成今日清单 */
export async function ensureTodayChecklist(): Promise<{ ok: boolean; message: string }> {
  const babyId = await getCurrentBabyId();
  if (!babyId) return { ok: false, message: "请先登录并添加宝宝" };
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return { ok: false, message: "未找到婴儿" };
  const result = await generateDailyChecklist(babyId);
  revalidatePath("/");
  return { ok: result.created, message: result.message };
}

/** 打勾：活动完成次数 +1（不超过当日目标次数） */
export async function completeItem(itemId: string): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { checklist: true },
  });
  if (!item) return { ok: false, message: "清单项不存在" };
  if (item.completedCount >= item.dailyTargetCountSnapshot) {
    return { ok: false, message: "已达当日目标次数" };
  }

  const updated = await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      completedCount: { increment: 1 },
      completions: { create: { parentId, count: 1 } },
    },
  });

  await bumpMilestoneProgress(item.checklist.babyId, item);
  revalidatePath("/");
  return { ok: true, message: `已完成 ${updated.completedCount}/${updated.dailyTargetCountSnapshot} 次` };
}

/** 替换清单项：从当月龄活动池选一个顶替（被替换项当天消失，仅影响当日快照） */
export async function replaceItem(itemId: string, activityId: string): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { checklist: true },
  });
  if (!item) return { ok: false, message: "清单项不存在" };

  const owned = await prisma.baby.findFirst({
    where: { id: item.checklist.babyId, family: { parents: { some: { id: parentId } } } },
  });
  if (!owned) return { ok: false, message: "无权操作该清单" };

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return { ok: false, message: "活动不存在" };

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      activityId: activity.id,
      titleSnapshot: activity.title,
      descriptionSnapshot: activity.description,
      imageUrlSnapshot: activity.imageUrl,
      dailyTargetCountSnapshot: activity.dailyTargetCount,
      skillAreasSnapshot: activity.skillAreas,
      completedCount: 0,
      replacedFromActivityId: item.activityId,
    },
  });
  revalidatePath("/");
  return { ok: true, message: `已替换为「${activity.title}」` };
}

/** 确认里程碑达成 */
export async function confirmMilestone(markId: string): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const mark = await prisma.babyMilestoneMark.findUnique({
    where: { id: markId },
    include: { milestone: true },
  });
  if (!mark) return { ok: false, message: "里程碑记录不存在" };

  const owned = await prisma.baby.findFirst({
    where: { id: mark.babyId, family: { parents: { some: { id: parentId } } } },
  });
  if (!owned) return { ok: false, message: "无权操作该记录" };

  await prisma.babyMilestoneMark.update({
    where: { id: markId },
    data: { status: "MET", confirmedAt: new Date(), confirmedById: parentId },
  });
  revalidatePath("/milestones");
  revalidatePath("/");
  return { ok: true, message: `已确认达成「${mark.milestone.title}」` };
}

/** 添加婴儿 */
export async function addBaby(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const nickname = String(formData.get("nickname") ?? "").trim();
  const birthDateStr = String(formData.get("birthDate") ?? "").trim();
  if (!nickname || !birthDateStr) return { ok: false, message: "请填写昵称与出生日期" };

  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me?.familyId) return { ok: false, message: "请先创建或加入家庭" };

  const baby = await prisma.baby.create({
    data: { nickname, birthDate: new Date(birthDateStr), familyId: me.familyId },
  });
  const markCount = await initBabyMilestones(baby.id, baby.birthDate);
  revalidatePath("/babies");
  revalidatePath("/milestones");
  return { ok: true, message: `已添加「${baby.nickname}」，并初始化 ${markCount} 条里程碑` };
}

/** 打勾后同步里程碑累计进度：关联活动累计次数达阈值 → 更新进度（不自动确认，需父母手动确认） */
async function bumpMilestoneProgress(
  babyId: string,
  item: { activityId: string | null; completedCount: number }
): Promise<void> {
  if (!item.activityId) return;
  const marks = await prisma.babyMilestoneMark.findMany({
    where: { babyId, status: "NOT_MET" },
    include: { milestone: { include: { activities: true } } },
  });
  for (const mark of marks) {
    if (!mark.milestone.activities.some((a) => a.id === item.activityId)) continue;
    const total = await prisma.checklistItem.aggregate({
      where: { checklist: { babyId }, activityId: item.activityId },
      _sum: { completedCount: true },
    });
    const progress = total._sum.completedCount ?? 0;
    if (progress > mark.progressCount) {
      await prisma.babyMilestoneMark.update({ where: { id: mark.id }, data: { progressCount: progress } });
    }
  }
}
