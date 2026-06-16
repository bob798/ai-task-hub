export interface RechargePackage {
  id: string;
  amount: number;
  bonus: number;
  label: string;
  description: string;
}

export const RECHARGE_PACKAGES: RechargePackage[] = [
  { id: "pkg_10", amount: 10, bonus: 0, label: "¥10", description: "约可生成 20 张标准图" },
  { id: "pkg_50", amount: 50, bonus: 5, label: "¥50", description: "赠送 ¥5，约可生成 110 张" },
  { id: "pkg_100", amount: 100, bonus: 15, label: "¥100", description: "赠送 ¥15，约可生成 230 张" },
  { id: "pkg_200", amount: 200, bonus: 40, label: "¥200", description: "赠送 ¥40，约可生成 480 张" },
];

export function getPackageById(id: string): RechargePackage | undefined {
  return RECHARGE_PACKAGES.find((p) => p.id === id);
}
