/**
 * Admin.jsx - Full admin dashboard: analytics, volunteer table, at-risk panel
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, taskAPI } from '../services/api'
import { BadgeChart, DropoutRiskChart, TopSkillsChart, TaskCategoryChart } from '../components/Dashboard'
import { AlertTriangle, RefreshCw, Users, CheckSquare, Clock, TrendingUp, PlusCircle } from 'lucide-react'

const BADGE_CLS = { Bronze: 'badge-bronze', Silver: 'badge-silver', Gold: 'badge-gold', Platinum: 'badge-platinum' }

export default function Admin() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [atRisk, setAtRisk]       = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('overview')

  // New task form
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title:'', description:'', category:'', required_skills:'', duration_hours:2, impact_points:10 })
  const [taskMsg, setTaskMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [aRes, rRes, vRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getAtRisk(),
        adminAPI.getAnalytics(), // reuse for recent volunteers list
      ])
      setAnalytics(aRes.data.data)
      setAtRisk(rRes.data.data || [])
      setVolunteers(aRes.data.data?.recent_volunteers || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreateTask = async () => {
    try {
      const skills = taskForm.required_skills.split(',').map(s => s.trim()).filter(Boolean)
      await taskAPI.create({ ...taskForm, required_skills: skills })
      setTaskMsg('✅ Task created successfully!')
      setTaskForm({ title:'', description:'', category:'', required_skills:'', duration_hours:2, impact_points:10 })
      setTimeout(() => { setTaskMsg(''); setShowTaskForm(false) }, 2000)
    } catch {
      setTaskMsg('❌ Failed to create task.')
    }
  }

  const ov = analytics?.overview || {}

  const tabs = [
    { id: 'overview',    label: 'Overview' },
    { id: 'volunteers',  label: `Volunteers (${volunteers.length})` },
    { id: 'at-risk',     label: `At-Risk (${atRisk.length})`, danger: atRisk.length > 0 },
    { id: 'tasks',       label: 'Manage Tasks' },
  ]

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Platform insights, retention analysis &amp; task management</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginTop: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', borderRadius: '8px 8px 0 0',
              fontSize: '0.88rem', fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? (t.danger ? 'var(--danger)' : 'var(--primary)') : 'var(--text-2)',
              borderBottom: tab === t.id ? `2px solid ${t.danger ? 'var(--danger)' : 'var(--primary)'}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {t.danger && <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="content-area">

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <>
              <div className="stat-grid" style={{ padding: 0, marginBottom: 24 }}>
                <div className="stat-card green"><div className="stat-label">Volunteers</div><div className="stat-value">{ov.total_volunteers ?? 0}</div><div className="stat-meta">Registered</div></div>
                <div className="stat-card blue"><div className="stat-label">Open Tasks</div><div className="stat-value">{ov.open_tasks ?? 0}</div><div className="stat-meta">of {ov.total_tasks ?? 0}</div></div>
                <div className="stat-card yellow"><div className="stat-label">Hours</div><div className="stat-value">{ov.total_hours ?? 0}h</div><div className="stat-meta">Total logged</div></div>
                <div className="stat-card red"><div className="stat-label">High Risk</div><div className="stat-value">{analytics?.dropout_risk?.high ?? 0}</div><div className="stat-meta">Need attention</div></div>
              </div>
              <div className="grid-2" style={{ marginBottom: 20 }}>
                <BadgeChart data={analytics?.badge_distribution} />
                <DropoutRiskChart data={analytics?.dropout_risk} />
              </div>
              <div className="grid-2">
                <TopSkillsChart data={analytics?.top_skills} />
                <TaskCategoryChart data={analytics?.task_categories} />
              </div>
            </>
          )}

          {/* ── VOLUNTEERS TAB ── */}
          {tab === 'volunteers' && (
            <div className="card">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>
                All Volunteers
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Volunteer</th><th>Skills</th><th>Badge</th>
                      <th>Impact</th><th>Tasks</th><th>Hours</th><th>Dropout Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map(v => (
                      <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/volunteer/${v.id}`)}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{v.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{v.email}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {v.skills_extracted?.slice(0, 2).map(s => <span key={s} className="tag" style={{ fontSize: '0.68rem' }}>{s}</span>)}
                            {v.skills_extracted?.length > 2 && <span className="tag" style={{ fontSize: '0.68rem' }}>+{v.skills_extracted.length - 2}</span>}
                          </div>
                        </td>
                        <td><span className={`badge ${BADGE_CLS[v.badge] || 'badge-bronze'}`}>{v.badge}</span></td>
                        <td style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{v.impact_score}</td>
                        <td>{v.tasks_completed}</td>
                        <td>{v.hours_volunteered}h</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className="progress-fill" style={{
                                width: `${Math.round(v.dropout_risk * 100)}%`,
                                background: v.dropout_risk > 0.65 ? 'var(--danger)' : v.dropout_risk > 0.35 ? 'var(--accent)' : 'var(--primary)'
                              }} />
                            </div>
                            <span className={`risk-${v.dropout_risk > 0.65 ? 'high' : v.dropout_risk > 0.35 ? 'medium' : 'low'}`} style={{ fontSize: '0.78rem' }}>
                              {Math.round(v.dropout_risk * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── AT-RISK TAB ── */}
          {tab === 'at-risk' && (
            <div>
              {atRisk.length === 0 ? (
                <div className="alert alert-success">
                  🎉 No volunteers are currently at high dropout risk!
                </div>
              ) : (
                <>
                  <div className="alert alert-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={15} />
                    <span><strong>{atRisk.length} volunteers</strong> have a high predicted dropout risk. Consider reaching out with personalized tasks or messages.</span>
                  </div>
                  <div className="card">
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Volunteer</th><th>Risk %</th><th>Tasks Done</th><th>Last Active</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {atRisk.map(v => (
                            <tr key={v.id}>
                              <td>
                                <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{v.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{v.email}</div>
                              </td>
                              <td>
                                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{Math.round(v.dropout_risk * 100)}%</span>
                              </td>
                              <td>{v.tasks_completed}</td>
                              <td style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                                {new Date(v.last_active).toLocaleDateString()}
                              </td>
                              <td>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/volunteer/${v.id}`)}>
                                  View Profile
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TASKS TAB ── */}
          {tab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Manage Tasks</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(f => !f)}>
                  <PlusCircle size={14} /> {showTaskForm ? 'Cancel' : 'Add Task'}
                </button>
              </div>

              {showTaskForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Create New Task</div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input className="form-input" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <input className="form-input" value={taskForm.category} onChange={e => setTaskForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Education" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" style={{ minHeight: 72 }} value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the task..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Required Skills <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(comma-separated)</span></label>
                    <input className="form-input" value={taskForm.required_skills} onChange={e => setTaskForm(f => ({ ...f, required_skills: e.target.value }))} placeholder="e.g. Teaching, Programming" />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Duration (hours)</label>
                      <input className="form-input" type="number" min={1} value={taskForm.duration_hours} onChange={e => setTaskForm(f => ({ ...f, duration_hours: Number(e.target.value) }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Impact Points</label>
                      <input className="form-input" type="number" min={5} value={taskForm.impact_points} onChange={e => setTaskForm(f => ({ ...f, impact_points: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={handleCreateTask}>Create Task</button>
                  {taskMsg && (
                    <div className={`alert ${taskMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 12 }}>
                      {taskMsg}
                    </div>
                  )}
                </div>
              )}

              <div className="alert alert-info">
                Navigate to <strong>Tasks</strong> page to see all open tasks with skill filters and AI matching.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
