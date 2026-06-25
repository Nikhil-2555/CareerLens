import { Bell, Search } from 'lucide-react'
import { useUser, UserButton } from '@clerk/clerk-react'
import './TopBar.css'

export default function TopBar({ title, subtitle }) {
  const { user } = useUser()
  const userName = user?.fullName || user?.firstName || 'User'

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
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
