import { Bell, Search } from 'lucide-react'
import './TopBar.css'

export default function TopBar({ title, subtitle }) {
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"User"}')
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
      </div>
      <div className="topbar__right">
        <div className="topbar__search">
          <Search size={16} />
          <input type="text" placeholder="Search..." className="topbar__search-input" />
        </div>
        <button className="topbar__icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="topbar__notification-dot"></span>
        </button>
        <div className="topbar__profile">
          <div className="topbar__avatar">{initials}</div>
        </div>
      </div>
    </header>
  )
}
