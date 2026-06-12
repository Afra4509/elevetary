'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  SendIcon, TrashIcon, ChevronDownIcon,
  BotIcon, UserIcon, ArrowLeftIcon, ZapIcon,
} from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const MODELS = [
  { value: 'gpt-5-mini',  label: 'GPT-5 Mini',   badge: 'Fast'  },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini',   badge: 'Smart' },
  { value: 'gpt-5-chat',  label: 'GPT-5 Chat',    badge: 'Pro'   },
]

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState(MODELS[0].value)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [streaming, setStreaming] = useState(true)
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [streamContent, setStreamContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  async function send() {
    if (!input.trim() || loading) return
    if (!apiKey.trim()) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: Please enter your API Key first! You can create one in the Admin Panel.' }])
      return
    }

    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamContent('')

    const body = {
      model,
      messages: newMessages,
      stream: streaming,
      temperature,
      max_tokens: maxTokens,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`
    }

    try {
      const res = await fetch('/api/v1/chat/completions', { method: 'POST', headers, body: JSON.stringify(body) })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.error ?? 'Request failed'}` }])
        return
      }

      if (streaming && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content ?? ''
              full += delta
              setStreamContent(full)
            } catch { /* skip */ }
          }
        }

        setMessages(prev => [...prev, { role: 'assistant', content: full }])
        setStreamContent('')
      } else {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content ?? 'No response'
        setMessages(prev => [...prev, { role: 'assistant', content }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown'}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nb-cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'var(--nb-black)',
        borderBottom: '3px solid var(--nb-black)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" className="nb-btn nb-btn-secondary nb-btn-sm"
            style={{ background: '#2A2A2A', color: '#9CA3AF', borderColor: '#3A3A3A' }}>
            <ArrowLeftIcon size={14} /> Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ZapIcon size={18} color="var(--nb-yellow)" />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800, fontSize: '1rem', color: 'var(--nb-cream)',
            }}>Playground</span>
            <span className="nb-badge nb-badge-yellow" style={{ fontSize: '0.6rem' }}>BETA</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            className="nb-btn nb-btn-danger nb-btn-sm"
            onClick={() => { setMessages([]); setStreamContent('') }}
          >
            <TrashIcon size={14} /> Clear
          </button>
        )}
      </div>

      <div className="nb-mobile-stack playground-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .playground-layout {
              overflow-y: auto !important;
            }
            .playground-panel {
              width: 100% !important;
              border-right: none !important;
              border-bottom: 3px solid var(--nb-black) !important;
              max-height: 50vh !important;
            }
            .playground-chat {
              overflow: visible !important;
            }
          }
        `}} />
        {/* Settings panel */}
        <div className="playground-panel" style={{
          width: 280,
          background: 'var(--nb-white)',
          borderRight: '3px solid var(--nb-black)',
          padding: 20,
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--nb-black)' }}>API KEY (REQUIRED)</label>
            <div style={{ marginTop: 8 }}>
              <input
                type="password"
                placeholder="afr_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="nb-input"
              />
              <div style={{ fontSize: '0.65rem', color: 'var(--nb-gray)', marginTop: 4 }}>
                Create an API Key in the Admin Panel
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="nb-label">Model</label>
            <div style={{ position: 'relative' }}>
              <select
                className="nb-select"
                value={model}
                onChange={e => setModel(e.target.value)}
              >
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label} ({m.badge})</option>
                ))}
              </select>
              <ChevronDownIcon size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--nb-gray)' }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="nb-label">
              Temperature: <span style={{ color: 'var(--nb-blue)', fontWeight: 800 }}>{temperature}</span>
            </label>
            <input
              type="range" min={0} max={2} step={0.1}
              value={temperature}
              onChange={e => setTemperature(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--nb-blue)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--nb-gray)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
              <span>Precise (0)</span><span>Creative (2)</span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="nb-label">
              Max Tokens: <span style={{ color: 'var(--nb-blue)', fontWeight: 800 }}>{maxTokens}</span>
            </label>
            <input
              type="range" min={128} max={8192} step={128}
              value={maxTokens}
              onChange={e => setMaxTokens(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--nb-blue)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--nb-gray)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
              <span>128</span><span>8192</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="nb-label" style={{ margin: 0 }}>Streaming</label>
            <button
              onClick={() => setStreaming(!streaming)}
              style={{
                width: 44, height: 24,
                background: streaming ? 'var(--nb-green)' : 'var(--nb-gray-light)',
                border: '2px solid var(--nb-black)',
                borderRadius: 12,
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute',
                top: 2, left: streaming ? 20 : 2,
                width: 16, height: 16,
                background: 'var(--nb-white)',
                border: '2px solid var(--nb-black)',
                borderRadius: '50%',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="playground-chat" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {messages.length === 0 && !streamContent && (
              <div style={{
                textAlign: 'center', paddingTop: 80,
                color: 'var(--nb-gray)',
                animation: 'nb-fade-in 0.4s ease',
              }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: 64, height: 64,
                    background: 'var(--nb-yellow)',
                    border: '3px solid var(--nb-black)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--nb-shadow)',
                  }}>
                    <ZapIcon size={32} color="var(--nb-black)" />
                  </div>
                </div>
                <h2 style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1.5rem', fontWeight: 800,
                  color: 'var(--nb-black)', marginBottom: 8,
                }}>AI Playground</h2>
                <p style={{ maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
                  Send a message to test the API gateway. Select your model and parameters on the left.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  marginBottom: 20,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  animation: 'nb-slide-up 0.2s ease',
                }}
              >
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--nb-blue)' : 'var(--nb-yellow)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'user'
                    ? <UserIcon size={16} color="white" />
                    : <BotIcon size={16} color="var(--nb-black)" />
                  }
                </div>
                <div style={{
                  background: msg.role === 'user' ? 'var(--nb-black)' : 'var(--nb-white)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                  padding: '12px 16px',
                  maxWidth: '72%',
                  boxShadow: 'var(--nb-shadow-sm)',
                }}>
                  <p style={{
                    fontSize: '0.9rem', lineHeight: 1.7,
                    color: msg.role === 'user' ? 'var(--nb-cream)' : 'var(--nb-black)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, sans-serif',
                  }}>{msg.content}</p>
                  {msg.role === 'assistant' && (
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <CopyButton text={msg.content} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming bubble */}
            {streamContent && (
              <div style={{ display: 'flex', gap: 14, marginBottom: 20, animation: 'nb-fade-in 0.2s ease' }}>
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: 'var(--nb-yellow)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BotIcon size={16} color="var(--nb-black)" />
                </div>
                <div style={{
                  background: 'var(--nb-white)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4, padding: '12px 16px',
                  maxWidth: '72%', boxShadow: 'var(--nb-shadow-sm)',
                }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif' }}>
                    {streamContent}
                    <span style={{
                      display: 'inline-block', width: 8, height: 16,
                      background: 'var(--nb-blue)', marginLeft: 2,
                      animation: 'nb-pulse 0.8s ease infinite',
                      verticalAlign: 'middle',
                    }} />
                  </p>
                </div>
              </div>
            )}

            {loading && !streamContent && (
              <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36,
                  background: 'var(--nb-yellow)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BotIcon size={16} color="var(--nb-black)" />
                </div>
                <div style={{
                  background: 'var(--nb-white)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4, padding: '16px',
                  display: 'flex', gap: 6, alignItems: 'center',
                  boxShadow: 'var(--nb-shadow-sm)',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 8, height: 8,
                      background: 'var(--nb-blue)',
                      borderRadius: '50%',
                      animation: `nb-bounce 1s ease ${i * 0.15}s infinite`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 24px',
            background: 'var(--nb-white)',
            borderTop: '3px solid var(--nb-black)',
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <textarea
                ref={textareaRef}
                id="chat-input"
                className="nb-textarea"
                placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
                style={{ resize: 'none', minHeight: 'unset', flex: 1 }}
              />
              <button
                id="send-btn"
                onClick={send}
                disabled={loading || !input.trim()}
                className="nb-btn nb-btn-primary"
                style={{ alignSelf: 'flex-end', padding: '10px 16px' }}
              >
                <SendIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
