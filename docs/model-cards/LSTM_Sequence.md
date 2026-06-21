# Model Card: LSTM / Sequence Models for Behavioral Fraud Detection

## Origin
- Hochreiter & Schmidhuber (1997) LSTM.
- In fraud: Chen 2025 systematic review highlights sharp rise in LSTM use for sequential nature of fraud datasets (velocity, history deviation).
- Common in hybrids (AE-LSTM, BiLSTM+attn).

## How It Works
LSTM processes transaction sequences per user/account:

1. Input: Sequence of tx features (amount, time, merchant, KYA deltas, velocity) over time window.
2. LSTM cells: Maintain hidden state capturing long-term dependencies (e.g., normal behavior pattern).
3. Output: Final hidden state -> classification (fraud prob) or next-tx prediction error (anomaly if high).
4. Variants: BiLSTM (forward+backward), stacked, + Attention.
5. **Fraud**: Anomaly if sequence deviates from learned user history (e.g., sudden high velocity after long inactivity + new KYA link).

**Mixture**: LSTM hidden or prediction error as feature to tree model or in MoE expert.

## Pros
- Native temporal modeling: Captures drift, velocity, behavioral ramps.
- Good with logs: Treat access logs as event sequences.
- Interpretable with attention.

## Cons
- Sequential (slower inference than parallel models like Trans).
- Cold start for new users (use FE fallbacks).
- Vanishing gradients (mitigated by gates).

## Assumptions
- Fraud has temporal structure (sequences of actions).
- Sufficient history per entity.

## Limitations
- Real-time: Use truncated windows or online updates.
- KYA: Incorporate as event tokens or attributes.
- Compute: Heavier than trees.

**Fraud-Specific Fit**: Excellent for user behavior sequences + KYA events. Combine with graph for rings. Used in Chen-reported hybrids.

## Toy Example
See experiments/toy_lstm_seq.py (sklearn on lagged seq features for simplicity + functionality).

## Visualization
- Hidden state trajectory plot over time for a user.
- Attention weights on tx in seq.

## References
- Chen 2025 (LSTM growth).
- Ghrib 2024 BiLSTM examples.
- Full in sub-agent outputs (sequence-hybrid-dl).

**Status**: Tested runnable.
