import { useState } from 'react'
import Chatbot from './Chatbot.jsx'
import LatestModels from './sections/LatestModels.jsx'
import SystemDesign from './sections/SystemDesign.jsx'
import WorkflowPatterns from './sections/WorkflowPatterns.jsx'
import SkillsDevelopment from './sections/SkillsDevelopment.jsx'

const TABS = [
  {
    id: 'models',
    icon: '⚡',
    label: 'Latest Models',
    blurb: 'GPT-5.4 vs Claude 4.6 vs Gemini 3.1 Pro — head-to-head + live updates.',
    Component: LatestModels,
  },
  {
    id: 'design',
    icon: '🏗️',
    label: 'System Design',
    blurb: 'Memory tiers, orchestration topologies, LLM-as-a-judge evals.',
    Component: SystemDesign,
  },
  {
    id: 'patterns',
    icon: '🤖',
    label: 'Workflow Patterns',
    blurb: 'Reflection, Plan-and-Execute vs ReAct, Manager-Worker, Critic-Generator.',
    Component: WorkflowPatterns,
  },
  {
    id: 'skills',
    icon: '📈',
    label: 'Skills Development',
    blurb: 'Skills Roadmap 2026: reasoning prompts, MCP servers, agentic RAG.',
    Component: SkillsDevelopment,
  },
]

export default function App() {
  const [activeTabId, setActiveTabId] = useState('models')
  const activeTab = TABS.find((t) => t.id === activeTabId)
  const ActiveComponent = activeTab.Component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-violet-700 text-white shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Agentic Dev Dashboard</p>
              <p className="text-xs text-slate-500">For developers shipping AI agents</p>
            </div>
          </div>
          <a
            href="https://ai.google.dev/"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs text-slate-500 hover:text-violet-700 sm:inline"
          >
            Powered by Gemini ↗
          </a>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-6">
          <div className="flex gap-1 pb-2">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTabId
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">{activeTab.label}</p>
          <p className="mt-1 text-base text-slate-700">{activeTab.blurb}</p>
        </div>

        <ActiveComponent />

        <footer className="mt-16 text-center text-xs text-slate-400">
          Built with React, Vite, Tailwind, and the Gemini API. Numbers shown are illustrative — verify against your own evals.
        </footer>
      </main>

      <Chatbot activeSection={activeTab} />
    </div>
  )
}
