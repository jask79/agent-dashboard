import { NextResponse } from 'next/server'
import { readFile, readdir, stat } from 'fs/promises'
import { join } from 'path'

const CONFIG_PATH = process.env.CONFIG_PATH || '/root/.clawdbot/clawdbot.json'
const AGENTS_DIR = process.env.AGENTS_DIR || '/root/.clawdbot/agents'

interface GatewayAgent {
  id: string
  name?: string
  workspace?: string
  agentDir?: string
  model?: string
  tools?: {
    deny?: string[]
  }
}

interface GatewayConfig {
  agents: {
    defaults: {
      model: {
        primary: string
      }
    }
    list: GatewayAgent[]
  }
  channels?: {
    telegram?: {
      accounts?: Record<string, {
        name: string
        botToken?: string
      }>
    }
  }
}

interface SessionMeta {
  updatedAt: number
  sessionId: string
  totalTokens?: number
}

// Agent metadata (emoji, role, description) - this is the "soul" data
const agentMeta: Record<string, {
  emoji: string
  role: string
  color: string
  description: string
  expertise: string[]
}> = {
  main: {
    emoji: '🤵',
    role: 'Personal Assistant',
    color: 'from-blue-500 to-cyan-500',
    description: 'Your right hand for daily life. Calendar, reminders, research, and keeping things organized.',
    expertise: ['Scheduling', 'Research', 'Organization', 'Communication'],
  },
  bookkeeper: {
    emoji: '📊',
    role: 'Bookkeeper',
    color: 'from-emerald-500 to-green-600',
    description: 'Financial wizard handling books, reports, and keeping the numbers straight.',
    expertise: ['Bookkeeping', 'Financial Reports', 'Invoicing', 'Tax Prep'],
  },
  team: {
    emoji: '🤝',
    role: 'Team Support',
    color: 'from-rose-500 to-pink-600',
    description: 'Coordination and team operations. Keeps everyone aligned and moving forward.',
    expertise: ['Coordination', 'Project Management', 'Team Ops', 'Documentation'],
  },
  dev: {
    emoji: '💻',
    role: 'Dev Expert',
    color: 'from-violet-500 to-purple-600',
    description: 'Technical brain for code, debugging, architecture, and infrastructure.',
    expertise: ['Development', 'Debugging', 'Architecture', 'DevOps'],
  },
  julia: {
    emoji: '✨',
    role: 'Creative',
    color: 'from-pink-500 to-fuchsia-600',
    description: 'Creative mind for content, design ideas, and bringing projects to life.',
    expertise: ['Content', 'Creative', 'Writing', 'Ideas'],
  },
  sera: {
    emoji: '🔮',
    role: 'Strategist',
    color: 'from-indigo-500 to-blue-600',
    description: 'Strategic thinker for planning, analysis, and big-picture decisions.',
    expertise: ['Strategy', 'Analysis', 'Planning', 'Research'],
  },
}

async function getSessionsForAgent(agentId: string): Promise<SessionMeta[]> {
  try {
    const sessionsDir = join(AGENTS_DIR, agentId, 'sessions')
    const files = await readdir(sessionsDir)
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))
    
    const sessions: SessionMeta[] = []
    
    for (const file of jsonlFiles) {
      try {
        const filePath = join(sessionsDir, file)
        const fileStat = await stat(filePath)
        const sessionId = file.replace('.jsonl', '')
        
        // Read last few lines to estimate token usage
        const content = await readFile(filePath, 'utf-8')
        const lines = content.trim().split('\n').filter(Boolean)
        
        let totalTokens = 0
        for (const line of lines.slice(-20)) { // Last 20 messages
          try {
            const entry = JSON.parse(line)
            if (entry.usage?.totalTokens) {
              totalTokens += entry.usage.totalTokens
            }
          } catch {
            // Skip malformed lines
          }
        }
        
        sessions.push({
          updatedAt: fileStat.mtimeMs,
          sessionId,
          totalTokens,
        })
      } catch {
        // Skip files we can't read
      }
    }
    
    return sessions
  } catch {
    return []
  }
}

function getAgentStatus(sessions: SessionMeta[]): 'active' | 'busy' | 'idle' {
  if (sessions.length === 0) return 'idle'
  
  const now = Date.now()
  const FIVE_MIN = 5 * 60 * 1000
  const THIRTY_MIN = 30 * 60 * 1000

  const mostRecent = Math.max(...sessions.map(s => s.updatedAt))
  const timeSince = now - mostRecent

  if (timeSince < FIVE_MIN) return 'busy'
  if (timeSince < THIRTY_MIN) return 'active'
  return 'idle'
}

function getLastActive(sessions: SessionMeta[]): number | null {
  if (sessions.length === 0) return null
  return Math.max(...sessions.map(s => s.updatedAt))
}

function getTotalTokens(sessions: SessionMeta[]): number {
  return sessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0)
}

export async function GET() {
  try {
    // Read config file directly
    const configRaw = await readFile(CONFIG_PATH, 'utf-8')
    const config: GatewayConfig = JSON.parse(configRaw)

    // Get list of agent directories
    const agentDirs = await readdir(AGENTS_DIR)

    // Build agent list from config and filesystem
    const agents = await Promise.all(
      config.agents.list
        .filter(agent => agent.id !== 'main') // Owner is separate
        .map(async (agent) => {
          const meta = agentMeta[agent.id] || {
            emoji: '🤖',
            role: 'Agent',
            color: 'from-gray-500 to-gray-600',
            description: `AI agent: ${agent.name || agent.id}`,
            expertise: ['General'],
          }

          const telegramAccount = config.channels?.telegram?.accounts?.[agent.id]
          const sessions = await getSessionsForAgent(agent.id)
          
          return {
            id: agent.id,
            name: telegramAccount?.name || agent.name || agent.id,
            ...meta,
            status: getAgentStatus(sessions),
            model: agent.model || config.agents.defaults.model.primary,
            workspace: agent.workspace,
            lastActive: getLastActive(sessions),
            totalTokens: getTotalTokens(sessions),
            sessionCount: sessions.length,
            telegramBot: telegramAccount?.name,
            toolRestrictions: agent.tools?.deny || [],
          }
        })
    )

    // Owner info
    const owner = {
      id: 'josh',
      name: 'Josh A',
      role: 'Founder',
      emoji: '👤',
      color: 'from-amber-500 to-orange-600',
      description: 'The human behind the operation. Entrepreneur, builder, visionary.',
      expertise: ['Strategy', 'Vision', 'Decisions'],
      status: 'active' as const,
    }

    // Summary stats
    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      busyAgents: agents.filter(a => a.status === 'busy').length,
      idleAgents: agents.filter(a => a.status === 'idle').length,
      totalTokensAllAgents: agents.reduce((sum, a) => sum + a.totalTokens, 0),
      totalSessions: agents.reduce((sum, a) => sum + a.sessionCount, 0),
    }

    return NextResponse.json({
      ok: true,
      owner,
      agents,
      stats,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching agent data:', error)
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
