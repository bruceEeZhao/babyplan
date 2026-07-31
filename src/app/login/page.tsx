import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth-client";

export const metadata: Metadata = { title: "登录 — BabyPlan" };

export default function LoginPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">登录 BabyPlan</h1>
        <p className="mt-1 text-sm text-gray-500">帮助新手爸妈与宝宝一起成长</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <LoginForm />
      </div>
      <p className="text-center text-sm text-gray-500">
        还没有账号？
        <Link href="/register" className="text-pink-500 hover:underline">
          立即注册
        </Link>
      </p>
    </div>
  );
}
