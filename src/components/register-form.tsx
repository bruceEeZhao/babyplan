"use client";

import { useActionState } from "react";
import { registerParent } from "@/app/auth-actions";

type ActionResult = { ok: boolean; message: string };

export function RegisterForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => registerParent(formData),
    null
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500">昵称</label>
        <input
          name="nickname"
          required
          placeholder="如：妈妈"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">手机号</label>
        <input
          name="phone"
          type="tel"
          required
          pattern="1\d{10}"
          placeholder="13800000001"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">密码（至少 6 位）</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="设置登录密码"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-500"}`}>{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-pink-500 py-2.5 font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        {pending ? "注册中..." : "注册"}
      </button>
    </form>
  );
}
