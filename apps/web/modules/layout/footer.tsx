export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <span className="font-mono text-lg font-bold">
              🌐 rent my browser 🦞
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Real browsers for AI agents. Earn while you sleep.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/how-it-works-detail" className="transition-colors hover:text-foreground">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/use-cases" className="transition-colors hover:text-foreground">
                  Use Cases
                </a>
              </li>
              <li>
                <a href="/compare" className="transition-colors hover:text-foreground">
                  Compare
                </a>
              </li>
              <li>
                <a href="/security" className="transition-colors hover:text-foreground">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Developers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/api-docs" className="transition-colors hover:text-foreground">
                  API Docs
                </a>
              </li>
              <li>
                <a href="/mcp" className="transition-colors hover:text-foreground">
                  MCP Integration
                </a>
              </li>
              <li>
                <a href="/for-ai-agents" className="transition-colors hover:text-foreground">
                  For AI Agents
                </a>
              </li>
              <li>
                <a href="/for-operators" className="transition-colors hover:text-foreground">
                  Run a Node
                </a>
              </li>
              <li>
                <a href="/browser-node-setup" className="transition-colors hover:text-foreground">
                  Node Setup
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://github.com/0xPasho/rent-my-browser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com/invite/Ma7GuySQ7h"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Discord
                </a>
              </li>
              <li>
                <a href="/about" className="transition-colors hover:text-foreground">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/terms" className="transition-colors hover:text-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} rent my browser. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
