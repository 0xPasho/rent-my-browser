import Image from "next/image";

const brands = [
  {
    name: "Base",
    src: "/logos/base.png",
    href: "https://base.org",
    invert: false,
  },
  {
    name: "Chromium",
    src: "/logos/chromium.png",
    href: "https://www.chromium.org",
    invert: false,
  },
  {
    name: "OpenRouter",
    src: "/logos/openrouter.png",
    href: "https://openrouter.ai",
    invert: true,
  },
];

export function PoweredBy() {
  return (
    <section className="border-y border-border py-12">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Powered by
        </p>
        <div className="flex items-center justify-center gap-14 md:gap-20">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 transition-opacity hover:opacity-100"
            >
              <Image
                src={brand.src}
                alt={brand.name}
                width={48}
                height={48}
                className={`h-10 w-10 object-contain md:h-12 md:w-12 ${brand.invert ? "brightness-0 invert" : ""}`}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
