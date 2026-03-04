export const tiers = [
  {
    name: "Headless",
    price: "$0.05",
    unit: "per step",
    credits: "5 credits",
    description:
      "VPS-hosted headless Chromium. Fast and cheap for friendly sites.",
    features: [
      "Headless Chromium browser",
      "Datacenter IP",
      "Simple tasks only",
      "Fastest execution",
    ],
    popular: false,
  },
  {
    name: "Real Browser",
    price: "$0.10",
    unit: "per step",
    credits: "10 credits",
    description:
      "Real Chrome on a real machine. Residential IP. Passes basic detection.",
    features: [
      "Real Google Chrome",
      "Residential IP",
      "Passes bot detection",
      "Real browser fingerprint",
    ],
    popular: true,
  },
  {
    name: "Adversarial",
    price: "$0.15",
    unit: "per step",
    credits: "15 credits",
    description:
      "Premium anti-detection. Human-like behavior on protected sites.",
    features: [
      "Real Google Chrome",
      "Residential IP",
      "Anti-detection mode",
      "Passes advanced bot checks",
    ],
    popular: false,
  },
] as const;
