"use client";

import { useActionState } from "react";
import { confirmMilestone } from "@/app/actions";

type ActionResult = { ok: boolean; message: string };

export function ConfirmMilestoneButton({ markId, ready }: { markId: string; ready: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    () => confirmMilestone(markId),
    null
  );
  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending || !ready}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            ready
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {pending ? "..." : ready ? "确认达成" : "继续练习"}
        </button>
      </form>
      {state?.message && (
        <p className={`mt-1 text-xs ${state.ok ? "text-green-600" : "text-amber-600"}`}>{state.message}</p>
      )}
    </div>
  );
}
