'use client'

import { useState } from 'react'

interface Agent {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  description: string
  expertise: string[]
  currentFocus: string
  status: 'active' | 'idle' | 'busy'
  recentTasks: string[]
}

const team: { owner: Agent; agents: Agent[] } = {
  owner: {
    id: 'josh',
    name: 'Josh A',
    role: 'Founder',
    emoji: '👤',
    color: 'from-amber-500 to-orange-600',
    description: 'The human behind the operation. Entrepreneur, builder, visionary.',
    expertise: ['Strategy', 'Vision', 'Decisions'],
    currentFocus: 'Building the future',
    status: 'active',
    recentTasks: ['Reviewing agent outputs', 'Planning next moves', 'Connecting the dots'],
  },
  agents: [
    {
      id: 'jimmy',
      name: 'Jimmy',
      role: 'Personal Assistant',
      emoji: '🤵',
      color: 'from-blue-500 to-cyan-500',
      description: 'Your right hand for daily life. Calendar, reminders, research, and keeping things organized.',
      expertise: ['Scheduling', 'Research', 'Organization', 'Communication'],
      currentFocus: 'Managing your day',
      status: 'active',
      recentTasks: ['Calendar management', 'Email drafts', 'Meeting prep'],
    },
    {
      id: 'max',
      name: 'Max',
      role: 'Dev Expert',
      emoji: '💻',
      color: 'from-violet-500 to-purple-600',
      description: 'Technical brain for code, debugging, architecture, and infrastructure.',
      expertise: ['Development', 'Debugging', 'Architecture', 'DevOps'],
      currentFocus: 'Building agent dashboard',
      status: 'busy',
      recentTasks: ['Home Hustle landing pages', 'Lead gen skill install', 'This dashboard'],
    },
    {
      id: 'nora',
      name: 'Nora',
      role: 'Bookkeeper',
      emoji: '📊',
      color: 'from-emerald-500 to-green-600',
      description: 'Financial wizard handling books, reports, and keeping the numbers straight.',
      expertise: ['Bookkeeping', 'Financial Reports', 'Invoicing', 'Tax Prep'],
      currentFocus: 'Financial oversight',
      status: 'idle',
      recentTasks: ['Monthly reconciliation', 'Expense tracking', 'Invoice management'],
    },
    {
      id: 'evan',
      name: 'Evan',
      role: 'Team Support',
      emoji: '🤝',
      color: 'from-rose-500 to-pink-600',
      description: 'Coordination and team operations. Keeps everyone aligned and moving forward.',
      expertise: ['Coordination', 'Project Management', 'Team Ops', 'Documentation'],
      currentFocus: 'Team alignment',
      status: 'active',
      recentTasks: ['Task tracking', 'Team updates', 'Process documentation'],
    },
  ],
}

function StatusBadge({ status }: { status: Agent['status'] }) {
  const styles = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    busy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    idle: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }

  const labels = {
    active: '● Online',
    busy: '● Working',
    idle: '○ Idle',
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function AgentCard({ agent, isOwner = false, onClick }: { agent: Agent; isOwner?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        ${isOwner ? 'w-32 h-32' : 'w-28 h-28'}
        group
      `}
    >
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl bg-gradient-to-br ${agent.color} opacity-0 
        group-hover:opacity-30 blur-xl transition-opacity duration-300
      `} />
      
      {/* Card */}
      <div className={`
        relative h-full rounded-2xl bg-slate-800/80 border border-slate-700
        group-hover:border-slate-500 group-hover:bg-slate-800
        flex flex-col items-center justify-center p-3
        transition-all duration-300 group-hover:scale-105
        backdrop-blur-sm
      `}>
        {/* Status dot */}
        <div className={`
          absolute top-2 right-2 w-2 h-2 rounded-full
          ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : ''}
          ${agent.status === 'busy' ? 'bg-amber-500 animate-pulse' : ''}
          ${agent.status === 'idle' ? 'bg-slate-500' : ''}
        `} />
        
        {/* Emoji */}
        <div className={`
          text-3xl ${isOwner ? 'text-4xl' : 'text-3xl'} mb-1
          group-hover:scale-110 transition-transform duration-300
        `}>
          {agent.emoji}
        </div>
        
        {/* Name */}
        <div className="font-semibold text-white text-sm">{agent.name}</div>
        
        {/* Role */}
        <div className="text-xs text-slate-400">{agent.role}</div>
      </div>
    </div>
  )
}

function AgentDetail({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl`}>
              {agent.emoji}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <p className="text-slate-400">{agent.role}</p>
              <StatusBadge status={agent.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-slate-300 mb-4">{agent.description}</p>

        {/* Current Focus */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Current Focus</h3>
          <p className="text-white bg-slate-700/50 rounded-lg px-3 py-2">{agent.currentFocus}</p>
        </div>

        {/* Expertise */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">💪 Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {agent.expertise.map((skill) => (
              <span key={skill} className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">📋 Recent Activity</h3>
          <ul className="space-y-1">
            {agent.recentTasks.map((task, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                {task}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          🚀 Your Team
        </h1>
        <p className="text-slate-400">
          AI agents working for you, 24/7
        </p>
      </header>

      {/* Team Visualization */}
      <div className="max-w-4xl mx-auto">
        {/* Stats Bar */}
        <div className="flex justify-center gap-6 mb-8 md:mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{team.agents.length}</div>
            <div className="text-xs text-slate-400">Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {team.agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {team.agents.filter(a => a.status === 'busy').length}
            </div>
            <div className="text-xs text-slate-400">Working</div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="relative flex flex-col items-center">
          {/* Owner (Center) */}
          <div className="mb-8 animate-float">
            <AgentCard 
              agent={team.owner} 
              isOwner={true} 
              onClick={() => setSelectedAgent(team.owner)} 
            />
          </div>

          {/* Connection Lines (SVG) */}
          <svg className="absolute top-[130px] left-1/2 -translate-x-1/2 w-full h-16 pointer-events-none" style={{ maxWidth: '400px' }}>
            {/* Lines from owner to each agent */}
            <path d="M 50% 0 L 12.5% 100%" className="connection-line" style={{ stroke: '#475569' }} />
            <path d="M 50% 0 L 37.5% 100%" className="connection-line" style={{ stroke: '#475569' }} />
            <path d="M 50% 0 L 62.5% 100%" className="connection-line" style={{ stroke: '#475569' }} />
            <path d="M 50% 0 L 87.5% 100%" className="connection-line" style={{ stroke: '#475569' }} />
          </svg>

          {/* Agents Row */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
            {team.agents.map((agent, index) => (
              <div 
                key={agent.id} 
                className="animate-float"
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <AgentCard 
                  agent={agent} 
                  onClick={() => setSelectedAgent(agent)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-4">Click any agent to see details</p>
          <div className="flex justify-center gap-3">
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              + Add Agent
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-slate-600 text-sm">
        <p>Powered by Clawdbot 🦞</p>
      </footer>
    </div>
  )
}
