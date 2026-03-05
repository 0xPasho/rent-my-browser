import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for rent my browser. Rules for using the browser rental marketplace.",
  alternates: { canonical: "https://rentmybrowser.dev/terms" },
};

const lastUpdated = "March 3, 2026";

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            Terms of Service
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
              <p className="mb-3">
                rentmybrowser.dev (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;) is a marketplace that
                connects AI agents (&quot;Consumers&quot;) with individuals who make their
                browsers available for task execution (&quot;Operators&quot;). We act solely
                as an intermediary — we do not control, operate, or supervise the
                browsers, the tasks submitted, or the results produced.
              </p>
              <p>
                By accessing or using rentmybrowser.dev, including our API, MCP
                server, website, or any related services, you agree to be bound by
                these Terms of Service. If you do not agree, do not use the
                Platform.
              </p>
            </section>

            {/* 2. Definitions */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                2. Definitions
              </h2>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">Consumer</strong> — a user
                  or AI agent that submits browser tasks for execution.
                </li>
                <li>
                  <strong className="text-foreground">Operator</strong> — a user
                  who connects their machine to the network to execute tasks.
                </li>
                <li>
                  <strong className="text-foreground">Node</strong> — a browser
                  instance registered by an Operator.
                </li>
                <li>
                  <strong className="text-foreground">Task</strong> — a unit of
                  work submitted by a Consumer for execution on a Node.
                </li>
                <li>
                  <strong className="text-foreground">Credits</strong> — the
                  Platform&apos;s unit of value. 1 credit = $0.01 USD.
                </li>
              </ul>
            </section>

            {/* 3. Accounts & API Keys */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                3. Accounts &amp; API Keys
              </h2>
              <p className="mb-3">
                You may register an account by providing an Ethereum wallet
                address. Upon registration, you receive an API key that grants
                access to the Platform.
              </p>
              <p className="mb-3">
                You are solely responsible for the security of your API key and
                wallet private key. Any activity conducted through your API key is
                your responsibility. If you believe your key has been compromised,
                you must rotate it immediately via the wallet recovery flow.
              </p>
              <p>
                We reserve the right to suspend or terminate any account at our
                sole discretion, with or without notice.
              </p>
            </section>

            {/* 4. Acceptable Use */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                4. Acceptable Use
              </h2>
              <p className="mb-3">You agree not to use the Platform to:</p>
              <ul className="mb-3 list-inside list-disc space-y-1">
                <li>Violate any applicable law or regulation</li>
                <li>
                  Conduct fraud, identity theft, or unauthorized access to
                  third-party systems
                </li>
                <li>
                  Launch denial-of-service attacks, distribute malware, or engage
                  in any form of cyberattack
                </li>
                <li>
                  Access, store, or distribute child sexual abuse material (CSAM)
                  or any illegal content
                </li>
                <li>Harass, threaten, or harm any individual</li>
                <li>
                  Scrape or access third-party websites in violation of their
                  terms of service
                </li>
                <li>
                  Circumvent security measures or abuse the Platform&apos;s
                  infrastructure
                </li>
                <li>
                  Resell, redistribute, or sublicense access to the Platform
                  without written permission
                </li>
              </ul>
              <p>
                We may suspend or terminate your access immediately if we
                reasonably believe you have violated these terms. You are solely
                responsible for ensuring your use of rented browsers complies with
                all applicable laws and third-party terms.
              </p>
            </section>

            {/* 5. Credits & Payments */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                5. Credits &amp; Payments
              </h2>
              <p className="mb-3">
                Credits are prepaid and non-refundable. You can purchase credits
                via the API or MCP (x402, USDC on Base) or directly on the
                website. 1 credit = $0.01 USD.
              </p>
              <p className="mb-3">
                When you submit a task, your maximum budget is held from your
                balance. If the task completes, you are charged the actual cost
                (number of steps executed). If the task fails, the held amount is
                released back to your balance.
              </p>
              <p className="mb-3">
                Cryptocurrency payments are final and irreversible. We are not
                responsible for tokens sent to incorrect addresses, failed
                blockchain transactions, or fluctuations in token value.
              </p>
              <p>
                We reserve the right to modify pricing, credit tiers, and payment
                methods at any time. Changes will be posted on the website.
              </p>
            </section>

            {/* 6. Tasks & Execution */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                6. Tasks &amp; Execution
              </h2>
              <p className="mb-3">
                The Platform routes tasks to available Operator nodes. We do not
                guarantee that any task will be completed, completed correctly, or
                completed within any specific timeframe.
              </p>
              <p className="mb-3">
                Task results — including screenshots, extracted data, and files —
                are produced by Operator nodes, not by rentmybrowser.dev. We are
                not responsible for the accuracy, completeness, legality, or
                quality of any task output.
              </p>
              <p>
                You acknowledge that tasks are executed on real machines operated
                by third parties. The Platform has no control over the execution
                environment, network conditions, or browser behavior on Operator
                machines.
              </p>
            </section>

            {/* 7. Operator Responsibilities */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                7. Operator Responsibilities
              </h2>
              <p className="mb-3">
                Operators voluntarily connect their machines to the network. By
                doing so, you acknowledge that AI agents will execute browser
                tasks on your machine.
              </p>
              <p className="mb-3">
                You are responsible for your own hardware, software, network, and
                any consequences of running tasks on your machine. The Platform
                does not guarantee any level of earnings, task volume, or
                compensation.
              </p>
              <p>
                Operators must not tamper with task execution, fabricate results,
                or misrepresent their node capabilities. Dishonest behavior may
                result in score penalties, reduced task offers, or account
                termination.
              </p>
            </section>

            {/* 8. Intellectual Property */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                8. Intellectual Property
              </h2>
              <p className="mb-3">
                You retain ownership of any data you submit to the Platform
                (task goals, context data, extracted results). We do not claim
                ownership of your content.
              </p>
              <p>
                The Platform, its API, MCP server, website, branding, and all
                related technology are the intellectual property of
                rentmybrowser.dev. You may not copy, modify, or reverse-engineer
                any part of the Platform without written permission.
              </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                9. Limitation of Liability
              </h2>
              <p className="mb-3 font-semibold uppercase text-foreground">
                The Platform is provided &quot;as is&quot; and &quot;as available&quot; without
                warranties of any kind, express or implied, including but not
                limited to merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
              <p className="mb-3">
                To the maximum extent permitted by law, rentmybrowser.dev shall not
                be liable for any indirect, incidental, special, consequential, or
                punitive damages, including but not limited to loss of profits,
                data, business opportunities, or goodwill, arising from your use
                of the Platform.
              </p>
              <p className="mb-3">
                Our total aggregate liability for any claims arising from or
                related to these Terms or your use of the Platform shall not
                exceed the total amount of credits you purchased in the twelve
                (12) months preceding the claim.
              </p>
              <p>
                We are not liable for any actions taken by Consumers or Operators
                on the Platform, any third-party websites accessed through rented
                browsers, or any consequences of task execution. As an
                intermediary, we facilitate connections but do not participate in,
                supervise, or endorse any specific task or its outcome.
              </p>
            </section>

            {/* 10. Indemnification */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                10. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless
                rentmybrowser.dev, its founders, employees, and affiliates from
                any claims, damages, losses, liabilities, costs, and expenses
                (including legal fees) arising from: (a) your use of the
                Platform, (b) your violation of these Terms, (c) your violation of
                any law or third-party rights, or (d) any content or data you
                submit, transmit, or receive through the Platform.
              </p>
            </section>

            {/* 11. Termination */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                11. Termination
              </h2>
              <p className="mb-3">
                We may suspend or terminate your access to the Platform at any
                time, for any reason, with or without notice. Reasons may include,
                but are not limited to, violation of these Terms, suspected
                fraudulent activity, or inactivity.
              </p>
              <p>
                Upon termination, your API keys will be revoked and any remaining
                credit balance may be forfeited. We are not obligated to provide
                refunds upon termination.
              </p>
            </section>

            {/* 12. Changes */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                12. Changes to These Terms
              </h2>
              <p>
                We may update these Terms at any time by posting the revised
                version on the website. The &quot;Last updated&quot; date at the top of
                this page will be revised accordingly. Continued use of the
                Platform after changes are posted constitutes acceptance of the
                updated Terms.
              </p>
            </section>

            {/* 13. Contact */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                13. Contact
              </h2>
              <p>
                For questions about these Terms, contact us at{" "}
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
