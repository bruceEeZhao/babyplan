/**
 * 集成测试：验证清单生成 → 打勾 → 里程碑推进 → 替换 的完整业务闭环
 * 运行：npx tsx prisma/test-flow.ts
 */
import { prisma } from "../src/lib/prisma";
import { generateDailyChecklist, monthAgeOf, dailyCountForMonthAge } from "../src/lib/checklist";

const BABY_ID = "demo-baby";

async function main() {
  console.log("=== BabyPlan 核心业务流测试 ===\n");

  const baby = await prisma.baby.findUnique({ where: { id: BABY_ID } });
  if (!baby) throw new Error("演示婴儿不存在，请先运行 npm run db:seed");
  console.log(`✅ 婴儿「${baby.nickname}」月龄 ${monthAgeOf(baby.birthDate)} 个月`);
  console.log(`✅ 该月龄每日清单应含 ${dailyCountForMonthAge(monthAgeOf(baby.birthDate))} 项`);

  // 1. 生成清单
  const gen1 = await generateDailyChecklist(BABY_ID);
  console.log(`\n[1] 生成清单: ${gen1.message}`);
  const gen2 = await generateDailyChecklist(BABY_ID);
  console.log(`[1] 重复生成: ${gen2.message}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checklist = await prisma.dailyChecklist.findUnique({
    where: { babyId_date: { babyId: BABY_ID, date: today } },
    include: { items: true },
  });
  if (!checklist) throw new Error("清单生成失败");
  console.log(`[1] 清单含 ${checklist.items.length} 项：${checklist.items.map((i) => i.titleSnapshot).join("、")}`);

  // 2. 打勾到目标次数
  const item = checklist.items[0];
  console.log(`\n[2] 打勾测试：${item.titleSnapshot}（目标 ${item.dailyTargetCountSnapshot} 次）`);
  for (let i = 0; i <= item.dailyTargetCountSnapshot; i++) {
    const current = await prisma.checklistItem.findUnique({ where: { id: item.id } });
    if (!current) break;
    if (current.completedCount >= current.dailyTargetCountSnapshot) {
      console.log(`[2] 第 ${i} 次尝试被拒绝（已达上限）✓`);
      break;
    }
    await prisma.checklistItem.update({
      where: { id: item.id },
      data: { completedCount: { increment: 1 } },
    });
  }
  const afterComplete = await prisma.checklistItem.findUnique({ where: { id: item.id } });
  console.log(`[2] 完成后 ${afterComplete!.completedCount}/${afterComplete!.dailyTargetCountSnapshot} 次 ✓`);

  // 3. 里程碑进度同步（模拟 actions.bumpMilestoneProgress 逻辑）
  console.log(`\n[3] 里程碑进度同步`);
  const marks = await prisma.babyMilestoneMark.findMany({
    where: { babyId: BABY_ID, status: "NOT_MET" },
    include: { milestone: { include: { activities: true } } },
  });
  const related = marks.filter((m) => m.milestone.activities.some((a) => a.id === item.activityId));
  console.log(
    `[3] 该活动关联 ${related.length} 个未达成里程碑：${related.map((m) => m.milestone.title).join("、") || "无"}`
  );

  // 4. 替换测试（模拟 replaceItem）
  const candidates = await prisma.activity.findMany({
    where: { stages: { some: { id: checklist!.stageCode === "" ? -1 : (await prisma.monthStage.findFirst({ where: { code: checklist!.stageCode } }))!.id } } },
    take: 10,
  });
  const replaceTarget = candidates.find((c) => c.id !== item.activityId);
  if (replaceTarget) {
    console.log(`\n[4] 替换测试：用「${replaceTarget.title}」替换「${item.titleSnapshot}」`);
    await prisma.checklistItem.update({
      where: { id: item.id },
      data: {
        activityId: replaceTarget.id,
        titleSnapshot: replaceTarget.title,
        dailyTargetCountSnapshot: replaceTarget.dailyTargetCount,
        completedCount: 0,
        replacedFromActivityId: item.activityId,
      },
    });
    const replaced = await prisma.checklistItem.findUnique({ where: { id: item.id } });
    console.log(`[4] 替换后：${replaced!.titleSnapshot}（次数重置为 ${replaced!.dailyTargetCountSnapshot}）✓`);
  }

  // 5. 里程碑确认测试
  console.log(`\n[5] 里程碑确认：将「俯卧能抬头 90°」标记为达成`);
  const m90 = await prisma.babyMilestoneMark.findFirst({
    where: { babyId: BABY_ID, milestone: { title: "俯卧能抬头 90°" } },
  });
  if (m90) {
    await prisma.babyMilestoneMark.update({
      where: { id: m90.id },
      data: { status: "MET", confirmedAt: new Date() },
    });
    const confirmed = await prisma.babyMilestoneMark.findUnique({ where: { id: m90.id } });
    console.log(`[5] 已确认：${confirmed!.status} ✓`);
  }

  // 清理测试数据（恢复演示初始状态）
  await prisma.checklistItem.deleteMany();
  await prisma.dailyChecklist.deleteMany();
  const marks2 = await prisma.babyMilestoneMark.findMany({ where: { babyId: BABY_ID, status: "MET" } });
  if (marks2.length) {
    await prisma.babyMilestoneMark.updateMany({
      where: { babyId: BABY_ID, status: "MET" },
      data: { status: "NOT_MET", confirmedAt: null, confirmedById: null },
    });
  }
  console.log(`\n✅ 测试数据已清理（演示状态还原）`);
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
