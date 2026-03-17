/**
 * Chatbot.jsx - Floating AI assistant (Voly)
 */
import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { aiAPI } from '../services/api'

const INITIAL_MSG = {
  role: 'assistant',
  content: "Hi! I'm Voly 🌱 — your AI volunteer assistant. Ask me about tasks, badges, or how to make the most of your volunteering journey!"
}

export default function Chatbot() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build history excluding initial bot greeting for API
      const history = messages.filter(m => m !== INITIAL_MSG).map(m => ({
        role: m.role, content: m.content
      }))
      const res = await aiAPI.chat(text, history)
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue connecting to the AI. Please check the API configuration.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-avatar">V</div>
            <div>
              <div className="chatbot-title">Voly — AI Assistant</div>
              <div className="chatbot-status">● Online</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1s infinite 0.2s' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1s infinite 0.4s' }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Voly anything…"
              disabled={loading}
            />
            <button className="chatbot-send" onClick={send} disabled={loading || !input.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <button className="chatbot-fab" onClick={() => setOpen(o => !o)} title="Chat with Voly AI">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
