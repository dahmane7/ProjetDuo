// Bandeau d'information pleine largeur, rose pâle
export default function InfoBanner({ children }) {
  return (
    <div className="bg-duo-50">
      <p className="mx-auto max-w-6xl px-5 py-3.5 text-[15px] leading-relaxed font-semibold text-duo-700">
        {children}
      </p>
    </div>
  )
}
