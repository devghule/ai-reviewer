# ADR-001 — Local First Architecture

## Status

Accepted

---

## Context

The system is intended for:

- private local development
- multi-repo review workflows
- personal engineering productivity

Cloud deployment introduces:

- unnecessary complexity
- infrastructure overhead
- privacy concerns

---

## Decision

The platform will operate fully locally.

Key characteristics:

- localhost deployment
- local repository access
- local storage
- local configuration
- personal API keys

---

## Consequences

### Benefits

- simpler architecture
- faster development
- better privacy
- lower cost

### Tradeoffs

- no remote collaboration
- no centralized storage
- single-machine dependency
