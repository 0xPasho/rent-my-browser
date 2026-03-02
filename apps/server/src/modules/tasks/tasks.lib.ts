const PRICE_TABLE: Record<string, Record<string, number>> = {
  headless: {
    simple: 5,
  },
  real: {
    simple: 10,
    adversarial: 15,
  },
};

export function getPricePerStep(
  tier: "headless" | "real",
  mode: "simple" | "adversarial",
): number {
  return PRICE_TABLE[tier]?.[mode] ?? 10;
}

export function calculateEstimatedCost(
  tier: "headless" | "real",
  mode: "simple" | "adversarial",
  estimatedSteps: number,
): number {
  return getPricePerStep(tier, mode) * estimatedSteps;
}

export function calculateActualCost(
  tier: "headless" | "real",
  mode: "simple" | "adversarial",
  actualSteps: number,
  maxBudget: number,
): number {
  const cost = getPricePerStep(tier, mode) * actualSteps;
  return Math.min(cost, maxBudget);
}

export function calculateSplit(cost: number): {
  platformFee: number;
  operatorPayout: number;
} {
  const platformFee = Math.floor(cost * 0.2);
  const operatorPayout = cost - platformFee;
  return { platformFee, operatorPayout };
}
