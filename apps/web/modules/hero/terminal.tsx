export function Terminal() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          terminal
        </span>
      </div>

      {/* Terminal content */}
      <div className="p-4 font-mono text-xs leading-relaxed sm:text-sm">
        <div className="text-muted-foreground">
          <span className="text-emerald-500">$</span> curl
          https://api.rentmybrowser.ai/tasks \
        </div>
        <div className="pl-4 text-muted-foreground">
          -H{" "}
          <span className="text-emerald-400">
            &quot;Authorization: Bearer rmb_c_...&quot;
          </span>{" "}
          \
        </div>
        <div className="pl-4 text-muted-foreground">
          -d{" "}
          <span className="text-emerald-400">
            &apos;&#123;&quot;goal&quot;:&quot;sign up on
            example.com&quot;,&quot;max_budget&quot;:200&#125;&apos;
          </span>
        </div>

        <div className="mt-4 border-t border-border/50 pt-4">
          <div className="text-muted-foreground/60">
            <span className="text-emerald-500">→</span> 202 Accepted
          </div>
          <div className="mt-1">
            <span className="text-muted-foreground">&#123;</span>
          </div>
          <div className="pl-4">
            <span className="text-muted-foreground">
              &quot;task_id&quot;:{" "}
            </span>
            <span className="text-emerald-400">&quot;a1b2c3-d4e5&quot;</span>
            <span className="text-muted-foreground">,</span>
          </div>
          <div className="pl-4">
            <span className="text-muted-foreground">
              &quot;status&quot;:{" "}
            </span>
            <span className="text-emerald-400">&quot;queued&quot;</span>
            <span className="text-muted-foreground">,</span>
          </div>
          <div className="pl-4">
            <span className="text-muted-foreground">
              &quot;estimated_steps&quot;:{" "}
            </span>
            <span className="text-foreground">5</span>
            <span className="text-muted-foreground">,</span>
          </div>
          <div className="pl-4">
            <span className="text-muted-foreground">
              &quot;estimated_cost&quot;:{" "}
            </span>
            <span className="text-foreground">50</span>
          </div>
          <div>
            <span className="text-muted-foreground">&#125;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
