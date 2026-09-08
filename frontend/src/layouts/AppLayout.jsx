import { Outlet } from 'react-router-dom'
import Brand from '../components/Brand'
import PrimaryNav from '../components/PrimaryNav'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand />
        <PrimaryNav />
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
