// Logo Duo : un sourire jaune posé sur le mot « duo »
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-end gap-1 leading-none ${className}`}>
      <svg viewBox="0 0 24 24" className="mb-[0.35em] size-[0.8em]" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="var(--color-soleil)" />
        <path
          d="M7 13.5c1.2 2.2 2.9 3.3 5 3.3s3.8-1.1 5-3.3"
          fill="none"
          stroke="var(--color-duo-600)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-extrabold tracking-tight text-duo-600">duo</span>
    </span>
  )
}
