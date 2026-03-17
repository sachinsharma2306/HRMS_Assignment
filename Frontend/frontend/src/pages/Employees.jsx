import { useEffect, useState } from 'react'
import { Plus, Trash2, Search, Users, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import styles from './Employees.module.css'
import s from '../components/shared.module.css'

const empty = { employee_id: '', full_name: '', email: '', department: '' }

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetchEmployees = () => {
    setError(false)
    api.get('/employees/')
      .then(r => setEmployees(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmployees() }, [])

  const validate = () => {
    const e = {}
    if (!form.employee_id.trim()) e.employee_id = 'Employee ID is required'
    if (!form.full_name.trim())   e.full_name   = 'Full name is required'
    if (!form.email.trim())       e.email       = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.department.trim())  e.department  = 'Department is required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      await api.post('/employees/', form)
      toast.success('Employee added!')
      setShowModal(false)
      setForm(empty)
      setErrors({})
      fetchEmployees()
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${deleteId}/`)
      toast.success('Employee removed')
      setDeleteId(null)
      fetchEmployees()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employees</h1>
          <p className={styles.sub}>{employees.length} total employees</p>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={`${s.input} ${styles.searchInput}`}
            placeholder="Search by name, ID, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={s.emptyState}>
            <p>Loading employees...</p>
          </div>
        ) : error ? (
          <div className={s.emptyState} style={{ color: 'var(--danger)' }}>
            <AlertCircle size={36} strokeWidth={1.2} />
            <p>Failed to load employees. <button
              onClick={fetchEmployees}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 500,
                padding: 0,
                fontSize: 'inherit'
              }}
            >Try again</button></p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={s.emptyState}>
            <Users size={36} strokeWidth={1.2} />
            <p>{search ? 'No matching employees found.' : 'No employees yet. Add one to get started.'}</p>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Present Days</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td><code className={styles.eid}>{emp.employee_id}</code></td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.total_present}</td>
                  <td>
                    <button
                      className={`${s.btn} ${s.btnDanger}`}
                      style={{ padding: '6px 10px' }}
                      onClick={() => setDeleteId(emp.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <Modal title="Add New Employee" onClose={() => { setShowModal(false); setForm(empty); setErrors({}) }}>
          <div className={styles.form}>
            <FormField label="Employee ID" error={errors.employee_id}>
              <input
                className={`${s.input} ${errors.employee_id ? s.inputError : ''}`}
                placeholder="e.g. EMP001"
                value={form.employee_id}
                onChange={e => setForm({ ...form, employee_id: e.target.value })}
              />
            </FormField>
            <FormField label="Full Name" error={errors.full_name}>
              <input
                className={`${s.input} ${errors.full_name ? s.inputError : ''}`}
                placeholder="John Doe"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
              />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <input
                className={`${s.input} ${errors.email ? s.inputError : ''}`}
                type="email"
                placeholder="john@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Department" error={errors.department}>
              <input
                className={`${s.input} ${errors.department ? s.inputError : ''}`}
                placeholder="Engineering"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </FormField>
            <div className={styles.formActions}>
              <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Add Employee'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Employee" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Are you sure? This will also remove all attendance records for this employee.
          </p>
          <div className={styles.formActions}>
            <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setDeleteId(null)}>Cancel</button>
            <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}