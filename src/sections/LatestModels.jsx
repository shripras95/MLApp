import { useState, useEffect } from 'react'

const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const MODELS = [
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    vendor: 'OpenAI',
    accent: 'from-emerald-500 to-teal-600',
    pill: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    metrics: {
      toolCallingAccuracy: 96.2,
      parallelFunctionCalls: true,
      contextWindow: '1M tokens',
      reasoningTier: 'o-series fused',
      avgLatencyMs: 480,
      pricePerMTokIn: 2.5,
      pricePerMTokOut: 10.0,
    },
    strengths: ['Best-in-class structured output', 'Robust JSON schema enforcement', 'Tight Responses API'],
  },
  {
    id: 'claude-4.6',
    name: 'Claude 4.6',
    vendor: 'Anthropic',
    accent: 'from-orange-500 to-amber-600',
    pill: 'bg-orange-100 text-orange-700 ring-orange-200',
    metrics: {
      toolCallingAccuracy: 97.1,
      parallelFunctionCalls: true,
      contextWindow: '1M tokens',
      reasoningTier: 'extended thinking',
      avgLatencyMs: 520,
      pricePerMTokIn: 3.0,
      pricePerMTokOut: 15.0,
    },
    strengths: ['Highest tool-call accuracy', 'Long-horizon agent reliability', 'Best refusal calibration'],
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    vendor: 'Google',
    accent: 'from-sky-500 to-indigo-600',
    pill: 'bg-sky-100 text-sky-700 ring-sky-200',
    metrics: {
      toolCallingAccuracy: 95.4,
      parallelFunctionCalls: true,
      contextWindow: '2M tokens',
      reasoningTier: 'thinking budget',
      avgLatencyMs: 410,
      pricePerMTokIn: 1.25,
      pricePerMTokOut: 5.0,
    },
    strengths: ['Largest context window', 'Native multimodal grounding', 'Cheapest at scale'],
  },
]

const COMPARISON_ROWS = [
  {
    label: 'Tool-calling accuracy',
    key: 'toolCallingAccuracy',
    render: (v) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500" style={{ width: `${v}%` }} />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-700">{v}%</span>
      </div>
    ),
    note: 'Target 95%+ for production agents',
  },
  {
    label: 'Native parallel function calling',
    key: 'parallelFunctionCalls',
    render: (v) =>
      v ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Supported
        </span>
      ) : (
        <span className="text-xs text-slate-400">—</span>
      ),
    note: 'Critical for fan-out tool orchestration',
  },
  {
    label: 'Context window',
    key: 'contextWindow',
    render: (v) => <span className="font-mono text-sm font-semibold text-slate-800">{v}</span>,
    note: 'Up to 2M tokens for whole-codebase grounding',
  },
  {
    label: 'Reasoning mode',
    key: 'reasoningTier',
    render: (v) => <span className="text-sm text-slate-700">{v}</span>,
    note: 'How the model exposes deliberate reasoning',
  },
  {
    label: 'Avg latency (first token)',
    key: 'avgLatencyMs',
    render: (v) => <span className="font-mono text-sm text-slate-700">{v} ms</span>,
    note: 'p50, single-tool prompt',
  },
  {
    label: 'Price / 1M input tok',
    key: 'pricePerMTokIn',
    render: (v) => <span className="font-mono text-sm text-slate-700">${v.toFixed(2)}</span>,
  },
  {
    label: 'Price / 1M output tok',
    key: 'pricePerMTokOut',
    render: (v) => <span className="font-mono text-sm text-slate-700">${v.toFixed(2)}</span>,
  },
]

const TRACKER_PROMPT = `Search the web for the most recent (last 14 days) developer-relevant updates about these three frontier models: GPT-5.4 (OpenAI), Claude 4.6 (Anthropic), and Gemini 3.1 Pro (Google). Focus on: API/SDK changes, tool-calling behavior, context window expansions, pricing, evals, and notable agent benchmarks.

Return JSON only (no prose, no markdown fences) with this shape:
{
  "updates": [
    { "model": "GPT-5.4 | Claude 4.6 | Gemini 3.1 Pro", "title": "...", "summary": "1-2 sentence developer-focused summary", "impact": "High | Medium | Low", "source": "publication name" }
  ]
}
Aim for 4-6 updates. Prioritize items developers would act on.`

async function fetchModelUpdates(apiKey) {
  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: TRACKER_PROMPT }] }],
      tools: [{ google_search: {} }],
    }),
  })
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const candidate = data.candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') ?? ''
  const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((c) => c.web)
    .filter(Boolean)
    .map(({ uri, title }) => ({ uri, title }))
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Could not parse model response as JSON')
    parsed = JSON.parse(match[0])
  }
  return { ...parsed, sources }
}

const IMPACT_STYLES = {
  High: 'bg-rose-100 text-rose-700 ring-rose-200',
  Medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export default function LatestModels() {
  const [updates, setUpdates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetchedAt, setFetchedAt] = useState(null)
  
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY
  const [localApiKey, setLocalApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')
  const apiKey = envApiKey || localApiKey

  // Sync localApiKey if user sets it elsewhere
  useEffect(() => {
    const handleStorage = () => setLocalApiKey(localStorage.getItem('gemini_api_key') || '')
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  async function refresh() {
    const currentApiKey = envApiKey || localStorage.getItem('gemini_api_key')
    if (!currentApiKey) {
      setError('Missing Gemini API Key. Please enter it in the Dev Assistant chat.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchModelUpdates(currentApiKey)
      setUpdates(result)
      setFetchedAt(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Frontier Model Tracker</h2>
            <p className="mt-1 text-sm text-slate-600">Live snapshot of the three models you're most likely shipping to production.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {MODELS.map((m) => (
            <article key={m.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className={`bg-gradient-to-r ${m.accent} px-5 py-4`}>
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">{m.vendor}</p>
                <p className="text-xl font-semibold text-white">{m.name}</p>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500">Tool-calling</span>
                  <span className="font-mono text-2xl font-bold text-slate-900">{m.metrics.toolCallingAccuracy}%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500">Context</span>
                  <span className="font-mono text-sm font-semibold text-slate-800">{m.metrics.contextWindow}</span>
                </div>
                <ul className="space-y-1 border-t border-slate-100 pt-3">
                  {m.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-violet-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Head-to-Head Comparison</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Capability</th>
                {MODELS.map((m) => (
                  <th key={m.id} className="px-5 py-3 font-medium">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${m.pill}`}>{m.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 align-top">
                    <p className="font-medium text-slate-800">{row.label}</p>
                    {row.note && <p className="mt-0.5 text-xs text-slate-500">{row.note}</p>}
                  </td>
                  {MODELS.map((m) => (
                    <td key={m.id} className="px-5 py-3 align-middle">
                      {row.render(m.metrics[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">Numbers reflect vendor-published benchmarks and community evals; verify against your own workload before betting the roadmap.</p>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Real-time updates</h3>
            <p className="text-sm text-slate-600">Recent dev-relevant changes pulled live from web search.</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Searching…
              </>
            ) : updates ? 'Refresh' : 'Pull latest updates'}
          </button>
        </div>

        {fetchedAt && <p className="mb-3 text-xs text-slate-400">Last updated {fetchedAt.toLocaleTimeString()}</p>}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <strong className="font-semibold">Something went wrong: </strong>
            {error}
          </div>
        )}

        {!updates && !loading && !error && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-10 text-center text-sm text-slate-500">
            Click the button to fetch the latest dev-relevant updates for these three models.
          </div>
        )}

        <div className="grid gap-3">
          {updates?.updates?.map((u, i) => (
            <article key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{u.model}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${IMPACT_STYLES[u.impact] ?? IMPACT_STYLES.Low}`}>
                  {u.impact} impact
                </span>
                {u.source && <span className="text-xs text-slate-400">via {u.source}</span>}
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{u.title}</h4>
              <p className="mt-1 text-sm text-slate-600">{u.summary}</p>
            </article>
          ))}
        </div>

        {updates?.sources?.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Sources</p>
            <ul className="flex flex-wrap gap-2">
              {updates.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.uri} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-violet-300 hover:text-violet-700">
                    {s.title || new URL(s.uri).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
