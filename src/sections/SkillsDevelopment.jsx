const TRACKS = [
  {
    id: 'prompt-eng',
    title: 'Prompt Engineering for Reasoning Models',
    icon: '🧠',
    accent: 'from-violet-500 to-fuchsia-600',
    summary: 'Working with reasoning models (o-series, extended thinking) is closer to spec writing than prompt tweaking.',
    levels: [
      {
        level: 'Foundation',
        weeks: '1–2 weeks',
        items: [
          'Chain-of-Thought: when to ask for it explicitly vs. let the model think internally.',
          'Verification prompts: ask the model to double-check critical sub-claims.',
          'Few-shot vs zero-shot tradeoffs on reasoning models — usually less is more.',
        ],
      },
      {
        level: 'Production',
        weeks: '2–3 weeks',
        items: [
          'Structured output via JSON schema; recovery on schema violations.',
          'Reasoning-effort dials: low/medium/high and how to choose per task tier.',
          'Self-Verify pattern: emit answer + confidence + supporting evidence, then gate.',
        ],
      },
      {
        level: 'Advanced',
        weeks: 'ongoing',
        items: [
          'Custom evals tied to business metrics (not just BLEU/ROUGE).',
          'Long-horizon agent prompts: persistent system instructions, role permanence.',
          'Adversarial prompt hardening — jailbreak suite + regression gate.',
        ],
      },
    ],
  },
  {
    id: 'mcp',
    title: 'Building Custom MCP Servers',
    icon: '🔌',
    accent: 'from-sky-500 to-cyan-600',
    summary: 'Model Context Protocol is becoming the standard interface between agents and your internal systems.',
    levels: [
      {
        level: 'Foundation',
        weeks: '1 week',
        items: [
          'MCP primitives: tools, resources, prompts — when to use each.',
          'Stdio vs HTTP transports; auth on each.',
          'Build a "hello world" MCP server in TypeScript or Python.',
        ],
      },
      {
        level: 'Production',
        weeks: '2 weeks',
        items: [
          'Wrap an internal API as an MCP server with proper auth scopes.',
          'Resource pagination and streaming for large datasets.',
          'Schema design: tool descriptions that an LLM can actually pick correctly.',
        ],
      },
      {
        level: 'Advanced',
        weeks: 'ongoing',
        items: [
          'Multi-tenant MCP servers with per-user permissioning.',
          'Observability: trace every tool call with input/output for replay.',
          'Versioning and backwards compatibility for tool schemas.',
        ],
      },
    ],
  },
  {
    id: 'agentic-rag',
    title: 'Advanced RAG (Agentic RAG)',
    icon: '🔎',
    accent: 'from-emerald-500 to-teal-600',
    summary: 'Static RAG is dead. Agentic RAG uses an LLM to plan retrieval, expand queries, and rerank.',
    levels: [
      {
        level: 'Foundation',
        weeks: '1 week',
        items: [
          'Hybrid search: BM25 + dense + reranker (Cohere/Voyage).',
          'Chunking strategy: semantic vs structural; overlap tradeoffs.',
          'Eval harness: retrieval recall@k separate from end-to-end answer quality.',
        ],
      },
      {
        level: 'Production',
        weeks: '2–3 weeks',
        items: [
          'Query expansion: HyDE, multi-query, step-back prompting.',
          'Self-querying retrievers with metadata filters.',
          'Citation grounding + answer-faithfulness eval.',
        ],
      },
      {
        level: 'Advanced',
        weeks: 'ongoing',
        items: [
          'Agentic retrieval: agent decides whether to retrieve, what to retrieve, and when to stop.',
          'Graph-augmented RAG for relational knowledge.',
          'Adaptive chunking and live index refresh under write load.',
        ],
      },
    ],
  },
]

const QUARTERLY = [
  { q: 'Q1 2026', focus: 'Reasoning-model prompting', deliverable: 'Ship one feature using o-series + Self-Verify.' },
  { q: 'Q2 2026', focus: 'MCP servers', deliverable: 'Wrap one internal API as a production MCP server.' },
  { q: 'Q3 2026', focus: 'Agentic RAG', deliverable: 'Replace static retrieval with planner-driven retrieval.' },
  { q: 'Q4 2026', focus: 'Multi-agent orchestration', deliverable: 'Stand up a Manager-Worker pipeline with evals.' },
]

function LevelBlock({ level }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{level.level}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{level.weeks}</span>
      </div>
      <ul className="space-y-1.5">
        {level.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-violet-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Track({ track }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-r ${track.accent} px-6 py-5`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{track.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">{track.title}</h3>
            <p className="mt-1 text-sm text-white/85">{track.summary}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-3">
        {track.levels.map((lvl) => (
          <LevelBlock key={lvl.level} level={lvl} />
        ))}
      </div>
    </article>
  )
}

export default function SkillsDevelopment() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Skills Roadmap 2026</h2>
        <p className="mt-1 text-sm text-slate-600">A curated path for developers building production agentic systems this year.</p>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Quarterly milestones</h3>
        <div className="grid gap-3 md:grid-cols-4">
          {QUARTERLY.map((q, i) => (
            <div key={q.q} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{i + 1}</span>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{q.q}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{q.focus}</p>
              <p className="mt-1 text-xs text-slate-600">{q.deliverable}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Tracks</h3>
        {TRACKS.map((track) => (
          <Track key={track.id} track={track} />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-violet-900 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">Build, don't watch</p>
        <p className="mt-2 text-lg font-medium">Pick one track. Ship one feature this quarter using it. Repeat.</p>
        <p className="mt-1 text-sm text-violet-100">Reading agent papers without shipping is how you stay six months behind. Use the chatbot in the corner if you get stuck.</p>
      </section>
    </div>
  )
}
