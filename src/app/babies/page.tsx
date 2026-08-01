import { prisma } from "@/lib/prisma";
import { monthAgeOf } from "@/lib/checklist";
import { getCurrentBabyId } from "@/lib/current-baby";
import { requireFamilyContext } from "@/lib/session";
import { AddBabyForm, BabySwitchButton } from "@/components/baby-client";

export const dynamic = "force-dynamic";

export default async function BabiesPage() {
  const { familyId } = await requireFamilyContext();
  const currentId = await getCurrentBabyId();
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: { babies: true, parents: true },
  });
  if (!family) return <p className="text-gray-500">家庭不存在</p>;

  const babies = family.babies;
  const parents = family.parents;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">婴儿管理</h1>
        <p className="text-sm text-gray-500">
          家庭共 {parents.length} 位父母 · {babies.length} 个宝宝
        </p>
      </header>

      <div className="space-y-3">
        {babies.map((b) => {
          const monthAge = monthAgeOf(b.birthDate);
          return (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div>
                <h3 className="font-medium text-gray-800">
                  {b.gender === "MALE" ? "👦" : "👧"} {b.nickname}
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  月龄 {monthAge} 个月 · {b.birthDate.toLocaleDateString("zh-CN")} 出生
                </p>
              </div>
              <BabySwitchButton babyId={b.id} isCurrent={b.id === currentId} />
            </div>
          );
        })}
        {babies.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            还没有宝宝档案
          </p>
        )}
      </div>

      <AddBabyForm />
    </div>
  );
}
