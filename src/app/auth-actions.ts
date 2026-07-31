"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentParentId } from "@/lib/session";

const INVITE_EXPIRY_DAYS = 7;
const MAX_FAMILY_PARENTS = 2;

/** 注册父母（无家庭，注册成功后跳登录） */
export async function registerParent(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (!/^1\d{10}$/.test(phone)) return { ok: false, message: "手机号格式不正确" };
  if (password.length < 6) return { ok: false, message: "密码至少 6 位" };
  if (!nickname) return { ok: false, message: "请填写昵称" };

  const exists = await prisma.parent.findUnique({ where: { phone } });
  if (exists) return { ok: false, message: "该手机号已注册" };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.parent.create({
    data: { phone, passwordHash, nickname },
  });
  return { ok: true, message: "注册成功，请登录" };
}

/** 创建家庭（成为创建者），并生成首个邀请码 */
export async function createFamily(): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };

  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me) return { ok: false, message: "账号不存在" };
  if (me.familyId) return { ok: false, message: "你已在家庭中" };

  const family = await prisma.family.create({ data: { creatorId: parentId } });
  await prisma.parent.update({
    where: { id: parentId },
    data: { familyId: family.id, isCreator: true },
  });
  await createInviteCodeRecord(family.id);

  revalidatePath("/onboarding");
  revalidatePath("/babies");
  return { ok: true, message: "家庭创建成功" };
}

/** 生成新邀请码（家庭创建者） */
export async function generateInviteCode(): Promise<{ ok: boolean; message: string; code?: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me?.familyId) return { ok: false, message: "尚未加入家庭" };
  if (!me.isCreator) return { ok: false, message: "仅家庭创建者可生成邀请码" };

  const code = await createInviteCodeRecord(me.familyId);
  revalidatePath("/onboarding");
  return { ok: true, message: "邀请码已生成", code };
}

/** 输入邀请码加入家庭（家庭限 2 名父母） */
export async function joinFamilyByCode(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { ok: false, message: "请输入邀请码" };

  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me) return { ok: false, message: "账号不存在" };
  if (me.familyId) return { ok: false, message: "你已在家庭中" };

  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite || invite.usedAt || (invite.expiresAt && invite.expiresAt < new Date())) {
    return { ok: false, message: "邀请码无效或已过期" };
  }
  const memberCount = await prisma.parent.count({ where: { familyId: invite.familyId } });
  if (memberCount >= MAX_FAMILY_PARENTS) return { ok: false, message: "该家庭已达 2 名父母上限" };

  await prisma.parent.update({
    where: { id: parentId },
    data: { familyId: invite.familyId },
  });
  await prisma.inviteCode.update({
    where: { id: invite.id },
    data: { usedById: parentId, usedAt: new Date() },
  });

  revalidatePath("/onboarding");
  revalidatePath("/");
  return { ok: true, message: "已加入家庭" };
}

/** 未登录跳登录；已登录但无家庭跳 onboarding */
export async function requireLogin() {
  const parentId = await getCurrentParentId();
  if (!parentId) redirect("/login");
  return parentId;
}

/** 退出家庭（解绑）：失去家庭数据访问权，账号与个人数据保留 */
export async function leaveFamily(): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };

  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me) return { ok: false, message: "账号不存在" };
  if (!me.familyId) return { ok: false, message: "你不在任何家庭中" };

  await prisma.parent.update({
    where: { id: parentId },
    data: { familyId: null, isCreator: false },
  });
  revalidatePath("/onboarding");
  revalidatePath("/babies");
  revalidatePath("/");
  return { ok: true, message: "已退出家庭，账号与个人数据已保留" };
}

/** 修改密码：验证旧密码后更新 */
export async function changePassword(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const parentId = await getCurrentParentId();
  if (!parentId) return { ok: false, message: "请先登录" };

  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (oldPassword.length < 6) return { ok: false, message: "请输入旧密码" };
  if (newPassword.length < 6) return { ok: false, message: "新密码至少 6 位" };
  if (oldPassword === newPassword) return { ok: false, message: "新密码不能与旧密码相同" };

  const me = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!me) return { ok: false, message: "账号不存在" };
  const ok = await bcrypt.compare(oldPassword, me.passwordHash);
  if (!ok) return { ok: false, message: "旧密码不正确" };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.parent.update({
    where: { id: parentId },
    data: { passwordHash },
  });
  return { ok: true, message: "密码修改成功" };
}

/** 生成邀请码记录（6 位大写字母数字，7 天有效） */
async function createInviteCodeRecord(familyId: string): Promise<string> {
  const code = randomCode(6);
  await prisma.inviteCode.create({
    data: {
      code,
      familyId,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return code;
}

function randomCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
