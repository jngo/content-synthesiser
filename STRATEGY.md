---
name: Content Synthesizer
last_updated: 2026-07-03
---

# Content Synthesizer Strategy

## Target problem

People doing knowledge work need to turn dense or sprawling material into a usable mental model quickly. Out-of-the-box AI summaries are often too flat, too long, or require too much prompting, so it remains hard to see the central idea, the hierarchy of supporting ideas, and whether the material is worth deeper attention.

## Our approach

Content Synthesizer bets that a Minto pyramid rendered as a navigable knowledge graph is a better default synthesis format than a prose summary. By forcing complex material into a central insight, structured branches, and expandable supporting ideas, it helps users scan, understand, and explore without doing repeated prompt work.

## Who it's for

**Primary:** Knowledge workers synthesizing messy research material - They're hiring Content Synthesizer to quickly extract the core ideas, understand the hierarchy between them, and decide which parts are worth deeper attention.

## Key metrics

- **Repeat usage** - Users returning to create or inspect syntheses again after their first session; measured through product analytics.
- **Node engagement** - Share of syntheses where users expand one or more nodes; measured through `node_expand`.
- **History reuse** - Users coming back to a previous synthesis through history selection; measured through `history_select`.
- **Input format mix** - Distribution of usage across uploaded PDFs/files, pasted text, titles, URLs, and other input types; measured through synthesis-start events and input metadata.
- **Synthesis error rate** - Failed syntheses as a share of synthesis attempts; measured through `synthesis_error` against synthesis-start events.

## Tracks

### Context capture

Make it easy to bring messy source material into the product from PDFs, pasted text, URLs, titles, and longer bodies of work.

_Why it serves the approach:_ The graph can only be useful if the product can capture the real source material in the form the user already has it.

### Synthesis quality and trust

Improve whether the graph captures the true central idea, useful coverage, and a hierarchy users can rely on.

_Why it serves the approach:_ The Minto pyramid only works if users trust that the central insight and branches reflect the material rather than an elegant but unreliable summary.

### Synthesis exploration / knowledge expression

Turn the graph into a living artifact users can expand, steer, reinterpret, and present from.

_Why it serves the approach:_ The product's advantage over prose is that users can navigate and reshape ideas directly instead of re-prompting from scratch.
