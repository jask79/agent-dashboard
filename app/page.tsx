'use client'

import { useState, useEffect } from 'react'

interface Agent {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  description: string
  expertise: string[]
  status: 'active' | 'idle' | 'busy'
  model?: string
  workspace?: string
  lastActive?: number | null
  totalTokens?: number
  sessionCount?: number
  telegramBot?: string
  toolRestrictions?: string[]
}

interface Owner {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  description: string
  expertise: string[]
  status: 'active' | 'idle' | 'busy'
}

interface Stats {
  totalAgents: number
  activeAgents: number
  busyAgents: number
  idleAgents: number
  totalTokensAllAgents: number
  totalSessions: number
}

interface ApiResponse {
  ok: boolean
  owner: Owner
  agents: Agent[]
  stats: Stats
  timestamp: number
  error?: string
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

function formatTimeAgo(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Never'
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
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

function AgentCard({ agent, isOwner = false, onClick }: { agent: Agent | Owner; isOwner?: boolean; onClick: () => void }) {
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
  const isFullAgent = 'model' in agent
  
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

        {/* Stats Grid - Only for agents with real data */}
        {isFullAgent && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{formatTokens(agent.totalTokens || 0)}</div>
              <div className="text-xs text-slate-400">Tokens</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{agent.sessionCount || 0}</div>
              <div className="text-xs text-slate-400">Sessions</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{formatTimeAgo(agent.lastActive)}</div>
              <div className="text-xs text-slate-400">Last Active</div>
            </div>
          </div>
        )}

        {/* Model & Workspace */}
        {isFullAgent && agent.model && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">🧠 Model:</span>
              <span className="text-white font-mono bg-slate-700/50 px-2 py-0.5 rounded">{agent.model.split('/').pop()}</span>
            </div>
            {agent.telegramBot && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">💬 Telegram:</span>
                <span className="text-white">{agent.telegramBot}</span>
              </div>
            )}
            {agent.workspace && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">📁 Workspace:</span>
                <span className="text-white font-mono text-xs bg-slate-700/50 px-2 py-0.5 rounded">{agent.workspace}</span>
              </div>
            )}
          </div>
        )}

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

        {/* Tool Restrictions */}
        {isFullAgent && agent.toolRestrictions && agent.toolRestrictions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">🔒 Restricted Tools</h3>
            <div className="flex flex-wrap gap-2">
              {agent.toolRestrictions.map((tool) => (
                <span key={tool} className="bg-red-900/30 text-red-400 px-2 py-1 rounded-md text-sm border border-red-800/50">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AddAgentModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: { name: string; role: string; description: string }) => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return
    setSubmitting(true)
    onSubmit({ name, role, description })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">✨ Request New Agent</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Charlie"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Marketing Specialist"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should this agent specialize in?"
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !role.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {submitting ? 'Sending...' : 'Request Agent'}
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          This will send a request to your main agent to provision the new agent.
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading agents...</p>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use external API URL if configured, otherwise fall back to local
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/agents`
        : '/api/agents'
      const res = await fetch(apiUrl)
      const json = await res.json()
      if (!json.ok) {
        throw new Error(json.error || 'Failed to fetch agents')
      }
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleAddAgent = async (agentData: { name: string; role: string; description: string }) => {
    // In a real implementation, this would send a message to the main agent
    // For now, we'll just show a success state
    console.log('Request new agent:', agentData)
    setRequestSent(true)
    setTimeout(() => {
      setShowAddModal(false)
      setRequestSent(false)
    }, 2000)
  }

  if (loading && !data) return <LoadingState />
  if (error && !data) return <ErrorState error={error} onRetry={fetchData} />
  if (!data) return null

  const { owner, agents, stats } = data

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
        {/* Last updated indicator */}
        <p className="text-xs text-slate-600 mt-2">
          Updated {formatTimeAgo(data.timestamp)}
        </p>
      </header>

      {/* Team Visualization */}
      <div className="max-w-4xl mx-auto">
        {/* Stats Bar */}
        <div className="flex justify-center gap-4 md:gap-6 mb-8 md:mb-12 flex-wrap">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalAgents}</div>
            <div className="text-xs text-slate-400">Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.activeAgents}</div>
            <div className="text-xs text-slate-400">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.busyAgents}</div>
            <div className="text-xs text-slate-400">Working</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">{stats.idleAgents}</div>
            <div className="text-xs text-slate-400">Idle</div>
          </div>
          <div className="text-center border-l border-slate-700 pl-4 md:pl-6">
            <div className="text-2xl font-bold text-violet-400">{formatTokens(stats.totalTokensAllAgents)}</div>
            <div className="text-xs text-slate-400">Total Tokens</div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="relative flex flex-col items-center">
          {/* Owner (Center) */}
          <div className="mb-8 animate-float">
            <AgentCard 
              agent={owner as Agent} 
              isOwner={true} 
              onClick={() => setSelectedAgent(owner as Agent)} 
            />
          </div>

          {/* Agents Row */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {agents.map((agent, index) => (
              <div 
                key={agent.id} 
                className="animate-float"
                style={{ animationDelay: `${index * 0.3}s` }}
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
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <span>+</span> Add Agent
            </button>
            <button 
              onClick={fetchData}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <AddAgentModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddAgent}
        />
      )}

      {/* Request Sent Toast */}
      {requestSent && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          ✓ Request sent! Your main agent will handle provisioning.
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-slate-600 text-sm">
        <p>Powered by Clawdbot 🦞</p>
      </footer>
    </div>
  )
}
