import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck } from 'lucide-react'
import styles from './Layout.module.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', Icon: Users },
  { to: '/attendance', label: 'Attendance', Icon: CalendarCheck },
]

export default function Layout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span>HRMS Lite</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>Admin Panel</div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}