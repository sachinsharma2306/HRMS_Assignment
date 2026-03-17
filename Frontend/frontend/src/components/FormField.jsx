import styles from './FormField.module.css'

export default function FormField({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}