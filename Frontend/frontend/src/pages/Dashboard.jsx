import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Building2, AlertCircle } from 'lucide-react'
import StatCard from '../components/StatCard'
import api from '../api/axios'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get('/dashboard/')
      .then(r => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Overview of your workforce today</p>
        <p className={styles.loading}>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Overview of your workforce today</p>
        <div className={styles.errorState}>
          <AlertCircle size={32} strokeWidth={1.4} />
          <p>Failed to load dashboard data. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.sub}>Overview of your workforce today</p>
      <div className={styles.grid}>
        <StatCard label="Total Employees" value={stats?.total_employees} icon={Users}      color="#2d6a4f" />
        <StatCard label="Present Today"   value={stats?.present_today}   icon={UserCheck}  color="#2980b9" />
        <StatCard label="Absent Today"    value={stats?.absent_today}    icon={UserX}      color="#c0392b" />
        <StatCard label="Departments"     value={stats?.departments}     icon={Building2}  color="#8e44ad" />
      </div>
    </div>
  )
}