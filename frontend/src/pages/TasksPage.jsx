/**
 * TasksPage.jsx - Browse all tasks, optionally get AI recommendations
 */
import React, { useState, useEffect } from 'react'
import { taskAPI } from '../services/api'
import TaskList from '../components/TaskList'
import { Search, Zap } from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('')
  const [catFilter, setCatFilter]   = useState('All')
  const [volId, setVolId]           = useState('')
  const [recommended, setRecommended] = useState(null)
  const [recLoading, setRecLoading] = useState(false)
  const [recError, setRecError]     = useState('')

  useEffect(() => {
    taskAPI.getAll()
      .then(r => setTasks(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(tasks.map(t => t.category))]

  const filtered = tasks.filter(t => {
    const matchText = filter === '' || t.title.toLowerCase().includes(filter.toLowerCase()) || t.description.toLowerCase().includes(filter.toLowerCase())
    const matchCat  = catFilter === 'All' || t.category === catFilter
    return matchText && matchCat
  })

  const handleRecommend = async () => {
    if (!volId.trim()) return
    setRecLoading(true); setRecError('')
    try {
      const res = await taskAPI.getRecommended(volId.trim())
      setRecommended(res.data.data)
    } catch (err) {
      setRecError(err.response?.data?.detail || 'Volunteer not found. Enter a valid volunteer ID.')
    } finally {
      setRecLoading(false)
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">Task Opportunities</h1>
        <p className="page-subtitle">Browse open volunteer tasks or get AI-powered recommendations</p>
      </div>

      <div className="content-area">
        {/* ── AI Recommendations Panel ── */}
        <div className="card" style={{ marginBottom: 24, background: 'rgba(61,255,160,0.03)', border: '1px solid rgba(61,255,160,0.15)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="form-label">
                <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
                Get AI-Matched Recommendations
              </label>
              <input className="form-input" placeholder="Enter your Volunteer ID"
                value={volId} onChange={e => { setVolId(e.target.value); setRecommended(null); setRecError('') }} />
            </div>
            <button className="btn btn-primary" onClick={handleRecommend} disabled={recLoading || !volId.trim()}>
              {recLoading ? 'Matching…' : 'Match Tasks'}
            </button>
            {recommended && (
              <button className="btn btn-secondary btn-sm" onClick={() => setRecommended(null)}>
                Clear
              </button>
            )}
          </div>
          {recError && <div className="alert alert-error" style={{ marginTop: 12 }}>{recError}</div>}
        </div>

        {/* ── Filter bar ── */}
        {!recommended && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input className="form-input" style={{ paddingLeft: 34 }}
                placeholder="Search tasks…" value={filter} onChange={e => setFilter(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button key={c}
                  className={`tag ${catFilter === c ? 'tag-green' : ''}`}
                  style={{ cursor: 'pointer', border: '1px solid var(--border-2)' }}
                  onClick={() => setCatFilter(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Task list ── */}
        {recommended ? (
          <>
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              ✨ Showing AI-matched tasks ranked by your skill compatibility
            </div>
            <TaskList tasks={recommended} showMatch loading={recLoading} />
          </>
        ) : (
          <TaskList tasks={filtered} loading={loading} />
        )}
      </div>
    </div>
  )
}
