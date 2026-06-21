# Coordinator: Fase 1 Research Kickoff Summary

**Date:** 2026-06-20
**Status:** Sub-agents launched. Initial web research performed. Roadmap skeleton published.

## Sub-Agents Spawned & Storage
All agents instructed to persist every piece of work (progress, papers, reflections, code sketches) into their dedicated folder under `data/subagents/`.

- `classical-anomaly-supervised/` — Isolation Forest, LOF, supervised tree models, tabular features
- `graph-temporal-gnn/` — GNNs, TGN, HTGNN, temporal dynamics for transaction graphs
- `ensembles-sota-llm/` — Stacking/hybrids, self-supervised, LLM applications for fraud
- `coordinator/` — Synthesis and aggregation (this file + future)

## Initial External Research Highlights (Direct)
From web searches (multiple results 2024-2026):
- Tree ensembles (XGBoost family) remain extremely strong for tabular fraud; frequently best or near-best in comparisons.
- Isolation Forest + Autoencoders popular unsupervised baselines; often used in hybrids.
- Graph methods: Strong growth. Curated list at safe-graph/graph-fraud-detection-papers.
- Temporal Graph Networks (TGN and variants): Multiple papers demonstrate superiority on dynamic financial data vs static GNNs (e.g. arXiv:2404.00060 and 2025 HTGNN works). Captures time-evolving behavior critical for transactions.
- Heterogeneous Temporal GNNs and memory-augmented spatio-temporal models emerging as SOTA candidates.
- Surveys (2025): Systematic DL reviews confirm shift toward graph + temporal + hybrid approaches.
- Industry: High adoption of advanced ML (83% in one 2024-25 survey). Hybrids + real-time are priorities.

## Next Immediate Actions
1. Monitor sub-agent outputs (use get subagent tools periodically).
2. Aggregate into refined roadmap.md and prepare Model Card list.
3. Identify priority 6-8 models for deep Model Cards (Fase 2).
4. Design toy data generator schema (transactions + graph relations + behavioral + labels).
5. Begin drafting first Model Cards + simple Python toys.

## Checklist Status (Fase 1 in progress)
- Research breadth: Good start (classical + graph temporal + ensembles).
- STORM + sub-agents: In use.
- All outputs saved in data/: Yes.
- Roadmap first version: Created in docs/roadmap/roadmap.md

## Notes for Future Reflection
- Need deeper specific paper deep-dives once agents return.
- Confirm best toy implementations that are simple yet representative.
- Plan visualizations early (Isolation Forest cuts, graph message passing, temporal memory).

This file will be updated as sub-agent results arrive and synthesis proceeds.
