"use client";

import { useActionState } from "react";
import { createFamily, generateInviteCode, joinFamilyByCode, leaveFamily, changePassword } from "@/app/auth-actions";

type ActionResult = { ok: boolean; message: string; code?: string };

export function CreateFamilyButton() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => createFamily(),
    null
  );
  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        {pending ? "创建中..." : "创建家庭"}
      </button>
      {state?.message && (
        <p className={`text-center text-sm ${state.ok ? "text-green-600" : "text-amber-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export function JoinFamilyForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => joinFamilyByCode(formData),
    null
  );
  return (
    <form action={action} className="space-y-3">
      <input
        name="code"
        required
        placeholder="输入 6 位邀请码，如 A1B2C3"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase tracking-widest"
      />
      {state && (
        <p className={`text-center text-sm ${state.ok ? "text-green-600" : "text-amber-600"}`}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg border border-pink-300 bg-white py-2.5 font-medium text-pink-500 hover:bg-pink-50 disabled:opacity-50"
      >
        {pending ? "加入中..." : "加入家庭"}
      </button>
    </form>
  );
}

export function RegenerateCodeButton() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => generateInviteCode(),
    null
  );
  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="text-sm text-pink-500 underline-offset-2 hover:underline disabled:opacity-50"
        >
          {pending ? "生成中..." : "生成新邀请码"}
        </button>
      </form>
      {state?.code && (
        <p className="mt-2 rounded-lg bg-pink-50 p-3 text-center font-mono text-xl font-bold tracking-[0.3em] text-pink-600">
          {state.code}
        </p>
      )}
    </div>
  );
}

export function LeaveFamilyButton() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => leaveFamily(),
    null
  );
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
      <h2 className="mb-1 font-medium text-red-700">退出家庭</h2>
      <p className="mb-3 text-sm text-red-600/70">
        退出后将失去家庭数据的访问权限，你的账号与个人记录会保留。此操作不可撤销。
      </p>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          {pending ? "退出中..." : "退出家庭"}
        </button>
      </form>
      {state?.message && (
        <p className={`mt-2 text-sm ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</p>
      )}
    </div>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => changePassword(formData),
    null
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500">旧密码</label>
        <input
          name="oldPassword"
          type="password"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">新密码（至少 6 位）</label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gray-800 py-2.5 font-medium text-white hover:bg-gray-900 disabled:opacity-50"
      >
        {pending ? "修改中..." : "修改密码"}
      </button>
    </form>
  );
}
