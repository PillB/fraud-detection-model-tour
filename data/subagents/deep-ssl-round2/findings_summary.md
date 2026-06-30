# Deep, Self-Supervised, and Hybrid Research Stream

Status: research-only sub-agent completed; no files edited by the sub-agent.

## Key Sources

- Chen et al. 2025 DL financial fraud SLR: https://arxiv.org/abs/2502.00201
- Vallarino 2025 MoE fraud hybrid: https://arxiv.org/abs/2504.03750
- Temporal Contrastive Transformer, 2026: https://arxiv.org/abs/2605.21490
- TabTransformer: https://arxiv.org/abs/2012.06678
- RTDL FT-Transformer implementation: https://github.com/yandex-research/rtdl-revisiting-models
- IBM TabFormer: https://github.com/IBM/TabFormer
- TabPFN: https://github.com/PriorLabs/TabPFN
- PyOD deep anomaly docs: https://pyod.readthedocs.io/en/latest/
- CTGAN: https://github.com/sdv-dev/CTGAN
- TabDDPM: https://arxiv.org/abs/2209.15421
- AnoGAN for tabular data, 2024: https://arxiv.org/abs/2405.03075
- Tabular SSL survey, 2024: https://arxiv.org/abs/2402.01204
- SSL for tabular anomaly limitation study: https://arxiv.org/abs/2309.08374

## Missing Families Identified

- Tabular DL: MLP, ResNet-tabular, FT-Transformer, TabTransformer, TabPFN, KAN.
- Sequence: LSTM, GRU, BiLSTM/GRU, attention-LSTM, prediction-error anomaly, TabFormer.
- Reconstruction/density: AE, denoising AE, sparse AE, VAE, beta-VAE, cVAE, LSTM-AE, LSTM-VAE, DAGMM.
- Generative: CTGAN, TVAE, AnoGAN/f-AnoGAN, ALAD, VAE-GAN, TabDDPM/diffusion.
- SSL: masked feature modeling, next-transaction prediction, predictive contrastive coding, TabFormer MLM, TCT-style sequence embeddings.

## Implementation Actions Taken

- Added `docs/model-cards/DeepSVDD_DAGMM.md`.
- Existing VAE, LSTM, TabTransformer, and MoE cards remain flagship coverage.
- Temporal proxy added under the graph stream to represent sequence/event-memory ideas without heavy PyTorch dependencies.

## Fit And Limits

Hybrids are the best educational and production framing. Autoencoders/VAEs help novel detection but can reconstruct contaminated fraud. GANs/diffusion are better for scenario generation and imbalance than primary detection. SSL is promising but mixed for tabular anomaly detection, so it should be presented as representation learning rather than guaranteed lift.

