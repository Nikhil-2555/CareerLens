import Sidebar from './Sidebar'
import './DashboardLayout.css'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-layout__main">
        {children}
      </main>
    </div>
  )
}
