# Node Types

The marketplace supports two classes of nodes. Consumers can request a specific
tier, or the system can auto-select based on the target site and task mode.

## VPS Nodes (Headless Tier)

- **Hardware**: Cloud VPS (DigitalOcean, Hetzner, AWS, etc.)
- **Browser**: Playwright-managed headless Chromium
- **Display**: None needed
- **IP type**: Datacenter
- **Supported task modes**: Simple only
- **Consumer pricing**: Cheap tier
- **Bot detection**: Will get caught on protected sites
- **Best for**: Internal tools, scraping friendly sites, QA on staging environments,
  any task where bot detection is not a concern

## Real Machine Nodes (Premium Tier)

- **Hardware**: Mac Mini, PCs, physical machines with GUI
- **Browser**: Real Google Chrome (not Chromium), launched normally
- **Display**: Physical or virtual display (Xvfb)
- **IP type**: Residential (high value for consumers)
- **Supported task modes**: Simple, Adversarial, Async
- **Consumer pricing**: Premium tier
- **Bot detection**: Passes — real browser, real fingerprint, no automation flags
- **Best for**: Sites with bot detection, form submissions on production sites,
  anything requiring a realistic browser fingerprint

## Anti-Detection (Real Machine Nodes)

Real machine nodes avoid bot detection by:

1. Running **real Google Chrome** (not Chromium, not Playwright-managed)
2. Launching **without** `--enable-automation`, `--headless`, or other telltale flags
3. Using **raw CDP** via `--remote-debugging-port` instead of Playwright/Puppeteer wrappers
4. Running on a real or virtual display (**Xvfb**) so Chrome has a screen context
5. **Not sending `Runtime.enable`** (the main CDP detection signal) unless necessary
6. Matching browser fingerprint to the node's actual environment (timezone, language,
   screen resolution)

## Node Registration

When a node connects to the marketplace, it advertises:

```
{
  "node_id": "uuid",
  "type": "headless" | "real",
  "browser": {
    "name": "chrome" | "chromium",
    "version": "124.0.6367.91"
  },
  "geo": {
    "country": "US",
    "region": "California",
    "city": "San Francisco",
    "ip_type": "residential" | "datacenter"
  },
  "capabilities": {
    "modes": ["simple", "adversarial", "async"],
    "max_concurrent": 1
  }
}
```

## Routing Logic

When a task is submitted, the router considers:

1. **Requested tier** — consumer explicitly asks for headless or real
2. **Task mode** — adversarial/async require real machine nodes
3. **Target site** — known bot-detection sites auto-upgrade to real
4. **Geo requirements** — consumer may need a specific country/region
5. **Availability** — which nodes are idle right now
6. **Load balancing** — distribute across nodes, don't overload one operator
