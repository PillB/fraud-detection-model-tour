# Papers and Sources: Ensembles, Self-Supervised/Semi-Supervised, LLM/Hybrid for Fraud Detection (2024-2026 Focus)

**Scope**: Curated, accurate sources for STORM research. Prioritizes peer-reviewed, arXiv, surveys, industry reports 2023-2026. Includes key older foundations. All entries verified via searches/browses. Use for citations in other notes (format: [ShortCite, Year, Venue/Link]).

**Structure**:
- Surveys & Reviews
- Ensembles & Hybrids (incl. IF+XGBoost, stacking, cascade, cost-sensitive)
- Self-Supervised & Semi-Supervised (tabular, graph)
- LLM, RAG, Agentic, Hybrid, Foundation Models
- Graph Fraud Specific (cross-ref)
- Industry/Reports
- Curated Lists & Tooling
- KYA/KYE Context & Related

Citations include: Title, Authors/Year/Venue, Link (arXiv/html/pdf preferred), Key Relevance + Excerpts/Findings. Prioritize fraud-specific (credit card, financial, transaction, AML). Note imbalance handling, real-world deployment, interpretability.

## Surveys & Reviews (SOTA 2024-2026 Trends)

1. **Chen et al. (2025)**. "Year-over-Year Developments in Financial Fraud Detection via Deep Learning: A Systematic Literature Review". arXiv:2502.00201v1 [cs.LG]. https://arxiv.org/html/2502.00201v1  
   - Kitchenham SLR, 57 studies 2019-2024. Credit card/banking dominant (public datasets like European CC). Imbalance in 48/57 papers. Preproc: SMOTE, stratified sampling for non-stationarity. Models: CNN, LSTM, Transformers. Metrics: Prec/Rec/F1/AUC-ROC. Challenges: imbalance, interpretability (XAI), ethics/privacy (GDPR). Trends: feature eng, automation. Gaps: emerging crypto/tax.  
   - Relevance: Broad DL trends; supports hybrid needs.

2. **Thivaios et al. (2026)**. "A Survey of Machine Learning and Deep Learning for Financial Fraud Detection: Architectures, Data Modalities, and Real-World Deployment Challenges". MDPI Algorithms 19(5):354. https://www.mdpi.com/1999-4893/19/5/354  
   - Cross-paradigm taxonomy: classical sup, anomaly, graph, DNN, multimodal, cost-sensitive, RL, federated, LLM-assisted. Covers data modalities (structured txn + unstructured), deployment (real-time, drift).  
   - Relevance: Directly covers ensembles, cost-sens, LLM, graph integration.

3. **Hafez et al. (2025)**. "A systematic review of AI-enhanced techniques in credit card fraud detection". Journal of Big Data, Springer. https://link.springer.com/article/10.1186/s40537-024-01048-8  
   - AI/ML/DL + meta-heuristic opt for CCFD. DL/ensembles boost accuracy via pattern ID, reduce FP.  
   - Relevance: Ensemble + DL emphasis.

4. **Other**: Feedzai "2025 AI Trends in Fraud and Financial Crime Prevention" (survey 562 pros): >50% fraud AI/deepfakes; banks use GenAI defensively. Biocatch 2024 AI Fraud Survey: banks 83% adv ML, 72% NLP, 67% DL for fin crime. Sardine (2026): LLMs/agents as "force multiplier" for layered (rules+ML+AI), not replacement.

## Ensembles & Hybrids

5. **Monteiro et al. (2025)**. "A Hybrid Machine Learning Framework for Electricity Fraud Detection: Integrating Isolation Forest and XGBoost for Real-World Utility Data". MDPI Energies. https://www.mdpi.com/1996-1073/18/23/6249  
   - IF (unsup) + XGBoost (sup). Complementary: anomaly prefilter + classification. Real utility data.

6. **Shanaa et al. (2025)**. "A Hybrid Anomaly Detection Framework Combining Supervised (XGBoost, RF) and Unsupervised (Autoencoder, Isolation Forest)". F1000Research.  
   - Multi-layer hybrid.

7. **Btoush et al. (2025)**. "Enhancing credit card fraud detection with a stacking-based ensemble model". PMC / journal. https://pmc.ncbi.nlm.nih.gov/articles/PMC12453863/  
   - Stacking DT + others for cyber fraud. Strong performance.

8. **Cheng et al. (2025)**. "FinStack-Net: Hierarchical Feature Crossing and Stacked Ensemble Learning for Financial Fraud Detection". Int. Conf. (ResearchSquare pre).  
   - Hierarchical cross-features (1st/2nd order, MI/Lasso prune) + stack LGBM/CatBoost + residual+attention DNN + LR meta + Optuna. Handles high-dim imbalance.

9. **Devarakonda et al. (2023/updated refs)**. Hybrid: IF/AE anomaly layer -> RF/XGB/LSTM sup. XGBoost high acc, LSTM recall.  
   - Classic cascade pattern common in Kaggle/ prod.

10. **Ensemble learning approaches for cost-sensitive credit card fraud detection (2025 refs)**. Cost-sensitive + bagging/boosting/stacking. Higher FN penalty. EasyEnsemble/BalanceCascade variants. SMOTE + cost-sens hybrids common.

11. **Foundational**: Isolation Forest (Liu et al. 2008). XGBoost (Chen & Guestrin 2016 KDD). Stacking (Wolpert 1992). Cost-sensitive ensembles (various 2000s, e.g., EasyEnsemble 2009).

**Kaggle/Industry**: Many "fraud-detection-ensemble-xgboost-isolation-forest" notebooks: IF for novel + XGB known. JPMorgan example (ensembles 50%+ fraud reduction).

## Self-Supervised & Semi-Supervised (Tabular/Graph)

12. **Almaraz-Rivera et al. (2025)**. "Hyphatia: A Card-Not-Present Fraud Detection System Based on Self-Supervised Tabular Learning" (IEEE Open Journal; also NeurIPS 2024 presentation). SubTab-based SSL. Outperforms XGBoost +2.14% AUROC on IEEE-CIS; detects 67.44% fraud. Time/perf + feature importance for XAI. One of first SSL tabular CCFD. https://www.computer.org/csdl/journal/oj/2025/01/11004629/26K26zcbqp2 ; ResearchGate PDF.

13. **Thimonier et al. (2024/2025)**. "T-JEPA: Augmentation-Free Self-Supervised Pretraining for Tabular Data" (OpenReview). JEPA-style latent mask reconstruction (no ad-hoc aug). Extends mask recon to latent; relevant for tabular fraud pretext. VIME (feature/mask estimation) predecessor.

14. **Costa et al. (preprint)**. "τ-JEPA" / LEVERAGING SELF SUPERVISED LEARNING FOR FRAUD DETECTION IN TABULAR DATA. Lightweight pretrain for imbalanced tabular fraud. Scalable alt to GBTs.

15. **Li et al. (2024 KDD)**. "SEFraud: Graph-based Self-Explainable Fraud Detection via Interpretative Mask Learning". arXiv:2406.11389v1. https://arxiv.org/html/2406.11389v1  
   - Het. graph transformer + learnable feat/edge masks + supervised contrastive triplet loss. +8.6% AUC / +8.5% Rec over SOTA; 10x faster expl. Self-explain (no post-hoc). Deployed ICBC production (aligns w/ experts). Addresses camouflage, imbalance, interpretability.

16. **GraphGuard (2024)**. "Contrastive Self-Supervised Learning for Credit-Card Fraud Detection in Multi-Relational Dynamic Graphs". arXiv:2407.12440. https://arxiv.org/html/2407.12440v1  
   - SSL contrastive for dynamic multi-rel txn graphs.

17. **Gong et al. (2025)**. "Fraud Detection with Semi-supervised Time-sequential Graph Representation Learning" (S-TVGAE). Semi-sup on time-seq graphs w/ limited labels.

18. **Li et al. (2025 AAAI?)**. Context-aware GNN for graph fraud w/ extremely few labels (1-5 fraud samples). Leverages "gray" samples. CGNN outperforms PC-GNN etc.

19. **General Graph SSL GAD**: Contrastive (CoLA, ANEMONE, GRADATE, Sub-CR), Generative (DOMINANT, GUIDE, AnomalyDAE), Predictive (SL-GAD). Surveys note SSL for GAD (finance fraud app). AnomalyGFM (KDD25) zero/few-shot graph foundation. CRoC (ECAI25) contrast limited sup.

20. **Li et al. (2025)** reviews graph learning fraud: unsup/semi/sup categories.

## LLM, RAG, Agentic, Hybrid, Synthetic, Foundation

21. **Singh et al. (2025)**. "Advanced Real-Time Fraud Detection Using RAG-Based LLMs". arXiv:2501.15290v1. https://arxiv.org/html/2501.15290v1  
   - RAG LLM for AI-enabled scams (fake calls, impersonation). Real-time.

22. **Mastercard (reported 2024/2025)**: RAG architecture for LLM in fraud (unstructured data). Claims significant detection rate improvements (e.g., 300% in some refs). Responsible AI focus (access ctrl).

23. **IBM (2025+)**: Ensemble predictive ML + encoder LLMs for structured + unstructured fraud. "Fraud Detection with AI: Ensemble of AI Models Improve Precision & Speed" (YouTube/tech talks). GNN + LLMs.

24. **From safe-graph curated (2025-2026)**:
   - FLAG: Fraud Detection with LLM-enhanced Graph Neural Network (KDD 2025).
   - DGP: Dual-Granularity Prompting Framework for Fraud Detection with Graph-Enhanced LLMs (AAAI 2026).
   - Can LLMs Find Fraudsters? Multi-level LLM Enhanced Graph Fraud Detection (ACM MM 2025).
   - GuARD, AuditCopilot (NeurIPS WS), OCR-APT (CCS25 logs+subgraph+LLM), LLM-Powered Text-Attributed GAD via RAG Reasoning.
   - TransactionGPT (KDD26), TREASURE (KDD26 foundation txn), PANTHER (NeurIPS25 generative pretrain seq behavior).
   - Large Language Models for Tabular Anomaly Detection (ICLR25).

25. **Sardine (2026 blog)**: "The Future Fraud Stack: Why AI Won't Replace Rules or ML". LLMs/agents force multiplier; layered defense.

26. **Agentic RAG Survey (2026)**: arXiv 2501.09136v4. Taxonomy, apps incl. finance. Evolution to autonomous agents.

27. **Synthetic data**: Implied in GenAI reports (Feedzai); used to augment rare fraud for training (adversarial too).

28. **Hybrid integration refs**: Ensemble AI (ML + LLM encoders); GNN + LLM (prompt/graph-enhanced); classical + graph + RAG. "Understanding Structured Financial Data with LLMs: A Case Study on Fraud Detection" (2025).

## Graph Fraud Curated & Related

29. **safe-graph/graph-fraud-detection-papers** (ongoing, 2026 snapshot). https://github.com/safe-graph/graph-fraud-detection-papers  
   - 100s papers + dashboard. LLM/Transformer section strong (TransactionGPT etc.). Toolbox, datasets (e.g., IEEE-CIS, real bank graphs), surveys. Local RAG chatbot for 250 papers.

30. **SEFraud, PC-GNN, CARE-GNN, GeniePath, BWGNN, GTAN** etc. (see above + repo). Camouflage handling key (fraudsters mimic).

## Industry / Deployment / Challenges

- Real-time: <100ms (e.g., hybrid ensembles in one study 28k tx/s, AUC 99.8%).
- Imbalance: 0.1% typical; focus PR-AUC, Recall@K, cost-sens, not accuracy.
- Drift/adversarial: Continuous retrain, SSL pretrain helps generalization.
- Interpretability/Reg: SHAP, self-explain (SEFraud), XAI required. Human-in-loop agentic.
- Unstructured: Logs (auth, access seq), descriptions, OSINT for enrichment.
- Privacy: Federated, anonymization (PCA in surveys).

## KYE / KYA / Structured+Unstructured

31. **KYA "Know Your Agent" emerging (2025-2026)**: Extends KYC/KYB for AI agents, intermediaries, mule orchestrators. Critical for agentic commerce/fraud (verify non-human actors, trace accountability). Refs: kyc-chain.com, vouched.id, LinkedIn industry. KYE: Know Your Employee (insider/AML risk features). KYT: transactions monitoring.  
   - In hybrids: Structured KYA/KYE as node attrs/relations in graphs; unstructured logs (agent actions) via LLM embed/RAG.

32. **Logs + text**: OCR-APT (audit logs + subgraph + LLM), access/behavior logs for seq or NLP models.

**Notes on Completeness**: This is grounded selection (not exhaustive). Update iteratively with new tool results. Cross-reference with classical-anomaly-supervised and graph-temporal-gnn subagents. For full pipelines: combine via feature fusion (embeddings), late fusion (scores), cascaded pipelines (classical -> graph -> LLM reviewer).

**Usage in Project**: Back all roadmap/model-card claims. Toy examples extensible to hybrids (e.g., sklearn IF+XGB; torch for GNN+LLM stubs).

_Last updated: Initial batch 2026-06-20. Append verified additions._
