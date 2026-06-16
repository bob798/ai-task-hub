export type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";
export type ImageQuality = "standard" | "hd";

// 单张图片定价（人民币）— 40-50% 毛利率
export const PRICE_TABLE: Record<ImageQuality, Record<"square" | "other", number>> = {
  standard: {
    square: 0.5,
    other: 0.7,
  },
  hd: {
    square: 1.0,
    other: 1.5,
  },
};

export function getPricePerImage(quality: ImageQuality, size: ImageSize): number {
  const category = size === "1024x1024" ? "square" : "other";
  return PRICE_TABLE[quality][category];
}

export function calculateTotalCost(
  quality: ImageQuality,
  size: ImageSize,
  count: number
): number {
  return getPricePerImage(quality, size) * count;
}

// 代码生成定价（人民币 / 次）
export const CODE_PRICE = 0.2;

// 文档处理定价（人民币 / 次）
export const DOC_PRICE = 0.3;
