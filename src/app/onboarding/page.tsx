import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateFamilyButton, JoinFamilyForm, RegenerateCodeButton } from "@/components/onboarding-client";

export const metadata: Metadata = { title: "家庭设置 — BabyPlan" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.parent.findUnique({
    where: { id: session.user.id },
    include: { family: { include: { parents: true } } },
  });
  if (!me) redirect("/login");
  if (!me.family) return <NoFamily />;

  const activeInvite = await prisma.inviteCode.findFirst({
    where: { familyId: me.family.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  const partner = me.family.parents.find((p) => p.id !== me.id);

  return (
    <div className="mx-auto mt-10 max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">家庭设置</h1>
        <p className="text-sm text-gray-500">{me.family.parents.length} / 2 位成员</p>
      </header>

      <div className="space-y-3">
        {me.family.parents.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4"
          >
            <div>
              <p className="font-medium text-gray-800">
                {p.nickname}
                {p.id === me.id && <span className="ml-2 text-xs text-gray-400">（我）</span>}
              </p>
              <p className="text-xs text-gray-400">
                {p.isCreator ? "家庭创建者" : "成员"} · {p.phone}
              </p>
            </div>
          </div>
        ))}
      </div>

      {me.isCreator && (
        <section className="rounded-2xl border border-pink-100 bg-white p-4">
          <h2 className="mb-2 font-medium text-gray-800">邀请伴侣加入</h2>
          {activeInvite ? (
            <div className="rounded-lg bg-pink-50 p-3 text-center">
              <p className="font-mono text-xl font-bold tracking-[0.3em] text-pink-600">
                {activeInvite.code}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                有效期至 {activeInvite.expiresAt?.toLocaleDateString("zh-CN")}
              </p>
            </div>
          ) : (
            <p className="mb-2 text-sm text-gray-400">暂无有效邀请码</p>
          )}
          <div className="mt-2">
            <RegenerateCodeButton />
          </div>
        </section>
      )}

      {partner && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
          ✅ 已与「{partner.nickname}」绑定，双方数据实时同步
        </p>
      )}
    </div>
  );
}

function NoFamily() {
  return (
    <div className="mx-auto mt-16 max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">创建或加入家庭</h1>
        <p className="text-sm text-gray-500">BabyPlan 支持两位父母共享宝宝数据</p>
      </header>

      <section className="space-y-2 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="font-medium text-gray-800">新建家庭</h2>
        <p className="text-sm text-gray-500">
          创建后成为家庭创建者，可生成邀请码让伴侣加入
        </p>
        <CreateFamilyButton />
      </section>

      <section className="space-y-2 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="font-medium text-gray-800">加入已有家庭</h2>
        <p className="text-sm text-gray-500">向伴侣索取邀请码，输入后加入</p>
        <JoinFamilyForm />
      </section>
    </div>
  );
}
