"use client";

import { useActionState } from "react";
import { createFamily, generateInviteCode, joinFamilyByCode } from "@/app/auth-actions";

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
