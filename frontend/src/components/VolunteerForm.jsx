/**
 * VolunteerForm.jsx - Registration form with live AI skill extraction preview
 */
import React, { useState } from 'react'
import { volunteerAPI, aiAPI } from '../services/api'
import { Sparkles, UserCheck, AlertCircle } from 'lucide-react'

const AVAILABILITY_OPTIONS = ['weekdays', 'weekends', 'evenings', 'full-time', 'flexible']
const INTEREST_OPTIONS = ['Education', 'Healthcare', 'Environment', 'Technology', 'Food & Nutrition',
  'Elderly Care', 'Children & Youth', 'Animal Welfare', 'Disaster Relief', 'Community Development']

export default function VolunteerForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    skills_raw: '', interests: [], availability: 'weekends', location: ''
  })
  const [extractedSkills, setExtractedSkills] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const toggleInterest = (interest) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest]
    }))
  }

  const handleExtract = async () => {
    if (!form.skills_raw.trim()) return
    setExtracting(true)
    try {
      const res = await aiAPI.extractSkills(form.skills_raw)
      setExtractedSkills(res.data.skills || [])
    } catch {
      setExtractedSkills([])
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.skills_raw) {
      setError('Name, email and skills are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await volunteerAPI.register(form)
      setSuccess(res.data.data)
      onSuccess?.(res.data.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(61,255,160,0.12)', border: '2px solid var(--primary)',
          display: 'grid', placeItems: 'center', margin: '0 auto 20px'
        }}>
          <UserCheck size={28} color="var(--primary)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>
          Welcome, {success.name}! 🎉
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>
          Your volunteer profile has been created successfully.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          {success.skills_extracted?.map(s => (
            <span key={s} className="tag tag-green">{s}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href={`/volunteer/${success.id}`} className="btn btn-primary">View Profile</a>
          <a href="/tasks" className="btn btn-secondary">Browse Tasks</a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" name="name" value={form.name}
            onChange={handleChange} placeholder="Jane Doe" />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" name="email" value={form.email}
            onChange={handleChange} placeholder="jane@example.com" />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" name="phone" value={form.phone}
            onChange={handleChange} placeholder="+1 (555) 000-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" name="location" value={form.location}
            onChange={handleChange} placeholder="City, Country" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Skills & Experience * <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(describe in your own words)</span></label>
        <textarea className="form-textarea" name="skills_raw" value={form.skills_raw}
          onChange={handleChange}
          placeholder="E.g. I'm a Python developer with 3 years of experience in web development. I also enjoy teaching and have mentored junior developers. I have a background in data analysis using Excel and Tableau..." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExtract} disabled={extracting || !form.skills_raw.trim()}>
            <Sparkles size={14} />
            {extracting ? 'Extracting…' : 'Extract Skills with AI'}
          </button>
          {extractedSkills.length > 0 && (
            <div className="skills-wrap">
              {extractedSkills.map(s => <span key={s} className="tag tag-green">{s}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Availability</label>
        <select className="form-select" name="availability" value={form.availability} onChange={handleChange}>
          {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Interests <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(select all that apply)</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INTEREST_OPTIONS.map(interest => (
            <button key={interest} type="button"
              className={`tag ${form.interests.includes(interest) ? 'tag-green' : ''}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border-2)' }}
              onClick={() => toggleInterest(interest)}>
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
        {submitting ? 'Registering…' : 'Register as Volunteer'}
      </button>
    </form>
  )
}
