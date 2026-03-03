import { env } from "../../env.js";

export interface TaskEstimate {
  safe: boolean;
  reason?: string;
  tier: "headless" | "real";
  mode: "simple" | "adversarial";
  complexity: "simple" | "medium" | "complex";
  estimatedSteps: number;
  routing: {
    geo?: string;
    site?: string;
    requiresResidentialIp: boolean;
    botDetectionLevel: "none" | "low" | "high";
  };
}

const SYSTEM_PROMPT = `You are a browser task estimator and router. Given a task goal and context, analyze it and return a JSON object with:

- "safe": boolean — false if the task involves credential stuffing, abuse, illegal content, or malicious intent
- "reason": string — if unsafe, explain why. If safe, omit this field
- "tier": "headless" or "real" — "real" if the target site likely has bot detection (e.g. major platforms, banks, social media), "headless" for simple/internal sites
- "mode": "simple" or "adversarial" — "adversarial" if the site is known to analyze mouse movements, typing patterns, or behavioral signals (e.g. Facebook, Google, Amazon, banks)
- "complexity": "simple", "medium", or "complex" — based on number of pages, interactions, and form fields
- "estimatedSteps": number — estimated browser actions needed (navigate, click, type, screenshot each count as 1)
- "routing": object with:
  - "geo": ISO 3166-1 alpha-2 country code if a specific geography is mentioned or implied (e.g. "MX" for Mexico, "US" for United States). null if no geo preference
  - "site": the main domain being targeted (e.g. "facebook.com", "example.com"). null if unclear
  - "requiresResidentialIp": boolean — true if the site blocks datacenter IPs (e.g. social media, banks, streaming)
  - "botDetectionLevel": "none", "low", or "high" — how aggressive the site's bot detection is

Return ONLY valid JSON, no markdown or explanation.`;

const BOT_DETECTION_SITES = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "google.com",
  "youtube.com",
  "linkedin.com",
  "amazon.com",
  "netflix.com",
  "spotify.com",
  "tiktok.com",
  "reddit.com",
  "github.com",
  "microsoft.com",
  "apple.com",
];

const COUNTRY_KEYWORDS: Record<string, string> = {
  mexico: "MX",
  méxico: "MX",
  usa: "US",
  "united states": "US",
  canada: "CA",
  brazil: "BR",
  brasil: "BR",
  uk: "GB",
  "united kingdom": "GB",
  england: "GB",
  germany: "DE",
  deutschland: "DE",
  france: "FR",
  spain: "ES",
  españa: "ES",
  italy: "IT",
  italia: "IT",
  japan: "JP",
  china: "CN",
  india: "IN",
  australia: "AU",
  argentina: "AR",
  colombia: "CO",
  chile: "CL",
  peru: "PE",
  perú: "PE",
};

export async function estimateTask(
  goal: string,
  context?: Record<string, unknown>,
  requestedTier?: "headless" | "real" | "auto",
  requestedMode?: "simple" | "adversarial",
): Promise<TaskEstimate> {
  if (!env.OPENROUTER_API_KEY) {
    return fallbackEstimate(goal, requestedTier, requestedMode);
  }

  try {
    const userMessage = context
      ? `Goal: ${goal}\nContext: ${JSON.stringify(context)}`
      : `Goal: ${goal}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "OpenRouter error:",
        response.status,
        await response.text(),
      );
      return fallbackEstimate(goal, requestedTier, requestedMode);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return fallbackEstimate(goal, requestedTier, requestedMode);
    }

    const parsed = JSON.parse(content) as TaskEstimate;

    // Override tier/mode if consumer explicitly requested them
    if (requestedTier && requestedTier !== "auto") {
      parsed.tier = requestedTier;
    }
    if (requestedMode) {
      parsed.mode = requestedMode;
    }

    // Ensure routing object exists
    if (!parsed.routing) {
      parsed.routing = {
        requiresResidentialIp: parsed.tier === "real",
        botDetectionLevel: "none",
      };
    }

    return parsed;
  } catch (err) {
    console.error("AI estimation failed, using fallback:", err);
    return fallbackEstimate(goal, requestedTier, requestedMode);
  }
}

function fallbackEstimate(
  goal: string,
  requestedTier?: "headless" | "real" | "auto",
  requestedMode?: "simple" | "adversarial",
): TaskEstimate {
  const goalLower = goal.toLowerCase();

  // Extract geo
  let geo: string | undefined;
  for (const [keyword, code] of Object.entries(COUNTRY_KEYWORDS)) {
    if (goalLower.includes(keyword)) {
      geo = code;
      break;
    }
  }

  // Extract site
  const siteMatch = goal.match(
    /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/,
  );
  const site = siteMatch ? siteMatch[1] : undefined;

  // Detect bot detection level
  const hasBotDetection = site
    ? BOT_DETECTION_SITES.some((s) => site.includes(s))
    : false;
  const botDetectionLevel = hasBotDetection ? "high" : "none";
  const requiresResidentialIp = hasBotDetection;

  // Determine tier
  let tier: "headless" | "real" =
    requestedTier && requestedTier !== "auto" ? requestedTier : "headless";
  if (hasBotDetection && tier === "headless") {
    tier = "real";
  }

  // Determine mode
  let mode: "simple" | "adversarial" = requestedMode || "simple";
  if (hasBotDetection && mode === "simple") {
    mode = "adversarial";
  }

  // Count steps
  const actionWords = [
    "navigate",
    "go to",
    "visit",
    "open",
    "click",
    "press",
    "submit",
    "tap",
    "fill",
    "type",
    "enter",
    "input",
    "screenshot",
    "scrape",
    "extract",
    "download",
    "scroll",
    "wait",
    "select",
    "choose",
    "create",
    "sign up",
    "signup",
    "register",
    "log in",
    "login",
  ];

  let steps = 2;
  for (const word of actionWords) {
    if (goalLower.includes(word)) steps++;
  }
  steps = Math.min(steps, 15);

  const complexity = steps <= 3 ? "simple" : steps <= 7 ? "medium" : "complex";

  return {
    safe: true,
    tier,
    mode,
    complexity: complexity as "simple" | "medium" | "complex",
    estimatedSteps: steps,
    routing: {
      geo,
      site,
      requiresResidentialIp,
      botDetectionLevel,
    },
  };
}
