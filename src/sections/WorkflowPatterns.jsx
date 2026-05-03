import { useState } from 'react'

const PATTERNS = [
  {
    id: 'reflection',
    label: 'Reflection',
    blurb: 'Self-correction loops that critique and revise their own output.',
    color: 'violet',
    steps: [
      { title: 'Generate', detail: 'Produce a candidate answer or tool plan.' },
      { title: 'Critique', detail: 'Score against an explicit rubric (often a separate prompt or smaller model).' },
      { title: 'Revise', detail: 'Rewrite using critique as input. Cap iterations (typically 2-3) to bound cost.' },
    ],
    tradeoff: '+ Quality wins on tasks with verifiable outputs. − Cost scales linearly with loop count.',
    code: `result = generate(task)
for _ in range(MAX_ITERS):
  critique = judge(result, rubric)
  if critique.score >= THRESHOLD:
    break
  result = revise(result, critique)
return result`,
  },
  {
    id: 'plan-execute',
    label: 'Plan-and-Execute',
    blurb: 'Plan all steps upfront, then execute the sequence with minimal re-planning.',
    color: 'sky',
    steps: [
      { title: 'Plan', detail: 'Decompose the task into an ordered list of sub-tasks (one strong-model call).' },
      { title: 'Execute', detail: 'Run each step, often with smaller/cheaper models and tool calls.' },
      { title: 'Replan (rare)', detail: 'Only re-invoke the planner on hard failures or scope changes.' },
    ],
    tradeoff: '+ Cheap, parallelizable, easy to audit. − Brittle when the world changes mid-task.',
    code: `plan = planner.plan(task)         # 1 call, expensive model
for step in plan.steps:
  result = executor.run(step)        # cheap model + tools
  if result.failed: plan = planner.replan(plan, result)`,
  },
  {
    id: 'react',
    label: 'ReAct',
    blurb: 'Interleave Reason → Act → Observe in a single loop. The model decides the next tool each turn.',
    color: 'emerald',
    steps: [
      { title: 'Reason', detail: 'Model writes a thought about what to do next given current observations.' },
      { title: 'Act', detail: 'Calls a tool — search, code execution, API.' },
      { title: 'Observe', detail: 'Tool result is appended to context; loop until done.' },
    ],
    tradeoff: '+ Adapts to new info mid-task. − More LLM calls, harder to bound cost; can loop.',
    code: `while not done:
  thought = model.reason(history)
  action = model.choose_tool(thought)
  observation = tools[action.name](action.args)
  history.append((thought, action, observation))`,
  },
  {
    id: 'manager-worker',
    label: 'Manager-Worker',
    blurb: 'A manager agent dispatches sub-tasks to specialized workers in parallel.',
    color: 'amber',
    steps: [
      { title: 'Decompose', detail: 'Manager splits the goal into independent sub-tasks.' },
      { title: 'Dispatch', detail: 'Workers run in parallel, each with focused tools and context.' },
      { title: 'Aggregate', detail: 'Manager merges results, resolves conflicts, returns final answer.' },
    ],
    tradeoff: '+ High throughput on fan-out work. − Coordination cost; conflicting partial results.',
    code: `subtasks = manager.decompose(goal)
results = await asyncio.gather(*[
  worker.run(t) for t in subtasks
])
return manager.aggregate(results)`,
  },
  {
    id: 'critic-generator',
    label: 'Critic-Generator',
    blurb: 'A generator drafts; a critic agent (often a stronger model) approves or pushes back.',
    color: 'rose',
    steps: [
      { title: 'Draft', detail: 'Generator produces the candidate output (cheap model OK).' },
      { title: 'Critique', detail: 'Critic checks correctness, safety, format. Returns pass/fail + reasons.' },
      { title: 'Loop or accept', detail: 'On fail, generator revises with critic feedback. Bounded retries.' },
    ],
    tradeoff: '+ Quality control without humans in the loop. − Critic blind spots become silent failures.',
    code: `draft = generator(task)
for _ in range(MAX_ITERS):
  verdict = critic(draft, task)
  if verdict.ok: return draft
  draft = generator.revise(draft, verdict.feedback)`,
  },
]

const COLOR_MAP = {
  violet: { ring: 'ring-violet-300', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
  sky: { ring: 'ring-sky-300', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200' },
  emerald: { ring: 'ring-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  amber: { ring: 'ring-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  rose: { ring: 'ring-rose-300', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
}

function PatternFlow({ pattern }) {
  const [activeStep, setActiveStep] = useState(0)
  const c = COLOR_MAP[pattern.color]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-slate-900">{pattern.label}</h4>
        <p className="mt-1 text-sm text-slate-600">{pattern.blurb}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {pattern.steps.map((s, i) => (
          <div key={s.title} className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activeStep === i
                  ? `${c.bg} ${c.text} ring-2 ${c.ring}`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${activeStep === i ? c.dot : 'bg-slate-400'}`} />
              {i + 1}. {s.title}
            </button>
            {i < pattern.steps.length - 1 && <span className="text-slate-300">→</span>}
          </div>
        ))}
      </div>

      <div className={`rounded-xl border-2 p-4 ${c.border} ${c.bg}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Step {activeStep + 1}: {pattern.steps[activeStep].title}
        </p>
        <p className="mt-1 text-sm text-slate-800">{pattern.steps[activeStep].detail}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold uppercase tracking-wider text-slate-500">Tradeoff</p>
          <p className="mt-1 text-slate-700">{pattern.tradeoff}</p>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-200"><code>{pattern.code}</code></pre>
      </div>
    </div>
  )
}

const GROUPS = [
  {
    title: 'Reflection',
    description: 'Self-correction loops.',
    patternIds: ['reflection'],
  },
  {
    title: 'Planning',
    description: '"Plan-and-Execute" vs "ReAct" patterns.',
    patternIds: ['plan-execute', 'react'],
  },
  {
    title: 'Multi-Agent',
    description: 'Manager-Worker and Critic-Generator architectures.',
    patternIds: ['manager-worker', 'critic-generator'],
  },
]

export default function WorkflowPatterns() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Agentic Workflow Patterns</h2>
        <p className="mt-1 text-sm text-slate-600">Click any step to expand it. The pattern you pick should match the task — not the other way around.</p>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
            <p className="text-sm text-slate-600">{group.description}</p>
          </div>
          <div className="space-y-4">
            {group.patternIds.map((id) => {
              const p = PATTERNS.find((x) => x.id === id)
              return <PatternFlow key={id} pattern={p} />
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
