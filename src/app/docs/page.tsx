import Link from 'next/link'

const CODE_EXAMPLES = {
  curl: `curl https://api.aeferalow.my.id/v1/chat/completions \\
  -H "Authorization: Bearer afr_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,

  python: `from openai import OpenAI

client = OpenAI(
    api_key="afr_your_key_here",
    base_url="https://api.aeferalow.my.id/v1"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`,

  javascript: `import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'afr_your_key_here',
  baseURL: 'https://api.aeferalow.my.id/v1',
})

const res = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
})
console.log(res.choices[0].message.content)`,

  streaming: `const stream = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Write a story' }],
  stream: true,
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '')
}`,
}

const ERROR_CODES = [
  { code: '401', desc: 'Invalid or missing API key' },
  { code: '403', desc: 'API key disabled or expired' },
  { code: '429', desc: 'Rate limit exceeded' },
  { code: '400', desc: 'Invalid request body' },
  { code: '502', desc: 'Upstream provider error' },
  { code: '503', desc: 'All providers unavailable' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>{title}</h2>
      {children}
    </section>
  )
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="code-block">
      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{lang}</div>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800 }}>A</div>
          <span style={{ fontWeight: 700 }}>Aeferalow API</span>
        </Link>
        <Link href="/chat" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>Try Playground</Link>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0, padding: '32px 20px',
          position: 'sticky', top: '60px', height: 'calc(100vh - 60px)', overflowY: 'auto',
        }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Getting Started</p>
          {['intro', 'authentication', 'base-url'].map((id) => (
            <a key={id} href={`#${id}`} style={{
              display: 'block', padding: '6px 0', color: 'var(--text-muted)',
              textDecoration: 'none', fontSize: '0.875rem', textTransform: 'capitalize',
            }}>{id.replace('-', ' ')}</a>
          ))}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 12px' }}>Endpoints</p>
          {['models', 'chat-completions', 'me', 'usage'].map((id) => (
            <a key={id} href={`#${id}`} style={{
              display: 'block', padding: '6px 0', color: 'var(--text-muted)',
              textDecoration: 'none', fontSize: '0.875rem',
            }}>/{id.replace('-', '/')}</a>
          ))}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 12px' }}>Examples</p>
          {['curl', 'python', 'javascript', 'streaming'].map((id) => (
            <a key={id} href={`#${id}`} style={{
              display: 'block', padding: '6px 0', color: 'var(--text-muted)',
              textDecoration: 'none', fontSize: '0.875rem', textTransform: 'capitalize',
            }}>{id}</a>
          ))}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 12px' }}>Reference</p>
          <a href="#errors" style={{ display: 'block', padding: '6px 0', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Error Codes</a>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px 48px 80px', maxWidth: '800px' }}>
          <Section id="intro" title="Introduction">
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Aeferalow API is an OpenAI-compatible API gateway. Use it as a drop-in replacement for OpenAI — 
              just change the <code style={{ color: 'var(--accent-light)' }}>baseURL</code> and API key in your existing code.
            </p>
          </Section>

          <Section id="authentication" title="Authentication">
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.8 }}>
              All API requests must include your API key in the <code style={{ color: 'var(--accent-light)' }}>Authorization</code> header as a Bearer token.
            </p>
            <CodeBlock lang="http" code={`Authorization: Bearer afr_your_api_key_here`} />
            <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '0.875rem' }}>
              Contact your administrator to get an API key. Keys start with <code style={{ color: 'var(--accent-light)' }}>afr_</code>.
            </p>
          </Section>

          <Section id="base-url" title="Base URL">
            <CodeBlock lang="text" code="https://api.aeferalow.my.id" />
          </Section>

          <Section id="models" title="GET /v1/models">
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>List all available models.</p>
            <CodeBlock lang="curl" code={`curl https://api.aeferalow.my.id/v1/models \\
  -H "Authorization: Bearer afr_your_key"`} />
          </Section>

          <Section id="chat-completions" title="POST /v1/chat/completions">
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Create a chat completion. Supports streaming via SSE.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(CODE_EXAMPLES).slice(0, 1).map(([lang, code]) => (
                <CodeBlock key={lang} lang={lang} code={code} />
              ))}
            </div>
          </Section>

          <Section id="curl" title="Example: cURL">
            <CodeBlock lang="curl" code={CODE_EXAMPLES.curl} />
          </Section>

          <Section id="python" title="Example: Python">
            <CodeBlock lang="python" code={CODE_EXAMPLES.python} />
          </Section>

          <Section id="javascript" title="Example: JavaScript / Node.js">
            <CodeBlock lang="javascript" code={CODE_EXAMPLES.javascript} />
          </Section>

          <Section id="streaming" title="Example: Streaming">
            <CodeBlock lang="javascript" code={CODE_EXAMPLES.streaming} />
          </Section>

          <Section id="errors" title="Error Codes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ERROR_CODES.map((e) => (
                <div key={e.code} className="glass-2" style={{ padding: '12px 16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <code style={{ color: 'var(--red)', minWidth: '48px', fontWeight: 600 }}>{e.code}</code>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{e.desc}</span>
                </div>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}
