import { useEffect, useState } from 'react'
import { Plus, CalendarCheck, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import styles from './Attendance.module.css'
import s from '../components/shared.module.css'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  // mark attendance modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee: '', date: '', status: 'Present' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // edit modal
  const [editRecord, setEditRecord] = useState(null)
  const [editSaving, setEditSaving] = useState(false)

  // filters
  const [filterDate, setFilterDate] = useState('')
  const [filterEmp, setFilterEmp] = useState('')

  const fetchRecords = () => {
    const params = {}
    if (filterDate) params.date = filterDate
    if (filterEmp) params.employee_id = filterEmp

    api.get('/attendance/', { params })
      .then(r => setRecords(r.data))
      .catch(() => toast.error('Failed to load records'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/employees/')
      .then(r => setEmployees(r.data))
      .catch(() => toast.error('Failed to load employees'))
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [filterDate, filterEmp])

  const validate = () => {
    const e = {}
    if (!form.employee) e.employee = 'Select an employee'
    if (!form.date)     e.date     = 'Date is required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setSaving(true)
    try {
      await api.post('/attendance/', form)
      toast.success('Attendance marked!')
      setShowModal(false)
      setForm({ employee: '', date: '', status: 'Present' })
      setErrors({})
      fetchRecords()
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    setEditSaving(true)
    try {
      await api.patch(`/attendance/${editRecord.id}/`, { status: editRecord.status })
      toast.success('Attendance updated!')
      setEditRecord(null)
      fetchRecords()
    } catch (err) {
      const msg = err.response?.data?.error || 'Update failed'
      toast.error(msg)
    } finally {
      setEditSaving(false)
    }
  }

  const clearFilters = () => {
    setFilterDate('')
    setFilterEmp('')
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Attendance</h1>
          <p className={styles.sub}>{records.length} records</p>
        </div>
        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="date"
          className={s.input}
          style={{ maxWidth: 180 }}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        <select
          className={s.input}
          style={{ maxWidth: 200 }}
          value={filterEmp}
          onChange={e => setFilterEmp(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
        {(filterDate || filterEmp) && (
          <button className={`${s.btn} ${s.btnGhost}`} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={s.emptyState}>
            <p>Loading...</p>
          </div>
        ) : records.length === 0 ? (
          <div className={s.emptyState}>
            <CalendarCheck size={36} strokeWidth={1.2} />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id}>
                  <td>{rec.employee_name}</td>
                  <td>{rec.date}</td>
                  <td>
                    <span
                      className={`${s.badge} ${
                        rec.status === 'Present' ? s.present : s.absent
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${s.btn} ${s.btnGhost}`}
                      style={{ padding: '5px 9px' }}
                      onClick={() => setEditRecord({ id: rec.id, status: rec.status })}
                      title="Edit status"
                    >
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showModal && (
        <Modal
          title="Mark Attendance"
          onClose={() => {
            setShowModal(false)
            setForm({ employee: '', date: '', status: 'Present' })
            setErrors({})
          }}
        >
          <div className={styles.form}>
            <FormField label="Employee" error={errors.employee}>
              <select
                className={`${s.input} ${errors.employee ? s.inputError : ''}`}
                value={form.employee}
                onChange={e => setForm({ ...form, employee: e.target.value })}
              >
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date" error={errors.date}>
              <input
                type="date"
                className={`${s.input} ${errors.date ? s.inputError : ''}`}
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </FormField>

            <FormField label="Status">
              <select
                className={s.input}
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </FormField>

            <div className={styles.formActions}>
              <button
                className={`${s.btn} ${s.btnGhost}`}
                onClick={() => {
                  setShowModal(false)
                  setErrors({})
                }}
              >
                Cancel
              </button>
              <button
                className={`${s.btn} ${s.btnPrimary}`}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Status Modal */}
      {editRecord && (
        <Modal
          title="Update Attendance Status"
          onClose={() => setEditRecord(null)}
        >
          <div className={styles.form}>
            <FormField label="Change Status To">
              <select
                className={s.input}
                value={editRecord.status}
                onChange={e =>
                  setEditRecord({ ...editRecord, status: e.target.value })
                }
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </FormField>

            <div className={styles.formActions}>
              <button
                className={`${s.btn} ${s.btnGhost}`}
                onClick={() => setEditRecord(null)}
              >
                Cancel
              </button>
              <button
                className={`${s.btn} ${s.btnPrimary}`}
                onClick={handleUpdate}
                disabled={editSaving}
              >
                {editSaving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}