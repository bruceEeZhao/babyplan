import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** 当前登录父母 ID（未登录返回 null） */
export async function getCurrentParentId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** 受保护页面上下文：未登录跳 /login，无家庭跳 /onboarding */
export async function requireFamilyContext(): Promise<{ parentId: string; familyId: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) redirect("/login");
  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me?.familyId) redirect("/onboarding");
  return { parentId, familyId: me.familyId };
}
