"use client";

import { useActionState } from "react";
import { completeItem, replaceItem, ensureTodayChecklist } from "@/app/actions";

type ActionResult = { ok: boolean; message: string };

export function CompleteButton({ itemId, completed, target }: { itemId: string; completed: number; target: number }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => completeItem(itemId),
    null
  );
  const done = completed >= target;
  return (
    <div className="flex items-center gap-2">
      <form action={action}>
        <button
          type="submit"
          disabled={pending || done}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            done
              ? "bg-green-100 text-green-700 cursor-default"
              : "bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50"
          }`}
        >
          {done ? "✓ 已完成" : pending ? "..." : `完成 ${completed}/${target} 次`}
        </button>
      </form>
      {state && !state.ok && <span className="text-xs text-amber-600">{state.message}</span>}
    </div>
  );
}

export function ReplacePanel({
  itemId,
  currentTitle,
  candidates,
  isProtected = false,
}: {
  itemId: string;
  currentTitle: string;
  candidates: { id: string; title: string; dailyTargetCount: number }[];
  isProtected?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => replaceItem(itemId, String(formData.get("activityId"))),
    null
  );
  if (isProtected) {
    return (
      <p className="flex items-center gap-1 text-xs font-medium text-orange-500">
        <span>💪</span> 大运动每日必练，不可替换
      </p>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">替换「{currentTitle}」为：</span>
      <select
        name="activityId"
        className="rounded border border-gray-200 px-2 py-1 text-sm"
        defaultValue=""
        required
      >
        <option value="" disabled>
          选择一个活动
        </option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}（每日 {c.dailyTargetCount} 次）
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200"
      >
        替换
      </button>
      {state?.message && <span className={`text-xs ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</span>}
    </form>
  );
}

export function GenerateButton({ hasChecklist }: { hasChecklist: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => ensureTodayChecklist(),
    null
  );
  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-pink-500 py-3 font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        {hasChecklist ? "重新生成今日清单" : "生成今日清单"}
      </button>
      {state?.message && (
        <p className={`text-center text-sm ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</p>
      )}
    </form>
  );
}
