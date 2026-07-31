import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentParentId } from "@/lib/session";

export const CURRENT_BABY_COOKIE = "current-baby";

/**
 * 当前婴儿 ID：优先取 cookie 中已选择的婴儿（须属于当前家庭），
 * 否则取当前家庭第一个宝宝。未登录返回 null。
 */
export async function getCurrentBabyId(): Promise<string | null> {
  const parentId = await getCurrentParentId();
  if (!parentId) return null;

  const store = await cookies();
  const fromCookie = store.get(CURRENT_BABY_COOKIE)?.value;
  if (fromCookie) {
    const owned = await prisma.baby.findFirst({
      where: { id: fromCookie, family: { parents: { some: { id: parentId } } } },
    });
    if (owned) return owned.id;
  }
  const first = await prisma.baby.findFirst({
    where: { family: { parents: { some: { id: parentId } } } },
    orderBy: { createdAt: "asc" },
  });
  return first?.id ?? null;
}
