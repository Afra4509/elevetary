'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Send, Trash2, Copy, Check, ChevronDown,
  Cpu, MessageSquare, ArrowLeft, Loader2, Bot, User, Square,
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MODELS = [
  { value: 'gpt-5-mini', label: 'GPT-5 Mini', desc: 'Fast & efficient' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Balanced' },
  { value: 'gpt-5-chat', label: 'GPT-5 Chat', desc: 'Most capable' },
]

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-5-mini')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [totalTokens, setTotalTokens] = useState(0)
  const [error, setError] = useState('')
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortCtrlRef = useRef<AbortController | null>(null)

  function stopGeneration() {
    abortCtrlRef.current?.abort()
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input])

  // Auto-check API key
  useEffect(() => {
    if (!apiKey.startsWith('afr_') || apiKey.length < 20) {
      setKeyStatus('idle')
      return
    }

    setKeyStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/me', {
          headers: { Authorization: `Bearer ${apiKey}` }
        })
        setKeyStatus(res.ok ? 'valid' : 'invalid')
        if (!res.ok) setError('Invalid or expired API key')
        else setError('')
      } catch {
        setKeyStatus('invalid')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [apiKey])

  async function sendMessage() {
    if (!input.trim() || loading) return
    if (!apiKey.startsWith('afr_')) {
      setError('Enter a valid API key starting with afr_')
      return
    }

    setError('')
    const userMsg: Message = { role: 'user', content: input.trim() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    // Build messages array with optional system prompt
    const payload: { role: string; content: string }[] = []
    if (systemPrompt.trim()) {
      payload.push({ role: 'system', content: systemPrompt.trim() })
    }
    payload.push(...history.map((m) => ({ role: m.role, content: m.content })))

    // Add streaming placeholder
    setMessages([...history, { role: 'assistant', content: '' }])

    try {
      abortCtrlRef.current = new AbortController()
      
      const res = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: abortCtrlRef.current.signal,
        body: JSON.stringify({
          model,
          messages: payload,
          stream: true,
          temperature,
          max_tokens: maxTokens,
          reasoning_effort: 'low',
        }),
      })

      if (!res.ok) {
        let errorMsg = `Error ${res.status}`
        try {
          const err = await res.json()
          errorMsg = err.error?.message ?? err.message ?? errorMsg
        } catch {
          errorMsg = `Server error: ${res.status} ${res.statusText}`
        }
        setMessages(history)
        setError(errorMsg)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content ?? ''
            fullContent += delta
            setMessages([...history, { role: 'assistant', content: fullContent }])
          } catch { /* skip */ }
        }
      }

      setTotalTokens((t) => t + Math.ceil(fullContent.length / 4))
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Just stop, no error
        return
      }
      setMessages(history)
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function copyMsg(content: string, idx: number) {
    await navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  function clearChat() {
    setMessages([])
    setTotalTokens(0)
    setError('')
  }

  const selectedModel = MODELS.find((m) => m.value === model) ?? MODELS[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{
        borderBottom: '1px solid var(--border)', padding: '0 20px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
            <MessageSquare size={18} color="var(--accent-light)" />
            Playground
          </div>
          {/* Model selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '6px 32px 6px 12px', color: 'var(--text)',
                fontSize: '0.8125rem', cursor: 'pointer', outline: 'none',
                appearance: 'none', WebkitAppearance: 'none',
              }}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label} · {m.desc}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {totalTokens > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-card2)', padding: '4px 10px', borderRadius: '6px' }}>
              <Cpu size={13} /> ~{totalTokens.toLocaleString('en-US')} tokens
            </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
            Settings
          </button>
          <button onClick={clearChat} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Settings panel (collapsible) */}
      {showSettings && (
        <div style={{ padding: '16px 20px', background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>System Prompt</label>
              <input className="input" placeholder="You are a helpful assistant..." value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Temperature: {temperature}</label>
              <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Max Tokens: {maxTokens}</label>
              <input type="range" min={256} max={16384} step={256} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>
          </div>
        </div>
      )}

      {/* API Key bar */}
      <div style={{ padding: '10px 20px', background: 'rgba(10,10,15,0.5)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={13} /> API Key:
          </label>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input
              type="password"
              className="input"
              placeholder="afr_xxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', padding: '8px 36px 8px 12px', fontSize: '0.875rem' }}
            />
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
              {keyStatus === 'checking' && <Loader2 size={16} className="animate-spin" color="var(--text-muted)" />}
              {keyStatus === 'valid' && <Check size={16} color="var(--green)" />}
            </div>
          </div>
          {error && (
            <span style={{ color: 'var(--red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2))',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <MessageSquare size={28} color="var(--accent-light)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Aeferalow Playground</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto' }}>
                Enter your <code style={{ color: 'var(--accent-light)' }}>afr_</code> API key above and start chatting with the AI.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
                {['What can you do?', 'Write a short story', 'Explain quantum physics'].map((q) => (
                  <button key={q} onClick={() => setInput(q)} style={{
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border)',
                    background: 'var(--bg-card2)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem',
                    transition: 'all 0.2s',
                  }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {msg.role === 'user'
                  ? <><User size={12} /> You</>
                  : <><Bot size={12} color="var(--accent-light)" /> {selectedModel.label}</>
                }
              </div>
              <div style={{ position: 'relative', maxWidth: '85%' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                    : 'var(--bg-card)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                }}>
                  {msg.content ? (
                    <p style={{
                      fontSize: '0.9rem', lineHeight: 1.75,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                      color: msg.role === 'user' ? 'white' : 'var(--text)',
                    }}>{msg.content}</p>
                  ) : (
                    // Empty streaming placeholder
                    <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
                      {[0, 1, 2].map((j) => (
                        <div key={j} style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: 'var(--accent-light)',
                          animation: `bounce 1.2s ${j * 0.2}s ease-in-out infinite`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => copyMsg(msg.content, i)}
                    style={{
                      position: 'absolute', bottom: '-24px', right: '0',
                      background: 'var(--bg-card2)', border: '1px solid var(--border)',
                      borderRadius: '6px', cursor: 'pointer', padding: '3px 8px',
                      color: 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                    title="Copy response"
                  >
                    {copiedIdx === i ? <><Check size={11} color="var(--green)" /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && messages.at(-1)?.content === '' && null /* Handled by empty bubble */}

          <div ref={bottomRef} style={{ height: '32px' }} />
        </div>
      </div>

      {/* Input area */}
      <div style={{
        padding: '16px 20px', borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              className="input"
              placeholder="Message Aeferalow AI... (Enter to send, Shift+Enter for newline)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                resize: 'none', width: '100%', minHeight: '48px', maxHeight: '200px',
                paddingTop: '13px', paddingBottom: '13px', paddingRight: '16px',
                lineHeight: '1.5', overflowY: 'auto',
              }}
            />
          </div>
          {loading ? (
            <button
              onClick={stopGeneration}
              className="btn-danger"
              style={{ padding: '13px 18px', flexShrink: 0, height: '48px', gap: '6px' }}
            >
              <Square size={14} fill="currentColor" /> Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="btn-primary"
              style={{ padding: '13px 18px', flexShrink: 0, height: '48px' }}
            >
              <Send size={18} />
            </button>
          )}
        </div>
        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          AI may make mistakes. Model: <strong>{selectedModel.label}</strong> · Temp: {temperature} · Max: {maxTokens.toLocaleString('en-US')} · Reason: Low
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
