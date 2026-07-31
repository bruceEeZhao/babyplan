import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "注册 — BabyPlan" };

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">注册 BabyPlan</h1>
        <p className="mt-1 text-sm text-gray-500">注册后创建家庭，与伴侣共享宝宝成长</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-gray-500">
        已有账号？
        <Link href="/login" className="text-pink-500 hover:underline">
          去登录
        </Link>
      </p>
    </div>
  );
}
