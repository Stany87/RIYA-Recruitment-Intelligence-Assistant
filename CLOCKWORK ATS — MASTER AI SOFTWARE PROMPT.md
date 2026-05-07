<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# CLOCKWORK ATS — MASTER AI SOFTWARE PROMPT


***

## 1. PRODUCT ANALYSIS

### Critical Weak Points

**Data ownership gap:** RIYA lives in Relevance AI (third-party). If Relevance AI changes pricing or APIs, the core intelligence layer breaks. The ATS must be architected so RIYA is swappable — an abstraction layer between the app and the AI provider is non-negotiable.

**Single-tenant thinking:** The Gemini mockups show one agency view. The current implementation plan stores `agencyName` as a string on User, not a proper tenant model. At 50 clients this becomes unmigrateable without downtime.

**No CV storage strategy:** Candidates email CVs as attachments. Where do the raw files live? The plan mentions parsing but not storage. Without a CV file store, you can't re-screen against new JDs, audit AI decisions, or show recruiters the source document.

**AI decision opacity:** RIYA scores candidates 8.5/10 but recruiters can't see *why* at a glance. The mockup shows a bullet list of strengths/gaps but there's no audit trail — if a recruiter disputes RIYA's score, there's no way to trace the reasoning back to the JD criteria.

**No duplicate detection:** A candidate can apply twice (different email, same person) and RIYA will create two separate records. No deduplication logic exists in the plan.

**Missing outbound workflow:** The pipeline ends at "Hired/Rejected" but there's no offer letter generation, contract send, or placement confirmation flow — which is where recruitment agencies make their money.

**Billing model undefined:** The plan has a "Delete account" in settings but no subscription, seat-based pricing, or usage metering. RIYA calls Reducto and Relevance AI on every application — those cost money per call and there's no mechanism to pass costs to clients.

**No webhook/event system:** When RIYA moves a candidate, there's no event emitted to notify other systems (Slack, WhatsApp, client portals). Integration surface is zero.

***

### Strategic Improvements

1. **Multi-tenant from day one** — `Agency` model as root entity, all data scoped by `agencyId`. Row-level security at DB layer.
2. **AI provider abstraction layer** — `AIService` interface with Relevance AI as the first adapter. OpenAI direct as fallback.
3. **CV file storage pipeline** — S3/R2 bucket per agency, signed URLs, stored on `Candidate` record permanently.
4. **Explainable AI scoring** — Every RIYA score stores the full JSON reasoning object: `{ score, criteriaBreakdown[], strengths[], gaps[], redFlags[], confidence }`.
5. **Event bus architecture** — Every pipeline stage change emits an event. Webhooks, Slack, email notifications all consume from this bus.
6. **Usage metering** — Track AI calls per agency per month. Tie to Stripe subscription tiers.
7. **Candidate deduplication** — Fuzzy match on name + phone + LinkedIn URL on ingest.

***

## 2. FULL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOCKWORK ATS                           │
├─────────────────┬───────────────────┬───────────────────────┤
│   Next.js 14    │   Express/Node    │   MongoDB Atlas       │
│   App Router    │   REST + WS       │   Multi-tenant        │
│   TypeScript    │   BullMQ Queues   │   + Redis Cache       │
│   Tailwind      │   JWT + RBAC      │   + Pinecone (RAG)    │
│   shadcn/ui     │   S3/R2 Storage   │   + S3/R2 Files       │
│   Framer Motion │   Stripe Billing  │                       │
└─────────────────┴───────────────────┴───────────────────────┘
                          │
              ┌───────────┴───────────┐
              │    RIYA AI LAYER      │
              │  Relevance AI Agent   │
              │  (abstracted behind   │
              │   AIService adapter)  │
              └───────────────────────┘
```


***

## 3. DATABASE DESIGN

### Collections

```typescript
// Agency (Tenant Root)
Agency {
  _id: ObjectId
  name: string
  slug: string           // unique URL slug
  logoUrl: string
  plan: 'starter' | 'growth' | 'enterprise'
  stripeCustomerId: string
  stripeSubscriptionId: string
  usageThisMonth: {
    aiScreenings: number
    emailsSent: number
    cvsParsed: number
  }
  settings: {
    riyaAgentId: string          // Relevance AI agent ID
    riyaApiKey: string           // encrypted
    notifyOnShortlist: boolean
    autoScreening: boolean
    gmailConnected: boolean
    connectedGmail: string
    sheetsId: string
  }
  createdAt: Date
}

// User (Recruiter)
User {
  _id: ObjectId
  agencyId: ObjectId     // tenant scoping
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'recruiter' | 'viewer'
  avatarUrl: string
  lastLoginAt: Date
  createdAt: Date
}

// Job
Job {
  _id: ObjectId
  agencyId: ObjectId
  createdBy: ObjectId    // User ref
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceMin: number  // years
  salaryMin: number
  salaryMax: number
  currency: string
  description: string    // full JD markdown
  requirements: string[]
  niceToHave: string[]
  status: 'draft' | 'active' | 'paused' | 'filled' | 'archived'
  riyaKnowledgeBaseId: string  // KB entry ID in Relevance AI
  applicantCount: number       // denormalized
  postedAt: Date
  closingDate: Date
  createdAt: Date
}

// Candidate
Candidate {
  _id: ObjectId
  agencyId: ObjectId
  jobId: ObjectId
  // Personal
  name: string
  email: string
  phone: string
  linkedinUrl: string
  location: string
  // CV
  cvFileKey: string      // S3/R2 key
  cvFileUrl: string      // signed URL
  cvParsedText: string   // raw extracted text
  // AI Screening
  aiScore: number        // 0-100
  aiRecommendation: 'SHORTLIST' | 'MAYBE' | 'REJECT'
  aiScreeningData: {
    criteriaBreakdown: { criterion: string; score: number; note: string }[]
    strengths: string[]
    gaps: string[]
    redFlags: string[]
    confidence: number
    modelVersion: string
    screenedAt: Date
  }
  // Pipeline
  stage: 'new_application' | 'ai_screened' | 'under_review'
         | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected'
  stageHistory: {
    stage: string
    movedBy: ObjectId    // User or 'riya_ai'
    movedAt: Date
    note: string
  }[]
  // Recruiter
  recruiterScore: number   // override
  recruiterNotes: string
  nextAction: string
  nextActionDate: Date
  // Meta
  source: 'gmail_trigger' | 'manual' | 'csv_import' | 'api'
  emailThreadId: string    // Gmail thread ID
  acknowledgedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Activity (Event Log)
Activity {
  _id: ObjectId
  agencyId: ObjectId
  entityType: 'candidate' | 'job' | 'user'
  entityId: ObjectId
  action: string          // 'stage_changed', 'email_sent', 'score_overridden'
  performedBy: ObjectId | 'riya_ai'
  metadata: Record<string, any>
  createdAt: Date
}

// Notification
Notification {
  _id: ObjectId
  agencyId: ObjectId
  userId: ObjectId
  type: string
  title: string
  body: string
  read: boolean
  link: string
  createdAt: Date
}
```


### Indexes

```
Candidate: { agencyId, jobId, stage } compound
Candidate: { agencyId, email } unique compound
Candidate: { agencyId, aiScore } for sorting
Job: { agencyId, status }
Activity: { agencyId, entityId, createdAt }
User: { agencyId, email } unique compound
```


***

## 4. UI/UX BLUEPRINT

### Design System

**Philosophy:** Precision + warmth. Clinical enough for enterprise, approachable enough for 3-person agencies. Inspired by Linear's density and Stripe's data clarity.

**Color Palette:**

```
Background:    #0F0E17  (deep space navy - sidebar)
Surface:       #1A1830  (card backgrounds)
Surface-2:     #F8F7FF  (main content area)
Border:        #2D2B45  (subtle dividers)
Accent:        #7C3AED  (primary purple - CTAs)
Accent-hover:  #6D28D9
Success:       #10B981  (SHORTLIST badge)
Warning:       #F59E0B  (MAYBE badge)
Danger:        #EF4444  (REJECT / Delete)
Info:          #3B82F6  (stage tags)
Text-primary:  #1A1A2E  (on light bg)
Text-secondary:#6B7280
Text-inverse:  #F8F7FF  (on dark bg)
```

**Typography:**

```
Font: Inter (Google Fonts)
Display:  32px / 700 / -0.02em
H1:       24px / 600 / -0.01em
H2:       20px / 600
H3:       16px / 600
Body:     14px / 400 / 0.01em
Small:    12px / 400
Mono:     JetBrains Mono (code, scores, IDs)
```

**Spacing:** 4px base grid. All spacing multiples of 4.

**Border Radius:** 8px cards, 6px inputs, 4px badges, 12px modals.

**Shadows:**

```
Subtle:  0 1px 3px rgba(0,0,0,0.08)
Card:    0 4px 16px rgba(0,0,0,0.10)
Modal:   0 20px 60px rgba(0,0,0,0.20)
```

**Motion (Framer Motion):**

- Page transitions: `opacity 0→1, y: 8→0, duration: 0.2s ease-out`
- Modal open: `scale 0.96→1, opacity 0→1, duration: 0.15s`
- Sidebar items: stagger 0.04s on mount
- Score circle: spring animation on load
- Kanban card drag: `rotate ±2deg` with shadow lift
- Toast: slide in from bottom-right

***

## 5. PAGE-BY-PAGE STRUCTURE

### `/` — Landing Page

**Layout:** Full-width marketing page. Dark hero → feature sections → pricing → CTA.

**Hero:** "Your AI Recruiter. Your Rules." — headline, sub "RIYA screens every CV, you make every decision." — two CTAs: "Start Free Trial" and "Watch Demo." Background: animated mesh gradient in navy/purple.

**Features Section:** 3-column grid. Cards with icons: "Auto-screening in seconds", "Kanban pipeline", "RIYA chat interface."

**Demo GIF/Video:** Embedded autoplay muted loop showing the pipeline board.

**Pricing:** 3 tiers — Starter (1 recruiter, 50 screenings/mo, ₹2,999/mo), Growth (5 recruiters, 500 screenings/mo, ₹9,999/mo), Enterprise (unlimited, custom).

**Footer:** Links, socials, legal.

***

### `/login` \& `/register`

**Layout:** Split screen. Left: dark navy with product screenshot/illustration + testimonial. Right: centered form on white.

**Login Form:** Email + Password + "Forgot password?" link + Submit. Google OAuth button (Phase 2).

**Register Form:** Full name, Work email, Agency name, Password, Confirm password. T\&C checkbox. Submit.

**States:** Loading spinner on submit button. Inline field validation (red border + message). Success → redirect to `/onboarding` (first time) or `/dashboard`.

***

### `/onboarding` — First-Run Setup (3 Steps)

**Step 1:** Agency profile — upload logo, confirm name, city.
**Step 2:** Connect Gmail — OAuth button → success state shows connected email.
**Step 3:** Create first job — minimal form (title, department, paste JD). Skip option.

Progress bar at top. Each step slides in from right.

***

### `/dashboard`

**Layout:** Sidebar (240px fixed) + topbar (60px) + content area.

**Sidebar:**

```
[RIYA logo + "Clockwork ATS"]
─────────────────────────────
📊 Dashboard          (active = purple bg, white text)
👤 Candidates
💼 Jobs
💬 Chat with RIYA
⚙️  Settings
─────────────────────────────
[Avatar] Jane Doe
         Logout
```

Sidebar collapses to icon-only at `<1024px`. Mobile: hamburger → full-screen overlay.

**Topbar:** Search bar (cmd+K opens command palette), notification bell (badge count), user avatar.

**Dashboard Content:**

- **Stats Row:** 4 metric cards — Candidates in Review, Shortlisted This Week, Interviews This Week, Placements This Month. Each card: large number, trend arrow (% vs last week), subtle icon.
- **Pipeline Overview:** Mini horizontal funnel chart showing candidate counts per stage.
- **Recent Activity Feed:** Last 10 activities across all jobs. Each row: avatar/icon, action text, timestamp relative ("2m ago").
- **Active Jobs:** Card grid (3 cols desktop, 2 tablet, 1 mobile). Each card: job title, dept, location, applicant count, status badge, "View Candidates" CTA.
- **RIYA Insights Panel:** Right sidebar (320px). "3 new applications screened overnight." "2 candidates scored >85 — review them?" Actionable nudges from RIYA.

***

### `/candidates`

**Layout:** Full-width table view with filter bar + toggle to Kanban.

**Filter Bar:**

- Search (name or email, debounced 300ms)
- Recommendation filter: All / SHORTLIST / MAYBE / REJECT (pill toggles)
- Job filter: dropdown of active jobs
- Stage filter: multi-select
- Date range picker
- Sort: Score ↓, Score ↑, Date ↓, Date ↑
- View toggle: Table | Kanban

**Table View:**

```
Columns: [ ] Name | Email | Job Applied For | Score | Recommendation | Stage | Date Applied | Actions
```

- Score: rendered as colored number — green >80, amber 60-79, red <60
- Recommendation: pill badge
- Stage: tag chip with stage color
- Row hover: subtle bg highlight + "View" action appears
- Bulk select: checkbox column → bulk actions bar slides up from bottom (Move Stage, Export, Delete)
- Pagination: 25/50/100 per page + page navigator
- Click row → opens Candidate Detail Drawer (right-side panel, 480px, doesn't navigate away)

**Kanban View:**

- 7 columns: New Application | AI Screened | Under Review | Shortlisted | Interview | Hired | Rejected
- Each column: header with count badge, scrollable card list, "+ Add" button
- Cards: Name, Job title, AI Score chip (green/amber/red), AI Flag ("Strong Match" / "Borderline" / "Risk")
- Drag-and-drop between columns (react-beautiful-dnd or @dnd-kit). On drop → optimistic update → API call → revert on failure.
- Column "AI Screened" has a RIYA icon ✨ indicating AI-processed

**Candidate Detail Drawer (right panel, 480px):**

- Header: Name, Job title, Stage dropdown (change stage here), close button
- Tabs: Overview | AI Analysis | Activity | Notes
- **Overview tab:** Contact info, CV preview link (opens in new tab, signed URL), date applied, source
- **AI Analysis tab:**
    - Circular score gauge (animated on open, Framer spring)
    - Recommendation badge
    - Criteria breakdown table: criterion | AI score | note
    - Strengths bulleted list (green checkmarks)
    - Gaps bulleted list (amber warnings)
    - Red Flags list (red ✕)
    - Recruiter Score Override: slider 1-10, overrides display score with "(Recruiter: X)" label
- **Activity tab:** Stage history timeline, emails sent log
- **Notes tab:** Rich text recruiter notes, save button
- **Footer actions:** "Move to Next Stage →" (purple), "Reject" (red outline), "Email Candidate" (ghost)

***

### `/jobs`

**Layout:** Header with "+ New Job" CTA + Refresh + card grid.

**Job Card:**

- Title (bold), Department chip, Location, Experience, Salary range
- Status badge: ACTIVE (green), PAUSED (amber), FILLED (blue), ARCHIVED (gray)
- Applicant count: "24 applicants"
- Posted date relative
- Actions: Edit | Pause | Delete | "View Candidates →"

**"+ New Job" Modal (multi-step):**

- Step 1: Basic info (title, dept, location, type, salary range, experience)
- Step 2: Job description (rich text editor — TipTap)
- Step 3: Requirements (tag input), Nice-to-have (tag input), closing date
- Step 4: Confirmation + "Upload to RIYA Knowledge Base" toggle (auto-syncs JD to Relevance AI KB)

**Edit Job:** Same modal pre-filled.

**Job Detail Page `/jobs/[id]`:**

- Full JD rendered as markdown
- Candidate funnel for this specific job (mini kanban stats)
- "Sync to RIYA KB" button with last-synced timestamp

***

### `/chat` — Chat with RIYA

**Layout:** Full-height chat interface. Left: conversation list. Right: active chat.

**Chat Interface:**

- RIYA avatar top center
- Messages: user right-aligned (purple bubble), RIYA left-aligned (white bubble with RIYA icon)
- Suggested prompts as pills on empty state: "Show me today's applications", "Who are the top candidates for Senior Backend role?", "Generate interview questions for Data Scientist"
- Input: text area with send button, voice input button (Phase 2)
- RIYA responses: can contain structured data — candidate cards (mini card with name/score inline), tables, bulleted lists
- Streaming text response (SSE or WebSocket)
- Copy button on RIYA messages
- "Add to Notes" action on RIYA candidate analysis responses

**RIYA Capabilities surfaced in UI:**

- Query candidates: "Who scored highest for the ML role?"
- Explain scores: "Why did RIYA reject Jana Granta?"
- Generate content: "Write interview questions for Backend role"
- Compare candidates: "Compare David vs Sarah"
- Pipeline actions: "Move Jane Smith to interview stage"

***

### `/settings`

**Tabs:** Agency Profile | Team | Connected Accounts | Notifications | Billing | Danger Zone

**Agency Profile tab:**

- Logo upload (drag-drop + click, preview instantly)
- Agency name, city, website
- Save button

**Team tab:**

- Members table: Name | Email | Role | Last Active | Actions (Change Role / Remove)
- "Invite Member" button → modal with email + role selector → sends invite email
- Pending invites section

**Connected Accounts tab:**

- Gmail: status chip (Connected / Not Connected), connect button (OAuth), disconnect button
- Google Sheets: status, connected spreadsheet ID, change button
- Relevance AI: Agent ID input, API Key input (masked), Test Connection button → green/red feedback

**Notifications tab:**

- Toggle: Email me when candidate is shortlisted
- Toggle: Email me when interview is scheduled
- Toggle: Daily summary email
- Slack webhook URL input (Phase 2)

**Billing tab:**

- Current plan card: plan name, renewal date, seats used
- Usage meter: AI screenings used / limit (progress bar)
- "Upgrade Plan" button → Stripe checkout
- Invoice history table

**Danger Zone tab:**

- "Delete Agency Account" — red outlined card, requires typing "DELETE" to confirm

***

### `/analytics` (Phase 2)

- Time-to-hire funnel
- Source attribution (which email account, which job board)
- RIYA accuracy tracking (recruiter override rate)
- Placement rate by job category

***

## 6. ENGINEERING DECISIONS

### Frontend Stack

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript (strict mode)
Styling:       Tailwind CSS v3 + shadcn/ui
Animation:     Framer Motion
Drag & Drop:   @dnd-kit/core
Rich Text:     TipTap
Charts:        Recharts
Data Fetching: TanStack Query v5
Forms:         React Hook Form + Zod
State:         Zustand (UI state) + TanStack Query (server state)
Realtime:      Socket.io client
Auth:          Custom JWT (localStorage → httpOnly cookie Phase 2)
```


### Folder Structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # DashboardLayout
│   │   ├── dashboard/page.tsx
│   │   ├── candidates/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── jobs/[id]/page.tsx
│   │   ├── chat/page.tsx
│   │   └── settings/page.tsx
│   └── page.tsx                # Landing
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── candidates/
│   │   ├── CandidateTable.tsx
│   │   ├── CandidateKanban.tsx
│   │   ├── CandidateDrawer.tsx
│   │   ├── AIAnalysisTab.tsx
│   │   └── ScoreGauge.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   └── NewJobModal.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   └── RIYAMessage.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Topbar.tsx
├── hooks/
│   ├── useCandidates.ts
│   ├── useJobs.ts
│   └── useRIYAChat.ts
├── lib/
│   ├── api.ts                  # axios instance + interceptors
│   ├── queryClient.ts
│   └── utils.ts
├── stores/
│   ├── authStore.ts
│   └── uiStore.ts
└── types/
    ├── candidate.ts
    ├── job.ts
    └── api.ts
```


### Backend Stack

```
Runtime:       Node.js 20 LTS
Framework:     Express.js
Language:      TypeScript
Auth:          JWT (access 15min + refresh 7d, httpOnly cookies)
Queue:         BullMQ + Redis (CV processing,```

