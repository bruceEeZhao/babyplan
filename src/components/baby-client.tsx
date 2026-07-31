"use client";

import { useActionState } from "react";
import { addBaby, switchBaby } from "@/app/actions";

type ActionResult = { ok: boolean; message: string };

export function AddBabyForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => addBaby(formData),
    null
  );
  return (
    <form action={action} className="space-y-3 rounded-xl border border-gray-200 p-4">
      <h2 className="font-medium text-gray-800">添加婴儿</h2>
      <div>
        <label className="mb-1 block text-xs text-gray-500">昵称</label>
        <input
          name="nickname"
          required
          placeholder="如：小星星"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">出生日期</label>
        <input
          name="birthDate"
          type="date"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-pink-500 py-2 font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        {pending ? "添加中..." : "添加"}
      </button>
      {state?.message && (
        <p className={`text-center text-sm ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</p>
      )}
    </form>
  );
}

export function BabySwitchButton({
  babyId,
  isCurrent,
}: {
  babyId: string;
  isCurrent: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => switchBaby(babyId),
    null
  );
  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending || isCurrent}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            isCurrent
              ? "bg-pink-100 text-pink-700 cursor-default"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          }`}
        >
          {isCurrent ? "✓ 当前" : pending ? "..." : "切换"}
        </button>
      </form>
      {state?.message && !isCurrent && (
        <p className={`mt-1 text-xs ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</p>
      )}
    </div>
  );
}
