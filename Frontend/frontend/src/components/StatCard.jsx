import styles from './StatCard.module.css'

export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className={styles.card} style={{ '--card-accent': color }}>
      <div className={styles.icon}>
        <Icon size={20} />
      </div>
      <div>
        <p className={styles.value}>{value ?? '—'}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  )
}