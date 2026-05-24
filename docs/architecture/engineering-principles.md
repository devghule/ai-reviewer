# Engineering Principles

## 1. Local-First Architecture

The system must operate fully locally without mandatory cloud dependencies.

---

## 2. Read-Only Git Safety

The platform must never modify repositories automatically.

No:

- commits
- pushes
- rebases
- file modifications

Only analysis is allowed.

---

## 3. Provider Agnostic AI Layer

AI providers must remain interchangeable through abstraction contracts.

The system must support:

- Gemini
- OpenAI
- Claude
- Local LLMs

without major rewrites.

---

## 4. Structured Outputs Only

All AI responses must normalize into strict schemas before entering the UI.

Raw AI output must never directly power the dashboard.

---

## 5. Lightweight Infrastructure

Avoid unnecessary complexity.

No:

- microservices
- distributed systems
- kubernetes
- databases (unless truly required)

---

## 6. Architecture-Aware Reviews

Reviews should leverage repository summaries and contextual architecture knowledge.

---

## 7. Explicit Contracts

All modules must communicate through clearly defined schemas.

Avoid implicit data passing.

---

## 8. Progressive Complexity

Build the smallest stable version first.

Complexity should evolve only when justified.

---

## 9. Modular Isolation

Modules should remain loosely coupled and independently replaceable.

---

## 10. Deterministic Pipelines

Review execution flow should remain predictable and traceable.
