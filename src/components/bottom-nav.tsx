"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "今日清单", icon: "📋", match: (p: string) => p === "/" },
  { href: "/milestones", label: "里程碑", icon: "🎯", match: (p: string) => p.startsWith("/milestones") },
  { href: "/stats", label: "统计", icon: "📊", match: (p: string) => p.startsWith("/stats") },
  { href: "/me", label: "我的", icon: "👤", match: (p: string) => p.startsWith("/me") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-xs transition ${
                active ? "text-pink-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
