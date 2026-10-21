import { Link, Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-duo-600">
          Duo
        </Link>
      </header>
      <main className="flex-1 px-4 pb-8">
        <Outlet />
      </main>
    </div>
  )
}
