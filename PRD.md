# OpenClaw Deploy - PRD Scaffold

## Vision
One-click AI assistant deployment for non-technical users (like grandpa).

---

## Core Components

### 1. Frontend (Landing + Wizard)
**Files:** `index.html` (created), or React/Vue app later

**Screens:**
- Landing page ("Your AI in 1 click")
- Setup wizard (4 steps)
- Dashboard (post-deploy management)

### 2. Backend API
**Stack:** Node.js / Python FastAPI / Go

**Endpoints:**
```
POST /api/deploy
  - name: string
  - personality: string
  - channel: telegram|whatsapp|discord
  - channelToken: string
  - skills: string[]
  → Returns: { deployId, dashboardUrl, status }

GET /api/deploy/:id/status
  → Returns: { status, progress, logs }

GET /api/deploy/:id
  → Returns: { config, url, stats }

PATCH /api/deploy/:id/config
  - Update settings post-deploy
```

### 3. Cloud Orchestration
**Options (pick one):**

| Provider | Pros | Cons |
|----------|------|------|
| **Fly.io** | Simple CLI, free tier, global | Limited regions |
| **Railway** | Git-based, easy | Smaller community |
| **DigitalOcean App Platform** | Reliable, $5 droplets | More complex |
| **Render** | Free tier, easy | Cold starts |

**Deployment flow:**
```
1. User submits form
2. Backend generates openclaw.json config
3. Spin up container/VM via provider API
4. Install OpenClaw + configure
5. Return dashboard URL
```

### 4. Config Generator
Generates `openclaw.json` from wizard inputs:

```javascript
function generateConfig(input) {
  return {
    assistant: {
      name: input.name,
      avatar: "🤖"
    },
    channels: {
      telegram: input.channel === 'telegram' ? {
        token: input.channelToken
      } : undefined
    },
    skills: {
      enabled: input.skills
    },
    // Auto-create AgentMail inbox
    agentmail: {
      inbox: `${input.name.toLowerCase()}@agentmail.to`
    }
  }
}
```

### 5. Email Setup (Auto)
- Use **AgentMail API** to auto-create inbox
- No user action needed
- Each bot gets `botname@agentmail.to`

---

## MVP Scope (Week 1)

- [x] Clickable HTML prototype
- [ ] Backend: `/api/deploy` endpoint
- [ ] Fly.io integration (1 provider)
- [ ] Telegram only (1 channel)
- [ ] 3 skills: weather, search, reminders
- [ ] Basic dashboard (view logs, stop bot)

---

## Tech Stack Recommendation

```
Frontend:  HTML/JS (MVP) → Next.js (v2)
Backend:   Node.js + Express
Database:  SQLite (MVP) → Postgres (v2)
Deploy:    Fly.io API
Email:     AgentMail API
Auth:      Magic link (email)
```

---

## File Structure

```
openclaw-deploy/
├── index.html          # Wizard prototype ✓
├── PRD.md              # This file ✓
├── api/
│   ├── server.js       # Express backend
│   ├── deploy.js       # Fly.io orchestration
│   └── config.js       # Config generator
├── templates/
│   └── openclaw.json   # Base config template
└── dashboard/
    └── index.html      # Post-deploy management
```

---

## User Flow

```
[Landing] → [Name Bot] → [Pick Channel] → [Enter Token] 
    → [Pick Skills] → [Deploy...] → [Success!]
    → [Dashboard: logs, settings, stop]
```

---

## API Keys Needed

1. **Fly.io** - For deploying instances
2. **AgentMail** - For auto-creating email inboxes
3. **Anthropic/OpenAI** - User provides or you subsidize

---

## Pricing Model Ideas

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | 100 msgs/day, 1 bot, basic skills |
| Pro | $10/mo | Unlimited msgs, 5 bots, all skills |
| Business | $50/mo | Custom domain, priority support |

---

## Next Steps

1. **Try the prototype:** Open `index.html` in browser
2. **Build backend:** Start with `api/server.js`
3. **Fly.io account:** Get API token
4. **AgentMail account:** For auto email creation
