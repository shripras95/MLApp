import { useState, useRef, useEffect } from 'react'

const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

function buildSystemInstruction(activeSection) {
  const base = `You are a senior AI engineering assistant embedded in the "Agentic Dev Dashboard" — a developer-focused site covering frontier models, system design, agentic workflow patterns, and skills development.

Your audience is software engineers building production agents. Be concrete, opinionated, and code-first. Prefer 2-5 sentences plus a small code/JSON snippet when useful. When tradeoffs exist, name them explicitly. Avoid marketing fluff.

Topics you cover:
- Frontier models: GPT-5.4, Claude 4.6, Gemini 3.1 Pro — APIs, tool calling, context windows, pricing.
- System design: memory tiers (short-term, RAG, episodic), orchestration (hierarchical vs peer-to-peer), LLM-as-a-judge evals.
- Workflow patterns: Reflection, Plan-and-Execute, ReAct, Manager-Worker, Critic-Generator.
- Skills: prompt engineering for reasoning models, custom MCP servers, agentic RAG.`

  if (activeSection) {
    return `${base}\n\nThe user is currently viewing the "${activeSection.label}" section: ${activeSection.blurb} If their question is general, bias your answer toward this section's topic.`
  }
  return base
}

async function askGemini({ apiKey, history, activeSection }) {
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: buildSystemInstruction(activeSection) }] },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') ?? ''
  return text.trim() || "Sorry, I couldn't generate a response."
}

const SUGGESTED_PROMPTS = {
  models: [
    'Which model has the best tool-calling reliability?',
    'When should I pick Gemini 3.1 Pro for context window?',
  ],
  design: [
    'How do I structure memory tiers for a coding agent?',
    'Hierarchical vs peer-to-peer for a research agent?',
  ],
  patterns: [
    'When should I use ReAct vs Plan-and-Execute?',
    'How many reflection iterations is too many?',
  ],
  skills: [
    'What should I learn first for MCP servers?',
    'How do I evaluate an agentic RAG system?',
  ],
}

export default function Chatbot({ activeSection }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your agentic dev assistant. Ask about frontier models, architecture, workflow patterns, or what to learn next.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const suggestions = SUGGESTED_PROMPTS[activeSection?.id] ?? []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    if (!apiKey) {
      setError('Missing VITE_GEMINI_API_KEY in .env.local')
      return
    }

    const userMsg = { role: 'user', content: trimmed }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    setError(null)
    setLoading(true)

    try {
      const reply = await askGemini({
        apiKey,
        history: nextHistory.filter((m, i) => !(i === 0 && m.role === 'assistant')),
        activeSection,
      })
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
      setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong reaching the model. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    send(input)
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
          aria-label="Open chat"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ask the dev assistant
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[34rem] w-[24rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 to-violet-700 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Dev Assistant</p>
              <p className="text-xs text-violet-100">
                {activeSection ? `Context: ${activeSection.label}` : 'Powered by Gemini'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3.5 py-2 text-sm ring-1 ring-slate-200">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>
            )}
          </div>

          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="border-t border-slate-200 bg-white px-3 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Try asking</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about agents, models, RAG…"
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
