"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full px-2.5 py-1.5 text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
    >
      退出
    </button>
  );
}
