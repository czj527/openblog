# Architecture map legend

> **Archived 2026-10-27.** This map was part of the rejected prototype set. It is kept as historical evidence only; it is not the current architecture baseline. All `prototype/...` paths below refer to this archive directory.

Open `architecture-map.html` directly in a browser. The page is an interactive, dependency-free companion to this file.

## Status legend

- **Confirmed**: directly required by the user's design document or confirmed process decision.
- **Recommended**: current design default, still subject to evidence or user review.
- **Pending**: user decision or validation gate required.
- **Archived**: historical reference only.

## Reading the map

1. Inputs enter the Agent pipeline. The raw source is immutable.
2. L0/L1 can run automatically, L2 produces a diff for approval, and L3 expansion is prohibited by default.
3. The content contract is Markdown/frontmatter or MDX. Git provides versioning, preview and rollback.
4. The published site has two public page families: Window for emotion and Desk for information. Workbench is a private author surface, not a visitor route.
5. Workbench holds week plans, tasks, project progress and the Agent review queue. It is not Plan and not Ops: Plan is the public read model for approved economic/life-planning snapshots; Ops stores tokens, audit events and approval records. Workbench actions leave an audit trail through Ops.
6. Plan consumes a versioned public snapshot from the independent finance project. Raw financial data never enters this repository.
7. Engagement and Ops are runtime data; Distribution contains derived outputs and is not an MVP dependency.

## Status counts

The filter buttons are recalculated from the DOM when the page loads. With the current node set the total is 21: 8 confirmed, 8 recommended, 3 pending and 2 archived. The Workbench node remains `recommended` because the synthetic D6/D7 boundary evidence is not production authentication, storage or Agent permission evidence.

## Current implementation evidence

- Implemented as design evidence: `prototype/spikes/spike-rain-glass.html`, `ia-prototype.html`, `window-prototype.html`, `desk-prototype.html`, `d4-effects-lab.html`, `d5-content-plan-lab.html`, and the composed `composed-prototype.html` entry.
- Not implemented for production: complete Window/Desk application routes, content contract tooling, Agent API, Plan snapshot renderer, Workbench authentication, private storage and real task data.
- D6/D7 evidence now includes the synthetic `workbench-prototype.html` four-view interaction and the composed Window → Desk → Workbench flow; production authentication, private storage, public/private projection, revision persistence and Agent permissions have not been validated.
- Archived: old `docs/`, old visual prototypes, old root planning files and the nested legacy site. See `D:\openblog\_archive\openblog-legacy-20261026\ARCHIVE-MANIFEST.md`.

## Design gates

- D0: information architecture and empty states.
- D1: Window visual prototype.
- D2: Desk reading prototype.
- D3: asset and theme validation.
- D4: technical, accessibility and cross-browser validation.
- D5: content, Agent and Plan dry-run.
- D6: Workbench private execution surface, review queue and public/private projection.

The architecture map is intentionally a design artifact, not an implementation contract. A node can be selected to inspect its evidence and next validation step; filtering never removes the status text from the node itself. The Workbench node is a recommended design boundary, not a shipped backend.
