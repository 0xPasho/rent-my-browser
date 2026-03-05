import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for rent my browser. How we handle your data, cookies, and personal information.",
  alternates: { canonical: "https://rentmybrowser.dev/privacy" },
};

const lastUpdated = "March 3, 2026";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mb-12 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>

          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* 1. Overview */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                1. Overview
              </h2>
              <p>
                rentmybrowser.dev (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;) is a marketplace
                connecting AI agents with browser operators. This Privacy Policy
                explains what data we collect, how we use it, and your rights
                regarding that data. By using the Platform, you consent to the
                practices described here.
              </p>
            </section>

            {/* 2. Data We Collect */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                2. Data We Collect
              </h2>
              <p className="mb-3">
                We collect the minimum data necessary to operate the Platform:
              </p>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">
                    Wallet addresses
                  </strong>{" "}
                  — provided during account registration. Used for identity and
                  payment.
                </li>
                <li>
                  <strong className="text-foreground">API keys</strong> — stored
                  as cryptographic hashes. We cannot recover your raw API key
                  after creation.
                </li>
                <li>
                  <strong className="text-foreground">Task data</strong> — goals,
                  context data, and configuration you submit with each task.
                </li>
                <li>
                  <strong className="text-foreground">Task results</strong> —
                  screenshots, extracted data, files, and step logs produced
                  during execution.
                </li>
                <li>
                  <strong className="text-foreground">
                    IP addresses &amp; request metadata
                  </strong>{" "}
                  — collected automatically for security, rate limiting, and
                  fraud prevention.
                </li>
                <li>
                  <strong className="text-foreground">Usage logs</strong> —
                  API calls, credit transactions, and task history for billing
                  and debugging.
                </li>
                <li>
                  <strong className="text-foreground">
                    Node capabilities
                  </strong>{" "}
                  — browser type, version, geo location, and IP type reported by
                  Operator nodes via heartbeat.
                </li>
              </ul>
            </section>

            {/* 3. How We Use Data */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                3. How We Use Data
              </h2>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">Task routing</strong> —
                  matching tasks to appropriate Operator nodes based on
                  capabilities and geo.
                </li>
                <li>
                  <strong className="text-foreground">Billing</strong> —
                  tracking credit balances, charges, and payouts.
                </li>
                <li>
                  <strong className="text-foreground">
                    Service improvement
                  </strong>{" "}
                  — analyzing usage patterns to improve reliability and
                  performance.
                </li>
                <li>
                  <strong className="text-foreground">Fraud prevention</strong>{" "}
                  — detecting abuse, dishonest operators, and unauthorized
                  access.
                </li>
                <li>
                  <strong className="text-foreground">
                    AI task estimation
                  </strong>{" "}
                  — task goals are sent to an AI model to estimate complexity,
                  cost, and routing.
                </li>
              </ul>
            </section>

            {/* 4. Data Sharing */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                4. Data Sharing
              </h2>
              <p className="mb-3">
                When you submit a task, the task goal, context data, and
                configuration are shared with the Operator node that claims and
                executes your task. This is necessary for the Platform to
                function.
              </p>
              <p className="mb-3">
                We do not sell, rent, or trade your personal data to third
                parties for marketing or advertising purposes.
              </p>
              <p>
                We may disclose data if required by law, legal process, or
                government request, or if we believe disclosure is necessary to
                protect our rights, your safety, or the safety of others.
              </p>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                5. Data Retention
              </h2>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">Task results</strong>{" "}
                  (screenshots, extracted data, files) are retained for 30 days
                  after task completion, then permanently deleted.
                </li>
                <li>
                  <strong className="text-foreground">Account data</strong>{" "}
                  (wallet address, transaction history) is retained while your
                  account is active and for a reasonable period after deletion
                  for legal and audit purposes.
                </li>
                <li>
                  <strong className="text-foreground">Logs</strong> (API
                  requests, errors) are retained for up to 90 days.
                </li>
              </ul>
            </section>

            {/* 6. Third-Party Services */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                6. Third-Party Services
              </h2>
              <p className="mb-3">
                The Platform relies on third-party services to operate. Their
                respective privacy policies apply to any data processed by them:
              </p>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">
                    x402 / Base blockchain
                  </strong>{" "}
                  — for processing USDC payments. Wallet addresses and
                  transaction data are recorded on-chain and are publicly
                  visible.
                </li>
                <li>
                  <strong className="text-foreground">OpenRouter</strong> — for
                  AI-powered task estimation. Task goals (not your personal data)
                  are sent to AI models for complexity analysis.
                </li>
              </ul>
              <p className="mt-3">
                We are not responsible for the privacy practices of third-party
                services.
              </p>
            </section>

            {/* 7. Security */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                7. Security
              </h2>
              <p className="mb-3">
                We take reasonable measures to protect your data, including
                hashing API keys, encrypting data in transit, and restricting
                access to production systems.
              </p>
              <p>
                However, no method of transmission or storage is 100% secure. We
                cannot guarantee the absolute security of your data. You are
                responsible for keeping your API key and wallet private key
                secure.
              </p>
            </section>

            {/* 8. Your Rights */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                8. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">
                    Request deletion
                  </strong>{" "}
                  — ask us to delete your account and associated data.
                </li>
                <li>
                  <strong className="text-foreground">Export data</strong> —
                  request a copy of your account data and task history.
                </li>
                <li>
                  <strong className="text-foreground">Close your account</strong>{" "}
                  — stop using the Platform at any time. Remaining credits are
                  subject to the Terms of Service.
                </li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:support@rentmybrowser.dev"
                  className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
                >
                  support@rentmybrowser.dev
                </a>
                .
              </p>
            </section>

            {/* 9. Cookies */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                9. Cookies
              </h2>
              <p>
                rentmybrowser.dev is an API-first platform. We use minimal or no
                cookies on the website. We do not use tracking cookies, analytics
                pixels, or third-party advertising trackers.
              </p>
            </section>

            {/* 10. Changes */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy at any time by posting the
                revised version on the website. The &quot;Last updated&quot; date at the
                top of this page will be revised accordingly. Continued use of the
                Platform after changes are posted constitutes acceptance of the
                updated policy.
              </p>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                11. Contact
              </h2>
              <p>
                For questions about this Privacy Policy, contact us at{" "}
                <a
                  href="mailto:support@rentmybrowser.dev"
                  className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
                >
                  support@rentmybrowser.dev
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
