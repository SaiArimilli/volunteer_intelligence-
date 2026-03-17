/**
 * Home.jsx - Landing overview page
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { Users, CheckSquare, Clock, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import { BadgeChart, DropoutRiskChart, TaskCategoryChart, TopSkillsChart } from '../components/Dashboard'

export default function Home() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(r => setAnalytics(r.data.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false))
  }, [])

  const ov = analytics?.overview || {}

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Volunteer Intelligence System</h1>
            <p className="page-subtitle">AI-powered platform for social impact management</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>
              Browse Tasks <ArrowRight size={14} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Join as Volunteer
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard color="green"  label="Total Volunteers" value={ov.total_volunteers ?? 0} meta="Registered community members" Icon={Users} />
            <StatCard color="blue"   label="Open Tasks"       value={ov.open_tasks ?? 0}       meta={`of ${ov.total_tasks ?? 0} total tasks`} Icon={CheckSquare} />
            <StatCard color="yellow" label="Hours Volunteered" value={`${ov.total_hours ?? 0}h`} meta="Community hours logged" Icon={Clock} />
            <StatCard color="red"    label="Avg Impact Score" value={Math.round(ov.avg_impact_score ?? 0)} meta="Across all volunteers" Icon={TrendingUp} />
          </div>

          {/* ── Alert: at-risk volunteers ── */}
          {analytics?.dropout_risk?.high > 0 && (
            <div className="content-area" style={{ marginBottom: 20 }}>
              <div className="alert alert-error" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                <AlertTriangle size={16} />
                <span>
                  <strong>{analytics.dropout_risk.high} volunteer{analytics.dropout_risk.high > 1 ? 's' : ''}</strong> identified as high dropout risk — view retention recommendations in the Admin panel.
                </span>
              </div>
            </div>
          )}

          {/* ── Charts row 1 ── */}
          <div className="content-area">
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <BadgeChart data={analytics?.badge_distribution} />
              <DropoutRiskChart data={analytics?.dropout_risk} />
            </div>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <TopSkillsChart data={analytics?.top_skills} />
              <TaskCategoryChart data={analytics?.task_categories} />
            </div>

            {/* ── Recent Volunteers ── */}
            {analytics?.recent_volunteers?.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Recent Volunteers</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Latest registrations</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>
                    View All
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th><th>Skills</th><th>Badge</th><th>Impact</th><th>Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recent_volunteers.map(v => (
                        <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/volunteer/${v.id}`)}>
                          <td>
                            <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{v.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{v.email}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {v.skills_extracted?.slice(0, 2).map(s => <span key={s} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>)}
                              {v.skills_extracted?.length > 2 && <span className="tag" style={{ fontSize: '0.7rem' }}>+{v.skills_extracted.length - 2}</span>}
                            </div>
                          </td>
                          <td><BadgePill badge={v.badge} /></td>
                          <td style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{v.impact_score}</td>
                          <td>
                            <span className={`risk-${v.dropout_risk > 0.65 ? 'high' : v.dropout_risk > 0.35 ? 'medium' : 'low'}`} style={{ fontSize: '0.82rem' }}>
                              {v.dropout_risk > 0.65 ? 'High' : v.dropout_risk > 0.35 ? 'Medium' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ color, label, value, meta, Icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{meta}</div>
    </div>
  )
}

function BadgePill({ badge }) {
  const cls = { Bronze: 'badge-bronze', Silver: 'badge-silver', Gold: 'badge-gold', Platinum: 'badge-platinum' }
  return <span className={`badge ${cls[badge] || 'badge-bronze'}`}>{badge}</span>
}
