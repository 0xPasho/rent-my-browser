import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "About",
  description: "About rent my browser and its creator, Pasho.",
  alternates: { canonical: "https://rentmybrowser.dev/about" },
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-emerald-500">
            built by
          </p>
          <h1 className="mb-4 font-mono text-2xl font-bold">pasho</h1>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Builder. I like creating products and shipping them. rent my browser
            is one of many.
          </p>
          <a
            href="https://x.com/0xpasho"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm text-emerald-500 transition-colors hover:text-emerald-400"
          >
            @0xpasho
            <span className="text-xs text-muted-foreground">&rarr;</span>
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
