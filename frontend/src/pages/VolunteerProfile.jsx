/**
 * VolunteerProfile.jsx - Individual volunteer profile with stats, badges, dropout risk
 */
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { volunteerAPI, taskAPI, aiAPI } from '../services/api'
import TaskList from '../components/TaskList'
import { Award, Clock, CheckSquare, TrendingUp, AlertTriangle, Zap, ArrowLeft } from 'lucide-react'

const BADGE_META = {
  Bronze:   { emoji: '🥉', color: '#d4a56a', next: 'Silver at 75 pts' },
  Silver:   { emoji: '🥈', color: '#b0bec5', next: 'Gold at 200 pts' },
  Gold:     { emoji: '🥇', color: '#f5c842', next: 'Platinum at 500 pts' },
  Platinum: { emoji: '💎', color: '#90caf9', next: 'Max level!' },
}

export default function VolunteerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [volunteer, setVolunteer] = useState(null)
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [logging, setLogging]     = useState(false)
  const [logHours, setLogHours]   = useState(2)
  const [logMsg, setLogMsg]       = useState('')

  useEffect(() => {
    Promise.all([
      volunteerAPI.getById(id),
      taskAPI.getRecommended(id),
    ])
      .then(([vRes, tRes]) => {
        setVolunteer(vRes.data.data)
        setTasks(tRes.data.data?.slice(0, 5) || [])
      })
      .catch(() => setVolunteer(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleLogActivity = async () => {
    setLogging(true); setLogMsg('')
    try {
      const res = await volunteerAPI.logActivity(id, logHours)
      setVolunteer(res.data.data)
      setLogMsg(`✅ Logged ${logHours}h successfully! Impact score updated.`)
    } catch {
      setLogMsg('❌ Failed to log activity.')
    } finally {
      setLogging(false)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  if (!volunteer) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ color: 'var(--danger)', marginBottom: 12 }}>Volunteer not found.</div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>← Back</button>
    </div>
  )

  const badge    = BADGE_META[volunteer.badge] || BADGE_META.Bronze
  const riskLevel = volunteer.dropout_risk > 0.65 ? 'High' : volunteer.dropout_risk > 0.35 ? 'Medium' : 'Low'
  const riskColor = { High: 'var(--danger)', Medium: 'var(--accent)', Low: 'var(--primary)' }[riskLevel]

  // Progress toward next badge
  const badgeThresholds = { Bronze: [0, 75], Silver: [75, 200], Gold: [200, 500], Platinum: [500, 500] }
  const [minPts, maxPts] = badgeThresholds[volunteer.badge] || [0, 75]
  const progress = volunteer.badge === 'Platinum' ? 100
    : Math.min(100, Math.round(((volunteer.impact_score - minPts) / (maxPts - minPts)) * 100))

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--primary-glow)',
            border: '2px solid var(--primary)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700,
            color: 'var(--primary)', flexShrink: 0,
          }}>
            {volunteer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{volunteer.name}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{volunteer.email}</span>
              {volunteer.location && <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>📍 {volunteer.location}</span>}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>⏰ {volunteer.availability}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-area">
        {/* ── Stat cards ── */}
        <div className="stat-grid" style={{ padding: 0, marginBottom: 24 }}>
          <div className="stat-card green">
            <div className="stat-label">Impact Score</div>
            <div className="stat-value">{volunteer.impact_score}</div>
            <div className="stat-meta">Community contribution</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Tasks Done</div>
            <div className="stat-value">{volunteer.tasks_completed}</div>
            <div className="stat-meta">Completed tasks</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Hours Given</div>
            <div className="stat-value">{volunteer.hours_volunteered}h</div>
            <div className="stat-meta">Time volunteered</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* ── Left col ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Badge card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>{badge.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: badge.color, marginBottom: 4 }}>
                {volunteer.badge}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 16 }}>{badge.next}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%`, background: badge.color }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 6 }}>
                <span>{minPts} pts</span>
                <span>{progress}%</span>
                <span>{maxPts} pts</span>
              </div>
            </div>

            {/* Dropout Risk */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>Retention Risk</div>
                <span style={{ color: riskColor, fontWeight: 700, fontSize: '0.9rem' }}>{riskLevel}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 8 }}>
                <div className="progress-fill" style={{
                  width: `${Math.round(volunteer.dropout_risk * 100)}%`,
                  background: riskColor
                }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                Dropout probability: {Math.round(volunteer.dropout_risk * 100)}%
              </div>
              {riskLevel === 'High' && (
                <div className="alert alert-error" style={{ marginTop: 12, fontSize: '0.8rem' }}>
                  <AlertTriangle size={13} /> This volunteer may need re-engagement outreach.
                </div>
              )}
            </div>

            {/* Log Activity */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Log Activity</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <input type="number" className="form-input" min={0.5} max={24} step={0.5}
                  value={logHours} onChange={e => setLogHours(Number(e.target.value))}
                  style={{ width: 90 }} />
                <span style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>hours</span>
                <button className="btn btn-primary btn-sm" onClick={handleLogActivity} disabled={logging}>
                  {logging ? 'Saving…' : 'Log'}
                </button>
              </div>
              {logMsg && (
                <div className={`alert ${logMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ fontSize: '0.82rem' }}>
                  {logMsg}
                </div>
              )}
            </div>
          </div>

          {/* ── Right col ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Skills */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Extracted Skills
                <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 400 }}>AI-detected</span>
              </div>
              <div className="skills-wrap">
                {volunteer.skills_extracted?.length > 0
                  ? volunteer.skills_extracted.map(s => <span key={s} className="tag tag-green">{s}</span>)
                  : <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No skills extracted yet.</span>
                }
              </div>
              {volunteer.interests?.length > 0 && (
                <>
                  <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: '0.85rem' }}>Interests</div>
                  <div className="skills-wrap">
                    {volunteer.interests.map(i => <span key={i} className="tag">{i}</span>)}
                  </div>
                </>
              )}
            </div>

            {/* Recommended Tasks */}
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                <Zap size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--primary)' }} />
                Top Matched Tasks
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 14 }}>AI-ranked by skill compatibility</div>
              <TaskList tasks={tasks} showMatch />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
