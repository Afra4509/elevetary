'use client'

import Link from 'next/link'
import CopyButton from '@/components/ui/CopyButton'
import { ArrowLeftIcon, BookOpenIcon } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://api.aeferalow.my.id'

function CodeBlock({ lang = 'bash', code }: { lang?: string; code: string }) {
  return (
    <div style={{ position: 'relative', marginBottom: 20, boxShadow: 'var(--nb-shadow)', borderRadius: 4 }}>
      <div className="nb-code-header" style={{
        margin: 0, borderRadius: '4px 4px 0 0',
        border: '2px solid var(--nb-black)', borderBottom: 'none',
      }}>
        <span>{lang.toUpperCase()}</span>
        <CopyButton text={code} size="sm" />
      </div>
      <div className="nb-code" style={{ borderRadius: '0 0 4px 4px', marginTop: 0, boxShadow: 'none', overflowX: 'auto', maxWidth: '100vw' }}>
        <pre style={{ color: '#E8E8E8', fontSize: '0.83rem', lineHeight: 1.8, margin: 0 }}>{code}</pre>
      </div>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 48, scrollMarginTop: 80 }}>
      <div style={{
        display: 'inline-block',
        background: 'var(--nb-yellow)',
        border: '2px solid var(--nb-black)',
        borderRadius: 2,
        padding: '2px 10px',
        marginBottom: 12,
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--nb-black)', margin: 0,
        }}>{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  )
}

export default function DocsPage() {
  const navLinks = [
    { id: 'overview',      label: 'Overview' },
    { id: 'authentication',label: 'Authentication' },
    { id: 'chat',          label: 'Chat Completions' },
    { id: 'models',        label: 'Models' },
    { id: 'streaming',     label: 'Streaming' },
    { id: 'rate-limits',   label: 'Rate Limits' },
    { id: 'errors',        label: 'Error Codes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nb-cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{
        background: 'var(--nb-black)',
        borderBottom: '3px solid var(--nb-black)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" className="nb-btn nb-btn-secondary nb-btn-sm"
            style={{ background: '#2A2A2A', color: '#9CA3AF', borderColor: '#3A3A3A' }}>
            <ArrowLeftIcon size={14} /> Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpenIcon size={18} color="var(--nb-yellow)" />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800, fontSize: '1rem', color: 'var(--nb-cream)',
            }}>Documentation</span>
          </div>
        </div>
        <Link href="/playground" className="nb-btn nb-btn-primary nb-btn-sm">
          Try Playground
        </Link>
      </div>

      <div className="nb-mobile-stack" style={{ display: 'flex', flex: 1 }}>
        <div
          className="docs-sidebar"
          style={{
            width: 240, flexShrink: 0,
            background: 'var(--nb-white)',
            borderRight: '3px solid var(--nb-black)',
            borderBottom: '3px solid var(--nb-black)',
            padding: '24px 16px',
            position: 'sticky', top: 57, maxHeight: 'calc(100vh - 57px)', overflowY: 'auto',
          }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 768px) {
              .docs-sidebar {
                width: 100% !important;
                border-right: none !important;
                position: relative !important;
                top: 0 !important;
                height: auto !important;
                max-height: none !important;
                display: flex !important;
                flex-direction: row !important;
                overflow-x: auto !important;
                padding: 12px 16px !important;
                gap: 12px !important;
                align-items: center !important;
                white-space: nowrap !important;
              }
              .docs-sidebar > div { margin: 0 !important; }
              .docs-sidebar > a { margin: 0 !important; padding: 4px 12px !important; }
              .docs-content { padding: 24px 16px !important; }
            }
          `}} />
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.65rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--nb-gray)', marginBottom: 12,
          }}>Contents</div>
          {navLinks.map(l => (
            <a key={l.id} href={`#${l.id}`} style={{
              display: 'block',
              padding: '8px 12px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.875rem', fontWeight: 600,
              color: 'var(--nb-gray)', textDecoration: 'none',
              borderRadius: 2, marginBottom: 2,
              transition: 'all 0.1s',
            }}
              onMouseOver={e => { (e.target as HTMLElement).style.background = '#F5F0E8'; (e.target as HTMLElement).style.color = 'var(--nb-black)' }}
              onMouseOut={e => { (e.target as HTMLElement).style.background = ''; (e.target as HTMLElement).style.color = 'var(--nb-gray)' }}
            >{l.label}</a>
          ))}
        </div>

        {/* Content */}
        <div className="docs-content" style={{ flex: 1, padding: '40px 48px', maxWidth: 860, overflowX: 'hidden' }}>

          <Section id="overview" title="Overview">
            <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: 16, color: '#333' }}>
              Aeferalow API is an OpenAI-compatible gateway that routes requests across multiple AI providers
              with automatic failover, rate limiting, and usage tracking.
            </p>
            <div className="nb-grid-stats" style={{ marginBottom: 20 }}>
              {[
                ['Base URL', BASE_URL + '/v1'],
                ['Protocol', 'HTTPS only'],
                ['Format', 'JSON (application/json)'],
                ['Auth', 'Bearer token'],
              ].map(([k, v]) => (
                <div key={k} style={{
                  padding: '12px 16px',
                  background: 'var(--nb-white)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', color: 'var(--nb-gray)', marginBottom: 4 }}>{k}</div>
                  <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{v}</code>
                </div>
              ))}
            </div>
          </Section>

          <Section id="authentication" title="Authentication">
            <p style={{ lineHeight: 1.8, marginBottom: 16, color: '#333' }}>
              All requests require an API key passed in the <code className="nb-inline-code">Authorization</code> header as a Bearer token.
              API keys are prefixed with <code className="nb-inline-code">afr_</code>.
            </p>
            <CodeBlock lang="bash" code={`curl ${BASE_URL}/v1/chat/completions \\
  -H "Authorization: Bearer afr_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`} />
            <CodeBlock lang="javascript" code={`import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'afr_your_api_key',
  baseURL: '${BASE_URL}/v1',
})
`} />
          </Section>

          <Section id="chat" title="Chat Completions">
            <p style={{ lineHeight: 1.8, marginBottom: 16, color: '#333' }}>
              <code className="nb-inline-code">POST /v1/chat/completions</code> — OpenAI-compatible endpoint.
            </p>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, marginBottom: 12 }}>Request Body</h3>
            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table className="nb-table">
                <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                <tbody>
                  {[
                    ['model',       'string',  'Yes', 'Model ID (see Models section)'],
                    ['messages',    'array',   'Yes', 'Array of {role, content} objects'],
                    ['stream',      'boolean', 'No',  'Enable SSE streaming (default: false)'],
                    ['temperature', 'number',  'No',  '0.0–2.0, controls randomness (default: 0.7)'],
                    ['max_tokens',  'integer', 'No',  'Max tokens to generate (default: 4096)'],
                  ].map(([f, t, r, d]) => (
                    <tr key={f}>
                      <td><code className="nb-inline-code">{f}</code></td>
                      <td style={{ color: 'var(--nb-blue)', fontFamily: 'monospace' }}>{t}</td>
                      <td>{r === 'Yes' ? <span className="nb-badge nb-badge-red">Required</span> : <span className="nb-badge nb-badge-gray">Optional</span>}</td>
                      <td style={{ color: 'var(--nb-gray)' }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CodeBlock lang="javascript" code={`const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is 2+2?' },
  ],
  temperature: 0.7,
  max_tokens: 512,
})
console.log(response.choices[0].message.content)`} />
          </Section>

          <Section id="models" title="Models">
            <p style={{ lineHeight: 1.8, marginBottom: 16, color: '#333' }}>
              <code className="nb-inline-code">GET /v1/models</code> — Returns available models.
            </p>
            <div className="nb-grid-stats" style={{ marginBottom: 20 }}>
              {[
                { id: 'gpt-5-mini',  badge: 'Fast',   desc: 'Fastest response, best for simple tasks' },
                { id: 'gpt-4o-mini', badge: 'Smart',  desc: 'Best balance of speed and intelligence' },
                { id: 'gpt-5-chat',  badge: 'Pro',    desc: 'Most capable model for complex reasoning' },
              ].map(m => (
                <div key={m.id} style={{
                  padding: '14px 18px',
                  background: 'var(--nb-white)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                  boxShadow: 'var(--nb-shadow-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{m.id}</code>
                    <span className={`nb-badge nb-badge-${m.badge === 'Fast' ? 'green' : m.badge === 'Smart' ? 'blue' : 'purple'}`}>{m.badge}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--nb-gray)' }}>{m.desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="streaming" title="Streaming">
            <p style={{ lineHeight: 1.8, marginBottom: 16, color: '#333' }}>
              Set <code className="nb-inline-code">stream: true</code> to receive Server-Sent Events (SSE).
              Compatible with all OpenAI SDKs.
            </p>
            <CodeBlock lang="javascript" code={`const stream = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
})

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? ''
  process.stdout.write(delta)
}`} />
          </Section>

          <Section id="rate-limits" title="Rate Limits">
            <p style={{ lineHeight: 1.8, marginBottom: 16, color: '#333' }}>
              Rate limits are applied per API key. Default: <strong>60 requests/minute</strong>.
              Limits are configurable by administrators per key.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="nb-table">
                <thead><tr><th>Header</th><th>Description</th></tr></thead>
                <tbody>
                  {[
                    ['X-RateLimit-Limit',     'Max requests per window'],
                    ['X-RateLimit-Remaining', 'Requests remaining in current window'],
                    ['X-RateLimit-Reset',     'Unix timestamp when window resets'],
                  ].map(([h, d]) => (
                    <tr key={h}>
                      <td><code className="nb-inline-code">{h}</code></td>
                      <td style={{ color: 'var(--nb-gray)' }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="errors" title="Error Codes">
            <div style={{ overflowX: 'auto' }}>
              <table className="nb-table">
                <thead><tr><th>Code</th><th>Meaning</th><th>Solution</th></tr></thead>
                <tbody>
                  {[
                    ['400', 'Bad Request',        'Check your request body format'],
                    ['401', 'Unauthorized',        'Provide a valid API key'],
                    ['403', 'Forbidden',           'Key disabled or expired'],
                    ['429', 'Rate Limit Exceeded', 'Slow down or upgrade your key limit'],
                    ['500', 'Internal Error',      'All providers failed, retry later'],
                    ['503', 'Service Unavailable', 'Circuit breakers open, retry in 30s'],
                  ].map(([code, meaning, solution]) => (
                    <tr key={code}>
                      <td>
                        <span className={`nb-badge ${code.startsWith('4') ? 'nb-badge-red' : 'nb-badge-orange'}`}>
                          {code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{meaning}</td>
                      <td style={{ color: 'var(--nb-gray)', fontSize: '0.85rem' }}>{solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
