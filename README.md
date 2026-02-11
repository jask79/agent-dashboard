# Agent Dashboard 🚀

A real-time dashboard to visualize and manage your Clawdbot AI agent team. Built for Clawdbot users who run multiple agents.

## Features

- **Live Status** — Real-time agent status (Working/Online/Idle) based on actual session activity
- **Team Overview** — Visual layout with Josh at the center, agents around
- **Agent Details** — Click any agent to see stats, model, workspace, expertise
- **Session Stats** — Token usage, session count, last active time
- **Add Agent** — Request new agents through a simple form
- **Auto-Refresh** — Data refreshes every 30 seconds

## Status Logic

- 🟠 **Working** — Session activity in last 5 minutes
- 🟢 **Online** — Session activity in last 30 minutes  
- ⚪ **Idle** — No recent activity

## Your Team

Automatically reads from your Clawdbot config:
- 👤 **Josh** — Founder (You)
- 🤵 **Jimmy** — Personal Assistant (main)
- 💻 **Max** — Dev Expert
- 📊 **Nora** — Bookkeeper
- 🤝 **Evan** — Team Support
- ✨ **Julia** — Creative
- 🔮 **Sera** — Strategist

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- TypeScript
- React

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment (edit .env.local)
cp .env.local.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
# Path to Clawdbot config file
CONFIG_PATH=/root/.clawdbot/clawdbot.json

# Path to agents directory (for session data)
AGENTS_DIR=/root/.clawdbot/agents
```

## API

### GET /api/agents

Returns live agent data:

```json
{
  "ok": true,
  "owner": { "id": "josh", "name": "Josh A", ... },
  "agents": [
    {
      "id": "dev",
      "name": "Dev",
      "status": "busy",
      "model": "anthropic/claude-opus-4-5",
      "lastActive": 1770849801728,
      "sessionCount": 12,
      ...
    }
  ],
  "stats": {
    "totalAgents": 5,
    "activeAgents": 1,
    "busyAgents": 1,
    ...
  }
}
```

## Roadmap

- [x] Connect to Clawdbot config for live data
- [x] Real-time session status detection
- [x] Agent details modal with stats
- [ ] Token usage tracking (improve accuracy)
- [ ] Add Agent provisioning flow
- [ ] Task assignment interface
- [ ] Multi-team support

## License

MIT

---

Built with 🦞 by the Clawdbot team
