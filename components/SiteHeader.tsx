import Link from "next/link";

const navItems = [
  { href: "/", label: "Builder" },
  { href: "/products", label: "Products" },
  { href: "/control", label: "Control" },
  { href: "/modules/builder-core", label: "Modules" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060913]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.24em] text-white/95"
        >
          ZARIA
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
