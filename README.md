# AI Reviewer

Private, local, read-only AI code review platform. Reviews your code against the dev branch before you create a PR — finds architecture issues, DTO drift, edge cases, and engineering improvements.

**Completely private. No GitHub integration. No PR comments. No team notifications.**

---

## What it does

- Reviews changed files between your feature branch and `dev`
- Finds real issues: architecture violations, DTO mismatches, null handling gaps, performance problems
- Detects cross-repo impact when DTOs, enums, or API contracts change
- Learns your codebase through persistent context summaries you maintain
- Stores reviews locally for 14 days, then auto-deletes

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/devghule/ai-reviewer.git
cd ai-reviewer
npm install
```

### 2. Create `.env.local`

```
GEMINI_API_KEY=your-key        # from aistudio.google.com
OPENROUTER_API_KEY=your-key    # from openrouter.ai (free account)
```

### 3. Create `config/repos.json`

Copy from `config/repos.example.json` and fill in your local repo paths:

```json
{
  "repos": [
    {
      "name": "backend",
      "path": "C:\\Users\\YourName\\path\\to\\backend",
      "targetBranch": "dev"
    },
    {
      "name": "webapp",
      "path": "C:\\Users\\YourName\\path\\to\\webapp",
      "targetBranch": "dev"
    }
  ]
}
```

> `config/repos.json` is gitignored — it never gets committed.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Branch workflow

```
dev branch (base)
    ↓
Create feature branch from dev
    ↓
Write your code
    ↓
Open AI Reviewer → select repo → run review
    ↓
Reviewer compares feature branch against dev
    ↓
Fix findings
    ↓
Create PR → merge
```

The reviewer runs `git diff dev...HEAD` which matches exactly what your PR will show.

---

## Review modes

| Mode | Purpose | Time |
|---|---|---|
| Quick | Null handling, obvious bugs | ~1 min |
| Deep | Full pre-PR review | ~3 min |
| Cross-Repo | DTO and API drift between repos | ~4 min |
| Architecture | Layering violations, coupling | ~3 min |
| Optimization | Performance and scalability | ~3 min |
| Detailed | Everything, maximum depth | ~6 min |

---

## Context files

Context files are architecture summaries injected into every review prompt. The more accurate they are, the better the reviews.

Located in `contexts/`:
- `backend-summary.md`
- `webapp-summary.md`

### How to populate them

**Option 1 — Auto-generate (recommended first pass)**

Go to **Context** in the sidebar → select repo → click **Auto-generate from repo**. The AI scans your file tree and writes a draft. Review and correct it.

**Option 2 — Write manually**

Go to **Context** → select repo → click **Edit**. Write in markdown. Save.

### What to include

- Architecture overview (layers, patterns, frameworks)
- Key modules and what they do
- DTO and request/response shapes
- Enum values and what they mean
- API endpoint contracts
- Business rules and validation constraints
- Status lifecycles
- Cross-repo dependencies
- Known risks or fragile areas

Keep context files updated when you add major features. Outdated context means worse reviews.

---

## AI providers

**Primary**: Gemini 2.5 Pro — configured via `GEMINI_API_KEY`

**Fallback**: Best available free model on OpenRouter — configured via `OPENROUTER_API_KEY`

The fallback model is auto-discovered on startup (checked every 24 hours). It filters out China-origin models and requires at least 32k context window. See which model is active in **Settings**.

---

## Storage

Reviews are saved to `reviews/` as JSON files:
```
reviews/2026-06-14-backend-deep-abc12345.json
```

Files older than 14 days are auto-deleted on startup. The `reviews/` directory is gitignored.

---

## Privacy

- Reads repos from local filesystem only
- Never commits, pushes, or modifies any file
- Never creates PRs or GitHub checks
- Never notifies teammates
- API calls go to Gemini and OpenRouter only (your diff is sent to them for review)
- No database, no cloud storage, no external services beyond AI providers

---

## Project structure

```
ai-reviewer/
├── app/                    # Next.js pages and API routes
│   ├── page.tsx            # Home — review trigger
│   ├── results/[id]/       # Review results
│   ├── history/            # Review history
│   ├── context/            # Context management
│   ├── settings/           # Settings and model info
│   └── api/                # API routes
├── components/             # UI components
├── lib/
│   ├── ai/                 # Gemini, OpenRouter, fallback, model discovery
│   ├── git/                # Read-only git operations
│   ├── review/             # Pipeline, parser, cross-repo detector
│   ├── storage/            # Read, write, cleanup
│   ├── context/            # Load and generate context files
│   └── prompts/            # Prompt builder
├── prompts/                # Review mode prompt templates
├── contexts/               # Repo architecture summaries — edit these
├── config/
│   ├── repos.example.json  # Template — copy this
│   ├── repos.json          # Your repo paths — gitignored, create manually
│   └── curated-models.json # Preferred free OpenRouter models
├── reviews/                # Stored review JSON — gitignored, auto-managed
└── types/index.ts          # Single source of truth for all TypeScript types
```
