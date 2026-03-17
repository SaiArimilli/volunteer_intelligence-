/**
 * Register.jsx - Volunteer registration page
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import VolunteerForm from '../components/VolunteerForm'
import { Sparkles, Award, Zap } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">Join as a Volunteer</h1>
        <p className="page-subtitle">Our AI will match you with the perfect opportunities</p>
      </div>

      <div className="content-area">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── Form ── */}
          <div className="card">
            <VolunteerForm onSuccess={(vol) => {
              setTimeout(() => navigate(`/volunteer/${vol.id}`), 2000)
            }} />
          </div>

          {/* ── Side info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-sm">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(61,255,160,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>AI Skill Extraction</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    Just describe your experience in plain text — our NLP model automatically identifies your skills.
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-sm">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(94,184,255,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Zap size={16} color="var(--info)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Smart Task Matching</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    Get recommended tasks ranked by how well they match your unique skill set.
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-sm">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,200,66,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Award size={16} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Earn Badges</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    Complete tasks to earn Bronze → Silver → Gold → Platinum badges and grow your impact score.
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-sm" style={{ background: 'rgba(61,255,160,0.04)', border: '1px solid rgba(61,255,160,0.15)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--primary)' }}>📊 Impact Score Formula</strong><br />
                <code style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  score = tasks × 15 + hours × 5
                </code><br /><br />
                Badges unlock at:<br />
                🥉 Bronze: 0 pts<br />
                🥈 Silver: 75 pts<br />
                🥇 Gold: 200 pts<br />
                💎 Platinum: 500 pts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
