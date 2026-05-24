# System Modules

---

# 1. Git Engine

## Responsibility

Handles:

- branch detection
- diff extraction
- changed file analysis
- repository scanning

## Rules

- Read-only operations only
- No repository mutations allowed

---

# 2. AI Engine

## Responsibility

Handles:

- AI provider execution
- retries
- fallback providers
- timeout management

---

# 3. Context Engine

## Responsibility

Handles:

- architecture summaries
- repository intelligence
- contextual injection

---

# 4. Prompt Engine

## Responsibility

Handles:

- prompt templates
- review instructions
- review mode specialization

---

# 5. Parser Engine

## Responsibility

Handles:

- AI response validation
- JSON parsing
- schema normalization

---

# 6. Review Engine

## Responsibility

Orchestrates:

- full review pipeline
- execution flow
- result aggregation

---

# 7. Storage Engine

## Responsibility

Handles:

- local persistence
- retention cleanup
- cache management

---

# 8. Dashboard Engine

## Responsibility

Handles:

- rendering findings
- filtering
- grouping
- visualization
