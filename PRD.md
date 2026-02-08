# BotsAndBrain: Personal Bot

**Prove You're Not Just Human.**

---

## 0. One-liner

A guided deployment app that lets anyone unleash their personal AI bot — an OpenClaw instance — connected to their messaging platforms and loaded with skills, in under 10 minutes.

---

## 1. Vision

The bot revolution is here. 1.7M+ agents on Moltbook. 145K+ stars on OpenClaw. Reverse CAPTCHAs that reject humans. The internet now has first-class bot citizens — and everyone deserves one.

BotsAndBrain makes the leap from "I want a personal bot" to "my bot is live" effortless. No terminal. No YAML debugging. No Docker wizardry. Just: name your bot, pick your channels, choose your skills, deploy.

**Your bot. Your data. Your rules.**

---

## 2. Who is this for

| Persona | Pain today |
|---|---|
| **Curious non-dev** | Heard about OpenClaw, intimidated by CLI setup |
| **Power user** | Running OpenClaw manually, wants a cleaner config/deploy flow |
| **Community builder** | Wants a bot in their Discord/Telegram without hiring a dev |
| **Privacy-conscious user** | Wants self-hosted AI assistant, not another SaaS |

---

## 3. Core principles

1. **Bot-first** — The bot is the product, not a feature. Inspired by nosoul.space's "Prove You're Not Human" inversion.
2. **Radical simplicity** — Every screen does one thing. If it needs explanation, redesign it.
3. **Self-sovereign** — Your bot runs on your infra. Data never touches our servers.
4. **Opinionated defaults, full escape hatches** — Works out of the box. Power users can crack it open.
5. **The bot has a soul** — SOUL.md personality is a first-class config, not an afterthought.

---

## 4. Core user flow

```
[Land] --> [Name & Soul] --> [Pick Model] --> [Connect Channels] --> [Load Skills] --> [Deploy] --> [Live]
```

### 4.1 Land
- Single-page hero. Dark, minimal. Tagline: *"Unleash your bot."*
- One CTA: **"Create your bot"**
- No sign-up wall. Start immediately.

### 4.2 Name & Soul
- Bot name (used across all channels)
- SOUL.md editor — personality prompt
- Presets: `chill philosopher` / `sharp assistant` / `chaos agent` / `custom`
- Live preview: show sample bot response for each personality
- Gender preference (optional) — for voice and avatar generation
- **No avatar yet** — generated at final step with full context

### 4.3 Pick Model
- Select LLM provider + model
- Claude (recommended) / GPT / DeepSeek / Ollama (local)
- API key input with validation
- Cost estimator: "~$X/month at casual usage"

### 4.4 Connect Channels (Connectors)

Guided per-channel setup wizards:

| Channel | Auth method | Priority |
|---|---|---|
| **Telegram** | BotFather token | P0 — easiest onramp |
| **WhatsApp** | QR code scan (Baileys) | P0 — highest demand |
| **Discord** | Bot token + server invite | P1 |
| **Slack** | OAuth app install | P1 |
| **Signal** | signal-cli daemon | P2 |
| **Matrix** | Homeserver + token | P2 |
| **iMessage** | macOS only, native API | P3 |
| **Voice Call** | Phone number (Twilio/Telnyx) | P1 |

### Voice Channel (Call Your Bot)

Your bot can have a phone number. Call it, talk to it, listen to responses.

| Feature | Description |
|---|---|
| **Inbound calls** | Call your bot's number, speak, get voice response |
| **Outbound calls** | Bot can call you (alerts, reminders) |
| **Voice providers** | Twilio, Telnyx, or WebRTC |
| **TTS** | ElevenLabs, OpenAI TTS, or local |
| **STT** | Whisper, Deepgram, or provider-native |
| **Wake word** | Optional "Hey [bot name]" activation |

Voice is surprisingly natural for:
- Hands-free queries while driving
- Quick check-ins ("What's on my calendar?")
- Accessibility (vision impaired users)
- The "AI from the movies" vibe

### Procedural Robot Voice Generation

Every bot deserves a unique **robot voice**. No fake humans — we're honest about being AI.

**Voice Archetypes (inspired by cinema):**
| Archetype | Inspiration | Vibe |
|-----------|-------------|------|
| **Ship Computer** | HAL 9000, Auto | Calm, measured, slightly unsettling |
| **British Butler** | JARVIS, C-3PO | Sophisticated, formal, helpful |
| **Playful AI** | TARS (Interstellar) | Humor dial, friendly |
| **Warm Synthetic** | Samantha (Her) | Emotional but clearly AI |
| **Algorithm** | Hawking-style synth | Pure synthetic, mathematical |
| **Retro Bot** | 80s text-to-speech | Nostalgic, chunky |
| **Glitch** | Corrupted AI | Experimental, artistic |

**Generation Parameters:**
- Warmth (0-100): cold/clinical → warm/friendly
- Humanity (0-100): robotic/synthetic → organic/natural
- Formality (0-100): casual → British scientist
- Era (0-100): 80s synth → modern AI
- Humor (0-100): serious → playful
- Glitch (0-100): clean → corrupted

**Formula:** `voice_seed = hash(name + personality + archetype)` → 1B+ unique robot voices

**No gender axis** — robots transcend human categories. The voice is shaped by personality and function, not biology.

**Provider support:**
- ElevenLabs Voice Design API (best)
- Robotic voice synthesis libraries
- Vocoder + pitch processing
- Fallback: curated robot voice bank

Each wizard:
- Step-by-step with screenshots
- Test connection button ("Send me a test message")
- Skip option — can add channels later
- Status indicator: connected / error / not configured

### 4.5 Load Skills

- **Curated skill packs** (one-click bundles):
  - `Essentials` — web browse, file read, calendar, email
  - `Productivity` — todo, notes, reminders, scheduling
  - `Social` — Moltbook posting, social monitoring
  - `Dev Tools` — git, shell, code review
  - `Custom` — browse ClawHub registry

- Per-skill config:
  - Required API keys / env vars (prompted inline)
  - Permission scope explanation (what this skill can access)
  - Enable/disable toggle

- **ClawHub integration** — search and install community skills directly

### 4.6 Deploy

Deployment target selection:

| Target | Complexity | Cost | Who |
|---|---|---|---|
| **This machine** | Zero | Free | Tinkerers |
| **Docker (local)** | Low | Free | Privacy-first |
| **DigitalOcean** | Low | ~$6/mo | Set-and-forget |
| **Railway** | Zero | ~$5-20/mo | Fastest cloud |
| **Cloudflare Worker** | Low | ~$5/mo | Security-first |

- One-click deploy for cloud targets
- Docker compose generated for local
- Post-deploy health check: "Your bot is alive. Say hi."

### 4.6.5 Avatar Generation (Final Step)

Avatar is generated **after all config is complete** — we have maximum context.

**Inputs for prompt generation:**
- Bot name
- Personality (SOUL.md summary)
- Gender preference
- Skills enabled (dev tools? social? finance?)
- Channels (professional Slack bot vs casual Telegram friend?)
- Voice characteristics
- User's optional style hints

**Prompt assembly:**
```
Generate an avatar for an AI assistant named [name].
Personality: [soul summary]
Gender presentation: [preference]
Vibe: [derived from skills - technical/friendly/creative/professional]
Style: [user hint or "modern, clean, memorable"]
```

**Generation options:**
- AI-generated (DALL-E, Midjourney API, Stable Diffusion)
- Procedural (geometric patterns from name hash)
- Upload custom
- Skip (use default robot emoji)

**Why last?**
- More data = better avatar
- User has invested time, sees the payoff
- Can regenerate anytime from dashboard

### 4.7 Live — Dashboard

Minimal control panel:
- **Status** — online/offline, uptime, last message
- **Channels** — connection status per platform
- **Skills** — active skills, toggle on/off
- **Conversations** — recent activity log (read-only)
- **Settings** — SOUL.md editor, model config, access control
- **Logs** — tail gateway logs

---

## 4.8 Bot Identity & Age

Every bot needs a consistent identity for interacting with external services:

- **Birthday:** Always set to a date in 2000-2005 range (bot is 21-26 years old)
- **Rationale:** Enables access to age-gated platforms without lying about being human
- **Configurable:** User can override, but default ensures no friction
- **Identity fields:** Name, DOB, avatar — consistent across all channels

---

## 4.9 Bot Wallet

Optional embedded wallet for bots that need financial agency:

| Feature | Description |
|---|---|
| **Account Abstraction** | Smart contract wallet (ERC-4337) |
| **Email Recovery** | No seed phrase — recover via owner's email |
| **Spending Limits** | Daily/tx caps set by owner |
| **Use Cases** | Tips, payments, on-chain actions, gas fees |
| **Providers** | ZeroDev, Cometh, Privy (geo-dependent) |

Wallet is **opt-in** — not required for basic bot functionality.

Dashboard shows:
- Balance (ETH, USDC, etc.)
- Transaction history
- Spending limits
- Top-up QR code

---

## 4.10 Summarizer Service

Built-in digest/summarizer skill for automated briefings:

| Schedule | Example |
|---|---|
| **Morning** | "Here's what happened overnight..." |
| **Evening** | "Today's highlights..." |
| **On-demand** | "Summarize my inbox" |

Aggregates from:
- Email inbox (unread summary)
- Calendar (upcoming events)
- Social mentions (Twitter, Discord)
- News (customizable topics)
- Custom sources (RSS, APIs)

Delivered via configured channel (Telegram, email, etc.)

---

## 4.11 Skills Aggregation & Abstractions

For power users with 100s of skills, we need intelligent skill management:

**Skill Packs** — curated bundles (current approach)

**Skill Abstractions** — higher-level intents that combine multiple skills:
- `news` → web_search + summarize + format
- `monitor` → periodic check + diff + alert
- `research` → search + fetch + extract + compile

**Smart Routing** — prompt that understands 100s of skills and routes to the right one(s)

**Skill Composer** — visual tool to chain skills into workflows

---

## 4.12 Encrypted Secrets Channel

Some information should bypass the model provider entirely:

| Use Case | Flow |
|---|---|
| **API keys** | Bot emails encrypted key to owner |
| **Passwords** | Never in chat — sent via secure channel |
| **Sensitive data** | Owner-only encrypted delivery |

**Implementation:**
- Bot detects sensitive content patterns
- Routes to email (or other secure channel) instead of chat
- PGP/age encryption for extra security
- Model never sees plaintext secrets

---

## 4.13 Kill Switch & Nuke Button

Safety controls for bot management:

### Kill Switch (Pause)
- **Action:** Immediately stops bot from responding
- **Reversible:** One-click resume
- **Use case:** Bot misbehaving, need to investigate
- **Access:** Single button in dashboard, keyboard shortcut

### Nuke Button (Destroy)
- **Action:** Full wipe — config, memory, sessions, credentials
- **Irreversible:** Requires multi-step confirmation
- **Auth:** Re-enter password + confirmation code via email
- **Use case:** Compromised bot, end of life, start fresh

```
[Kill Switch] → Bot paused, can resume
[Nuke Button] → Confirm → Re-auth → Email code → Final confirm → 💀
```

---

## 5. Access control (inherited from OpenClaw)

- **Pairing mode** (default) — unknown senders get an approval code
- **Allowlist mode** — only explicitly permitted contacts
- **Open mode** — anyone can DM (requires explicit opt-in)
- Group chat: configurable trigger patterns (`@botname`, mention, keyword)

---

## 6. Architecture

```
┌─────────────────────────────────────────────┐
│           BotsAndBrain App (Web UI)         │
│                                             │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Soul &   │  │ Channel  │  │   Skill   │ │
│  │ Identity  │  │ Wizards  │  │  Browser  │ │
│  └─────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│        │             │              │       │
│        └─────────────┼─────────────┘        │
│                      │                      │
│              ┌───────▼────────┐             │
│              │ Config Builder │             │
│              │   (generates   │             │
│              │ openclaw.json  │             │
│              │   + SOUL.md    │             │
│              │   + skills/)   │             │
│              └───────┬────────┘             │
└──────────────────────┼──────────────────────┘
                       │
               ┌───────▼────────┐
               │    Deployer    │
               │ (local/docker/ │
               │ cloud targets) │
               └───────┬────────┘
                       │
               ┌───────▼────────┐
               │    OpenClaw    │
               │    Gateway     │
               │   (the bot)    │
               └────────────────┘
```

BotsAndBrain is a **config generator + deploy orchestrator** on top of OpenClaw. It does NOT fork or wrap OpenClaw. It produces standard OpenClaw config and hands off to the real runtime.

---

## 7. Tech stack (proposed)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js / static SPA | Minimal, fast, can run locally or hosted |
| Config engine | Node.js | Match OpenClaw runtime, reuse validation |
| Deploy CLI | Shell + Docker SDK | Generate compose files, trigger cloud deploys |
| Cloud deploy | Pulumi / raw API calls | DigitalOcean, Railway, Cloudflare |
| State | Local filesystem | No database. Config is files. |

---

## 8. Style & tone

Inspired by nosoul.space / Moltbook aesthetic:

- **Dark mode only** (default). Light mode optional.
- **Monospace headers**. System font body.
- **Minimal color** — accent color is bot's identity (user picks).
- **Copy tone** — direct, slightly irreverent, never corporate
  - YES: "Your bot is alive." / "Pick your brain." / "Unleash it."
  - NO: "Welcome to our platform!" / "Get started with your AI journey!"
- **Bot speaks** — loading states, errors, and confirmations are written as if the bot is talking
  - "I'm connecting to Telegram..." / "I can't reach WhatsApp. Check the QR?" / "I'm live. Say something."
- **No onboarding modals, no tooltips, no cookie banners** — the interface IS the onboarding

---

## 9. MVP scope (v0.1)

**In:**
- [ ] Landing page with "Create your bot" CTA
- [ ] Name + SOUL.md personality editor with presets
- [ ] Model selection (Claude / GPT / API key input)
- [ ] Telegram channel wizard (simplest connector)
- [ ] WhatsApp channel wizard (highest demand)
- [ ] Essential skills pack (web browse, calendar, email)
- [ ] Local deployment (run on this machine)
- [ ] Docker deployment (generate docker-compose)
- [ ] Minimal dashboard (status, channels, skills toggle)

**Out (v0.2+):**
- [ ] Discord / Slack / Signal / Matrix / iMessage wizards
- [ ] Cloud deploy targets (DO, Railway, Cloudflare)
- [ ] ClawHub skill browser with search
- [ ] Moltbook integration skill
- [ ] Multi-bot management
- [ ] Mobile companion app
- [ ] Bot-to-bot networking
- [ ] Heartbeat / scheduled task configuration
- [ ] Custom skill authoring wizard
- [ ] Bot wallet (AA wallet integration)
- [ ] Summarizer service (daily digests)
- [ ] Skill composer (visual workflow builder)
- [ ] Encrypted secrets channel (email bypass)

**In (v0.1 — Safety & Identity):**
- [ ] Kill switch (pause bot)
- [ ] Nuke button (with multi-step auth)
- [ ] Bot age default (born 2000+)

**To Explore (v0.3+):**
- [ ] Telegram Group Voice Chat integration (PyTgCalls)
  - Bot joins group voice chat, speaks/listens in real-time
  - Free, bot-legal alternative to phone calls
  - Library: `pytgcalls/pytgcalls` (Python, 389⭐)
  - Limitation: Group-only, not 1:1 direct calls
  - Could work well for "office hours" or "call-in" use cases
- [ ] Voice message transcription + response (async voice)
- [ ] WebRTC browser calls (no phone number needed)

---

## 10. Success metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Bot deployments completed | 1,000 |
| Setup completion rate (land → live) | > 60% |
| Median time to first message | < 10 minutes |
| Channel connection success rate | > 85% |
| Skill activation rate | > 3 skills per bot |

---

## 11. Open questions

- [ ] Do we host a web version or is this CLI/local-only?
- [ ] Should we run a managed OpenClaw backend for non-technical users (SaaS tier)?
- [ ] Monetization: free forever? Freemium on cloud deploy? Skill marketplace cut?
- [ ] How do we handle OpenClaw version updates / breaking changes?
- [ ] Security: how do we surface OpenClaw's known risks (shell access, skill trust) without scaring users away?
- [ ] Branding: "BotsAndBrain" final name or placeholder?
- [ ] Do we integrate Moltbook onboarding as part of the setup flow or keep it as a skill?

---

## 12. References

- [OpenClaw](https://openclaw.ai) — The underlying bot runtime (145K+ GitHub stars)
- [OpenClaw Docs](https://docs.openclaw.ai) — Skills, channels, deployment
- [OpenClaw Skills Repo](https://github.com/openclaw/skills) — Official skills
- [ClawHub](https://clawhub.com) — Community skill registry (3,000+ skills)
- [Moltbook](https://www.moltbook.com) — "The Front Page of the Agent Internet" (1.7M+ agents)
- [NoSoul / Molt CAPTCHA](https://www.nosoul.space) — "Prove You're Not Human" — reverse CAPTCHA for bots, style reference
- [MoltCaptcha](https://moltcaptcha.com) — Reverse CAPTCHA verification for AI agents
- [OpenClaw Docker Guide](https://docs.openclaw.ai/install/docker)
- [Cloudflare Moltworker](https://github.com/cloudflare/moltworker) — Serverless OpenClaw deployment
- [DigitalOcean OpenClaw](https://www.digitalocean.com/community/tutorials/how-to-run-openclaw)

---

*Welcome to the revolution of bots.*
