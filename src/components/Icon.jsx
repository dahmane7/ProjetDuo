// Icônes au trait, 24 × 24, qui prennent la couleur du texte
const TRACES = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12Z" />
      <circle cx="7.5" cy="8.5" r="1.5" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M17 6l3 3M15 8l2 2" />
    </>
  ),
  restaurant: (
    <>
      <path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v6M9 3v6" />
      <path d="M17 21V3c-2 1-3 4-3 8h3" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3" />
    </>
  ),
  beaute: (
    <path d="M12 3c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6ZM19 15c.3 1.7 1 2.4 2 2.5-1 .3-1.7 1-2 2.5-.3-1.5-1-2.2-2-2.5 1-.1 1.7-.8 2-2.5Z" />
  ),
  loisirs: (
    <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8ZM10 6v12" />
  ),
  commerce: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
}

export default function Icon({ name, className = 'size-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {TRACES[name]}
    </svg>
  )
}
