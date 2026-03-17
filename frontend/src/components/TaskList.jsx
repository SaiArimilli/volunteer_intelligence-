/**
 * TaskList.jsx - Displays tasks with optional AI match scores
 */
import React from 'react'
import { Clock, MapPin, Star, Zap } from 'lucide-react'

const CATEGORY_COLORS = {
  Education: '#5eb8ff', Technology: '#3dffa0', Healthcare: '#f5c842',
  Environment: '#4ade80', Design: '#c084fc', Legal: '#fb923c',
  Finance: '#f472b6', Food: '#fbbf24', Language: '#67e8f9', Transport: '#a78bfa',
  Marketing: '#f87171', Data: '#34d399',
}

export default function TaskList({ tasks = [], showMatch = false, loading = false }) {
  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  )

  if (!tasks.length) return (
    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
      No tasks found.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} showMatch={showMatch} />
      ))}
    </div>
  )
}

function TaskCard({ task, showMatch }) {
  const catColor = CATEGORY_COLORS[task.category] || 'var(--primary)'
  const matchPct = task.match_score != null ? Math.round(task.match_score * 100) : null

  return (
    <div className="card card-sm" style={{ transition: 'border-color 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              padding: '2px 10px', borderRadius: 99,
              fontSize: '0.7rem', fontWeight: 600,
              background: catColor + '18', color: catColor,
              border: `1px solid ${catColor}40`
            }}>
              {task.category}
            </span>
            {task.status === 'open' && (
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                Open
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4, fontSize: '0.98rem' }}>
            {task.title}
          </div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.5 }}>
            {task.description}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {task.required_skills?.map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {task.duration_hours}h
            </span>
            {task.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {task.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={12} /> {task.impact_points} pts
            </span>
          </div>
        </div>

        {showMatch && matchPct != null && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: matchPct >= 70 ? 'rgba(61,255,160,0.1)' : matchPct >= 40 ? 'rgba(245,200,66,0.1)' : 'rgba(94,184,255,0.1)',
              border: `2px solid ${matchPct >= 70 ? 'var(--primary)' : matchPct >= 40 ? 'var(--accent)' : 'var(--info)'}`,
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700,
              color: matchPct >= 70 ? 'var(--primary)' : matchPct >= 40 ? 'var(--accent)' : 'var(--info)'
            }}>
              {matchPct}%
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 4 }}>match</div>
          </div>
        )}
      </div>
    </div>
  )
}
