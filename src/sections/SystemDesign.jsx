function DiagramBox({ title, subtitle, accent = 'violet', children }) {
  const accents = {
    violet: 'border-violet-200 bg-violet-50',
    sky: 'border-sky-200 bg-sky-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    amber: 'border-amber-200 bg-amber-50',
    rose: 'border-rose-200 bg-rose-50',
    slate: 'border-slate-200 bg-slate-50',
  }
  return (
    <div className={`rounded-xl border-2 ${accents[accent]} px-4 py-3`}>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
      {children}
    </div>
  )
}

function MemoryTiers() {
  const tiers = [
    {
      tier: 'Short-term',
      latency: '~10ms',
      scope: 'Current conversation',
      detail: 'In-context message buffer; ephemeral working state. Trim with summarization at 70% of window.',
      accent: 'sky',
    },
    {
      tier: 'Long-term RAG',
      latency: '~50–200ms',
      scope: 'Knowledge base',
      detail: 'Vector store + reranker over docs/code. Hybrid (BM25 + dense) for recall; metadata filters for precision.',
      accent: 'violet',
    },
    {
      tier: 'Episodic',
      latency: '~50ms',
      scope: 'Past task summaries',
      detail: 'Compressed traces of prior runs (decisions, tools used, outcomes). Surfaces "I have done this before" context.',
      accent: 'emerald',
    },
  ]

  return (
    <div className="space-y-3">
      {tiers.map((t) => (
        <div key={t.tier} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[160px_120px_1fr]">
          <div>
            <DiagramBox title={t.tier} accent={t.accent} />
          </div>
          <div className="text-xs text-slate-500">
            <p><span className="font-semibold text-slate-700">Latency:</span> {t.latency}</p>
            <p className="mt-1"><span className="font-semibold text-slate-700">Scope:</span> {t.scope}</p>
          </div>
          <p className="text-sm text-slate-700">{t.detail}</p>
        </div>
      ))}
      <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
        <span className="text-violet-300">// retrieval order</span>
        {'\n'}context = [...short_term, ...episodic.recent(k=3), ...rag.search(q, k=8)]
      </div>
    </div>
  )
}

function HierarchicalDiagram() {
  return (
    <svg viewBox="0 0 320 200" className="w-full">
      <defs>
        <marker id="arrow-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
        </marker>
      </defs>
      <rect x="120" y="10" width="80" height="36" rx="8" fill="#f5f3ff" stroke="#a78bfa" strokeWidth="2" />
      <text x="160" y="33" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5b21b6">Manager</text>
      {[40, 130, 220].map((x, i) => (
        <g key={i}>
          <line x1="160" y1="46" x2={x + 30} y2="100" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-h)" />
          <rect x={x} y="100" width="60" height="32" rx="6" fill="#ecfeff" stroke="#67e8f9" strokeWidth="1.5" />
          <text x={x + 30} y="120" textAnchor="middle" fontSize="10" fontWeight="500" fill="#0e7490">Worker {i + 1}</text>
        </g>
      ))}
      <rect x="120" y="160" width="80" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="160" y="178" textAnchor="middle" fontSize="10" fill="#475569">Shared scratchpad</text>
    </svg>
  )
}

function PeerToPeerDiagram() {
  const nodes = [
    { x: 160, y: 30, label: 'Researcher' },
    { x: 50, y: 110, label: 'Coder' },
    { x: 270, y: 110, label: 'Critic' },
    { x: 160, y: 180, label: 'Executor' },
  ]
  return (
    <svg viewBox="0 0 320 220" className="w-full">
      <defs>
        <marker id="arrow-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
        </marker>
      </defs>
      {nodes.map((a, i) =>
        nodes.map((b, j) =>
          i < j ? <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cbd5e1" strokeWidth="1" /> : null
        )
      )}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="26" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

function Orchestration() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">Hierarchical</h4>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Top-down</span>
        </div>
        <HierarchicalDiagram />
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          <li>• Predictable; one place to debug routing.</li>
          <li>• Manager bottleneck under fan-out.</li>
          <li>• Best for: well-scoped pipelines, audit trails.</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">Peer-to-Peer Swarm</h4>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Emergent</span>
        </div>
        <PeerToPeerDiagram />
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          <li>• Higher throughput, more emergent behavior.</li>
          <li>• Harder to bound cost & loop-detect.</li>
          <li>• Best for: open-ended research, brainstorming.</li>
        </ul>
      </div>
    </div>
  )
}

function EvalsDiagram() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <DiagramBox title="Agent output" subtitle="Response + trace" accent="sky" />
        <span className="hidden text-2xl text-slate-300 md:block">→</span>
        <DiagramBox title="Judge LLM" subtitle="Scores against rubric" accent="violet" />
        <span className="hidden text-2xl text-slate-300 md:block">→</span>
        <DiagramBox title="Score + reasoning" subtitle="Persisted to evals DB" accent="emerald" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rubric</p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
            <li>• Faithfulness to source</li>
            <li>• Tool-call correctness</li>
            <li>• Format / schema adherence</li>
            <li>• Refusal calibration</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Calibration</p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
            <li>• Pairwise &gt; absolute scoring</li>
            <li>• Audit ~5% with humans</li>
            <li>• Use a stronger model as judge</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Production gates</p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
            <li>• Block deploy on regression</li>
            <li>• Sample 1% live traffic</li>
            <li>• Slice metrics by tool / intent</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function SystemDesign() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">System Design & Architecture</h2>
        <p className="mt-1 text-sm text-slate-600">Reference diagrams and templates for production-grade agentic systems.</p>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Memory Tiers</h3>
        <p className="mb-4 text-sm text-slate-600">Three-tier memory is the dominant pattern for agents that need both immediacy and recall.</p>
        <MemoryTiers />
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Orchestration Topologies</h3>
        <Orchestration />
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Evaluations: LLM-as-a-Judge</h3>
        <EvalsDiagram />
      </section>
    </div>
  )
}
