const links = [
  { href: "#overview", label: "Overview" },
  { href: "#facilities", label: "Facilities" },
  { href: "#trends", label: "Trends" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-900/95 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <a href="#overview" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/20 ring-1 ring-leaf/40">
            <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
              <rect x="3" y="3" width="10" height="10" rx="2" fill="#3dcc8a" />
              <rect x="19" y="3" width="10" height="10" rx="2" fill="#9fe7c4" />
              <rect x="3" y="19" width="10" height="10" rx="2" fill="#9fe7c4" />
              <path
                d="M24.5 18.5c-4 1.2-6.2 4.4-6.5 8.5 4.2-.4 7.5-2.8 8.7-6.8-1.6.4-3.1.3-4.4-.3 2.8-1 4.6-1.8 5.7-4.4-1.3 1.1-2.4 1.8-3.5 3z"
                fill="#3dcc8a"
              />
            </svg>
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight">
              GreenGrid
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-leaf">
              Energy Ops
            </span>
          </span>
        </a>
        <ul className="flex items-center gap-1 text-sm font-semibold">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
