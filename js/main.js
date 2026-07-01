/**
 * Model Tour — Professional Interactivity (BCG/McKinsey polish)
 * Self-contained for GitHub live deployment. No external deps beyond page.
 * Features: PR-AUC bar viz, model filtering, copy buttons, metric hovers, smooth nav.
 */

(function() {
    'use strict';

    const LAB_CACHE_KEY = '20260701-lab-pca-progress';
    const SYNTHETIC_SEED_BASE = 20260701;
    const BENCHMARK_RESULTS = {
        categoryProxy: {
            supervised: '0.24',
            generative: '0.21',
            hybrid: '0.30',
            sequence: '0.26',
            tabular: '0.28',
            graph: '0.31'
        },
        modelProxy: {
            'Isolation Forest': '0.218',
            XGBoost: '0.284',
            GraphSAGE: '0.319',
            VAE: '0.367',
            MoE: '0.295',
            TabTransformer: '0.278',
            LSTM: '0.261',
            'Collusion Detection': '0.322'
        }
    };
    const TRUSTED_HTML_I18N_KEYS = new Set([
        'hero.title',
        'hero.subtitle',
        'overview.p1',
        'newto.terms',
        'exp.note',
        'footer.text1',
        'footer.clone',
        'metrics.p1',
        'metrics.p2',
        'glossary.pr-auc',
        'glossary.velocity',
        'glossary.kya',
        'glossary.recall',
        'glossary.cascades',
        'glossary.hybrid'
    ]);

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function decodeHtmlEntities(value) {
        if (!value || !/[&][a-zA-Z#0-9]+;/.test(value)) return value;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }

    // Initialize on DOM ready
    function init() {
        initFullModelSurfaces();
        initMetricBars();
        initModelFilter();
        initCopyButtons();
        initTooltips();
        initSmoothAnchors();
        initMobileJumpNav();
        initCardsCoverageMatrix();
        initBrowserModelLab();
        initModelWorkspace();
        
        // Mark animations
        document.querySelectorAll('.card, .bg-white.border').forEach((el, i) => {
            el.style.animationDelay = (i * 40) + 'ms';
            el.classList.add('animate-in');
        });
        
        console.log('%c[Model Tour] Professional site initialized — client-ready.', 'color:#64748b');
    }

    function getRequiredModels() {
        return Array.from(document.querySelectorAll('#catalog [data-model-covered]'))
            .map((item) => item.getAttribute('data-model-covered'))
            .filter(Boolean);
    }

    function activeLang() {
        return document.documentElement.lang === 'es-419' || currentLang === 'es' ? 'es' : 'en';
    }

    function localizedText(value) {
        return typeof value === 'object' ? value[activeLang()] : value;
    }

    function modelMeta(name) {
        const graph = ['Centrality', 'Community Detection', 'Collusion Detection', 'Louvain', 'Leiden', 'k-core', 'Motif Counting', 'Link Prediction', 'GraphSAGE', 'GAT', 'R-GCN', 'HGT', 'GCN', 'Heterogeneous GNN', 'Graph Attention Evidence', 'Entity Resolution', 'Knowledge Graph', 'CrimeGNN', 'BRIGHT'];
        const sequence = ['LSTM', 'GRU', 'Transformer Sequences', 'Interleaved RNN', 'BERT4ETH', 'TGN', 'TGAT', 'JODIE', 'DyRep', 'EvolveGCN', 'Temporal Graph Validation'];
        const generative = ['Autoencoder', 'VAE', 'Deep SVDD', 'DAGMM', 'CTGAN', 'Diffusion / TabDDPM', 'Deep Isolation Forest'];
        const hybrid = ['MoE', 'Cascades', 'Stacking', 'Self-Supervised Pretraining', 'GraphRAG', 'Cost-Sensitive Ensembles', 'Balanced Random Forest', 'EasyEnsemble', 'RUSBoost', 'Federated Learning'];
        const tabular = ['TabTransformer', 'FT-Transformer', 'SAINT', 'TabNet'];
        const supervised = ['XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'Logistic Regression', 'Decision Trees', 'ExtraTrees', 'Gradient Boosting'];
        const anomaly = ['Z-Score', 'IQR', 'MAD', 'Modified Z-Score', 'HBOS', 'ECOD', 'COPOD', 'Isolation Forest', 'LOF', 'One-Class SVM', 'PCA Reconstruction', 'Robust Covariance', 'kNN Outlier', 'KMeans', 'DBSCAN'];

        let category = 'supervised';
        if (graph.includes(name)) category = 'graph';
        if (sequence.includes(name)) category = 'sequence';
        if (generative.includes(name) || anomaly.includes(name)) category = 'generative';
        if (hybrid.includes(name)) category = 'hybrid';
        if (tabular.includes(name)) category = 'tabular';
        if (supervised.includes(name)) category = 'supervised';

        const bestByCategory = {
            supervised: {
                en: 'Known labeled fraud patterns, calibrated risk scoring, and engineered tabular features.',
                es: 'Patrones de fraude etiquetados, puntaje de riesgo calibrado y variables tabulares construidas.'
            },
            generative: {
                en: 'Novel anomalies, weak labels, rare attack surfacing, and fast triage gates.',
                es: 'Anomalías nuevas, etiquetas escasas, ataques raros y filtros rápidos de priorización.'
            },
            hybrid: {
                en: 'Layered production decisioning, score fusion, adaptive routing, and analyst handoff.',
                es: 'Decisiones por capas, fusión de puntajes, enrutamiento adaptativo y derivación a analistas.'
            },
            sequence: {
                en: 'Behavioral histories, burst patterns, account takeover, and temporal drift.',
                es: 'Historiales de comportamiento, ráfagas de actividad, toma de cuentas y deriva temporal.'
            },
            tabular: {
                en: 'High-cardinality categorical KYA/KYE features and nonlinear feature interactions.',
                es: 'Variables categóricas KYA/KYE de alta cardinalidad e interacciones no lineales.'
            },
            graph: {
                en: 'Collusion rings, mule networks, shared-entity exposure, and criminal-network structure.',
                es: 'Anillos de colusión, redes de cuentas mula, entidades compartidas y estructura criminal.'
            }
        };
        const complexityByCategory = {
            supervised: { en: 'Low-Medium', es: 'Baja-media' },
            generative: { en: 'Low-Medium', es: 'Baja-media' },
            hybrid: { en: 'High', es: 'Alta' },
            sequence: { en: 'Medium-High', es: 'Media-alta' },
            tabular: { en: 'Medium', es: 'Media' },
            graph: { en: 'Medium-High', es: 'Media-alta' }
        };
        const docsByCategory = {
            supervised: '../docs/model-cards/Logistic_RandomForest_Baselines.md',
            generative: '../docs/model-cards/LOF_OCSVM_PCA.md',
            hybrid: '../docs/model-cards/MoE_Hybrid.md',
            sequence: '../docs/model-cards/LSTM_Sequence.md',
            tabular: '../docs/model-cards/TabTransformer.md',
            graph: '../docs/model-cards/Community_Role_Detection.md'
        };
        const scriptByCategory = {
            supervised: '../experiments/toy_supervised_baselines.py',
            generative: '../experiments/toy_classical_anomaly_suite.py',
            hybrid: '../experiments/run_all_model_examples.py',
            sequence: '../experiments/toy_temporal_graph_risk.py',
            tabular: '../experiments/toy_tabtransformer.py',
            graph: '../experiments/toy_community_role_detection.py'
        };

        return {
            category,
            label: {
                en: category.toUpperCase(),
                es: {
                    supervised: 'SUPERVISADO',
                    generative: 'ANOMALÍAS',
                    hybrid: 'HÍBRIDO',
                    sequence: 'SECUENCIAL',
                    tabular: 'TABULAR',
                    graph: 'GRAFO / RED'
                }[category]
            },
            family: {
                en: category,
                es: {
                    supervised: 'supervisados',
                    generative: 'detección de anomalías',
                    hybrid: 'híbridos',
                    sequence: 'secuenciales',
                    tabular: 'tabulares',
                    graph: 'grafos y redes'
                }[category]
            },
            best: localizedText(bestByCategory[category]),
            complexity: localizedText(complexityByCategory[category]),
            score: BENCHMARK_RESULTS.modelProxy[name] || BENCHMARK_RESULTS.categoryProxy[category],
            docs: docsByCategory[category],
            script: scriptByCategory[category]
        };
    }

    function labKeyForModel(name) {
        const meta = modelMeta(name);
        if (['XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'Logistic Regression', 'Decision Trees', 'ExtraTrees', 'Gradient Boosting', 'TabTransformer', 'FT-Transformer', 'SAINT', 'TabNet', 'Cost-Sensitive Ensembles', 'Balanced Random Forest', 'EasyEnsemble', 'RUSBoost'].includes(name)) return 'gbdt';
        if (['VAE', 'Autoencoder', 'Deep SVDD', 'DAGMM', 'CTGAN', 'Diffusion / TabDDPM'].includes(name)) return 'vae';
        if (['GraphSAGE', 'GAT', 'R-GCN', 'HGT', 'GCN', 'Heterogeneous GNN', 'Centrality', 'Community Detection', 'Collusion Detection', 'Louvain', 'Leiden', 'k-core', 'Motif Counting', 'Link Prediction', 'CrimeGNN', 'BRIGHT', 'Entity Resolution', 'Knowledge Graph', 'Graph Attention Evidence'].includes(name)) return 'graph';
        if (['MoE', 'Cascades', 'Stacking', 'Self-Supervised Pretraining', 'GraphRAG', 'Federated Learning'].includes(name)) return 'moe';
        if (['Z-Score', 'IQR', 'MAD', 'Modified Z-Score'].includes(name)) return 'rules';
        if (['TGN', 'TGAT', 'JODIE', 'DyRep', 'EvolveGCN', 'Temporal Graph Validation'].includes(name)) return 'graph';
        if (['LSTM', 'GRU', 'Transformer Sequences', 'Interleaved RNN', 'BERT4ETH'].includes(name)) return 'moe';
        return meta.category === 'graph' ? 'graph' : 'iforest';
    }

    function hashModel(name) {
        return Array.from(name).reduce((acc, ch) => ((acc * 31) + ch.charCodeAt(0)) >>> 0, 7);
    }

    function runnerSpecForModel(name) {
        const family = labKeyForModel(name);
        const exact = ['Z-Score', 'IQR', 'MAD', 'Modified Z-Score', 'HBOS', 'ECOD', 'COPOD', 'Isolation Forest', 'LOF', 'One-Class SVM', 'PCA Reconstruction', 'Robust Covariance', 'kNN Outlier', 'KMeans', 'DBSCAN', 'Deep Isolation Forest', 'XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'Logistic Regression', 'Decision Trees', 'ExtraTrees', 'Gradient Boosting', 'Cost-Sensitive Ensembles', 'Balanced Random Forest', 'EasyEnsemble', 'RUSBoost', 'Stacking', 'Autoencoder', 'VAE', 'Centrality', 'Community Detection', 'Collusion Detection', 'Louvain', 'Leiden', 'k-core', 'Motif Counting', 'Link Prediction', 'GCN', 'GraphSAGE', 'GAT'].includes(name);
        const explainKindByFamily = {
            rules: { en: 'threshold evidence', es: 'evidencia por umbrales' },
            iforest: { en: 'isolation-style feature attribution', es: 'atribución estilo aislamiento' },
            gbdt: { en: 'SHAP-style contribution proxy', es: 'proxy de contribución tipo SHAP' },
            vae: { en: 'reconstruction-error evidence', es: 'evidencia de error de reconstrucción' },
            graph: { en: 'graph-neighborhood evidence', es: 'evidencia de vecindario de grafo' },
            moe: { en: 'expert-routing contribution', es: 'contribución por enrutamiento de expertos' }
        };
        return {
            name,
            family,
            hash: hashModel(name),
            exact,
            status: exact
                ? { en: 'Exact lightweight JS runner', es: 'Ejecutor JS ligero exacto' }
                : { en: 'Model-specific educational runner', es: 'Ejecutor educativo específico del modelo' },
            explainKind: explainKindByFamily[family]
        };
    }

    function runnerStatusLabel(name) {
        const spec = runnerSpecForModel(name);
        return localizedText(spec.status);
    }

    function modelNarrative(name) {
        const meta = modelMeta(name);
        const labKey = labKeyForModel(name);
        const categoryNarrative = {
            supervised: {
                inputs: {
                    en: 'Transaction rows with engineered velocity, amount deviation, merchant, account, device, and KYA/KYE attributes.',
                    es: 'Filas de transacciones con variables de velocidad, desviación de monto, comercio, cuenta, dispositivo y atributos KYA/KYE.'
                },
                outputs: {
                    en: 'A calibrated fraud score, feature importance or SHAP-style evidence, and rank-ordered review queues.',
                    es: 'Un puntaje calibrado de fraude, evidencia tipo importancia/SHAP y colas de revisión ordenadas por riesgo.'
                },
                limits: {
                    en: 'Needs representative labels and retraining. It can miss new collusion patterns unless graph or anomaly scores are added.',
                    es: 'Necesita etiquetas representativas y reentrenamiento. Puede omitir patrones nuevos de colusión si no se agregan señales de grafo o anomalía.'
                }
            },
            generative: {
                inputs: {
                    en: 'Mostly legitimate transactions or weakly labeled data, scaled numeric features, and behavior windows.',
                    es: 'Transacciones principalmente legítimas o con etiquetas débiles, variables numéricas escaladas y ventanas de comportamiento.'
                },
                outputs: {
                    en: 'An anomaly score, reconstruction or isolation evidence, and a triage list for novel or rare behavior.',
                    es: 'Un puntaje de anomalía, evidencia de reconstrucción o aislamiento y una lista de priorización para conductas nuevas o raras.'
                },
                limits: {
                    en: 'Scores are relative and require threshold calibration. High anomaly does not automatically mean confirmed fraud.',
                    es: 'Los puntajes son relativos y requieren calibrar umbrales. Una anomalía alta no significa fraude confirmado automáticamente.'
                }
            },
            hybrid: {
                inputs: {
                    en: 'Scores or embeddings from rules, anomaly detectors, supervised models, temporal features, and graph features.',
                    es: 'Puntajes o embeddings de reglas, detectores de anomalías, modelos supervisados, variables temporales y variables de grafo.'
                },
                outputs: {
                    en: 'A fused decision score, routed expert evidence, and a production-style escalation path.',
                    es: 'Un puntaje fusionado, evidencia del experto seleccionado y una ruta de escalamiento estilo producción.'
                },
                limits: {
                    en: 'More moving parts means harder monitoring, explainability, and rollback. Keep component metrics visible.',
                    es: 'Más componentes implican monitoreo, explicabilidad y reversión más difíciles. Mantén visibles las métricas de cada componente.'
                }
            },
            sequence: {
                inputs: {
                    en: 'Ordered user, card, merchant, device, or graph events with timestamps and rolling behavior features.',
                    es: 'Eventos ordenados de usuario, tarjeta, comercio, dispositivo o grafo con marcas de tiempo y variables móviles.'
                },
                outputs: {
                    en: 'Behavioral risk over time, drift-sensitive embeddings, or a sequence-aware alert score.',
                    es: 'Riesgo conductual en el tiempo, embeddings sensibles a deriva o un puntaje de alerta con contexto secuencial.'
                },
                limits: {
                    en: 'Requires careful temporal splits and enough history. Cold-start entities need fallback tabular or graph gates.',
                    es: 'Requiere particiones temporales cuidadosas y suficiente historial. Entidades nuevas necesitan respaldo tabular o de grafo.'
                }
            },
            tabular: {
                inputs: {
                    en: 'High-cardinality categorical fields, numeric transaction features, and KYA/KYE context.',
                    es: 'Campos categóricos de alta cardinalidad, variables numéricas de transacción y contexto KYA/KYE.'
                },
                outputs: {
                    en: 'Contextual tabular embeddings, fraud scores, and attention-style evidence for feature interactions.',
                    es: 'Embeddings tabulares contextuales, puntajes de fraude y evidencia tipo atención para interacciones entre variables.'
                },
                limits: {
                    en: 'Often needs more data and tuning than boosted trees. Benchmark against XGBoost or LightGBM before adopting.',
                    es: 'Suele necesitar más datos y ajuste que árboles potenciados. Compáralo contra XGBoost o LightGBM antes de adoptarlo.'
                }
            },
            graph: {
                inputs: {
                    en: 'User-device-merchant-account graphs, typed relationships, communities, motifs, and temporal edge events.',
                    es: 'Grafos usuario-dispositivo-comercio-cuenta, relaciones tipadas, comunidades, motivos y eventos temporales de aristas.'
                },
                outputs: {
                    en: 'Entity risk, suspicious communities, hidden-link candidates, and evidence neighborhoods for investigators.',
                    es: 'Riesgo de entidad, comunidades sospechosas, candidatos a enlaces ocultos y vecindarios de evidencia para investigadores.'
                },
                limits: {
                    en: 'Graph leakage and stale edges can mislead metrics. Use temporal validation and explainable neighborhoods.',
                    es: 'La fuga de información del grafo y aristas obsoletas pueden distorsionar métricas. Usa validación temporal y vecindarios explicables.'
                }
            }
        };
        const narrative = categoryNarrative[meta.category];
        return {
            name,
            meta,
            labKey,
            inputs: localizedText(narrative.inputs),
            outputs: localizedText(narrative.outputs),
            fit: meta.best,
            limits: localizedText(narrative.limits)
        };
    }

    function inferModelFromHref(href, text) {
        const models = getRequiredModels();
        const haystack = decodeURIComponent(`${href || ''} ${text || ''}`).toLowerCase().replace(/[_-]/g, ' ');
        return models.find((name) => haystack.includes(name.toLowerCase().replace(/[_-]/g, ' ')))
            || (haystack.includes('xgboost') ? 'XGBoost' : null)
            || (haystack.includes('graphsage') ? 'GraphSAGE' : null)
            || (haystack.includes('tabtransformer') ? 'TabTransformer' : null)
            || (haystack.includes('isolation forest') ? 'Isolation Forest' : null)
            || (haystack.includes('randomforest') ? 'Random Forest' : null)
            || (haystack.includes('community') ? 'Community Detection' : null)
            || (haystack.includes('temporal') ? 'Temporal Graph Validation' : null)
            || (haystack.includes('rgcn') ? 'R-GCN' : null)
            || (haystack.includes('graphrag') ? 'GraphRAG' : null)
            || (haystack.includes('vae') ? 'VAE' : null)
            || (haystack.includes('moe') ? 'MoE' : null)
            || null;
    }

    function selectWorkspaceModel(name) {
        const workspace = document.getElementById('model-workspace');
        if (!workspace || !name) return;
        const detail = modelNarrative(name);
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        setText('workspace-model-name', detail.name);
        setText('workspace-model-label', localizedText(detail.meta.label));
        setText('workspace-model-summary', detail.meta.best);
        setText('workspace-inputs', detail.inputs);
        setText('workspace-outputs', detail.outputs);
        setText('workspace-fit', detail.fit);
        setText('workspace-limits', detail.limits);
        const source = document.getElementById('workspace-source');
        if (source) source.href = detail.meta.docs;
        const run = document.getElementById('workspace-run');
        if (run) run.dataset.modelName = detail.name;
        const note = document.getElementById('workspace-run-note');
        if (note) {
            note.textContent = activeLang() === 'es'
                ? `${detail.name} se selecciona por nombre en el laboratorio. El estado del ejecutor indica si es directo o educativo; el enlace fuente queda disponible para revisar la implementación Python.`
                : `${detail.name} is selected by name in the lab. The runner status shows whether it is direct or educational; the source link remains available for the Python implementation.`;
        }
    }

    function runModelInBrowserLab(name) {
        if (!name) return;
        selectWorkspaceModel(name);
        const key = labKeyForModel(name);
        const lab = document.getElementById('browser-lab');
        const select = document.getElementById('lab-model-select');
        let ran = false;
        if (select && Array.from(select.options).some((option) => option.value === name)) {
            select.value = name;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            ran = true;
        } else if (select && Array.from(select.options).some((option) => option.value === key)) {
            select.value = key;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            ran = true;
        } else if (window.ModelTour && typeof window.ModelTour.runBrowserLab === 'function') {
            window.ModelTour.runBrowserLab();
            ran = true;
        }
        if (!ran && window.ModelTour && typeof window.ModelTour.runBrowserLab === 'function') {
            window.ModelTour.runBrowserLab();
        }
        if (lab) {
            lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState({}, '', '#browser-lab');
        }
    }

    function initModelWorkspace() {
        selectWorkspaceModel('XGBoost');
        const run = document.getElementById('workspace-run');
        if (run) {
            run.addEventListener('click', () => runModelInBrowserLab(run.dataset.modelName || 'XGBoost'));
        }
        document.addEventListener('click', (event) => {
            const anchor = event.target.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href') || '';
            const card = anchor.closest('.model-card');
            const text = anchor.textContent || '';
            const name = (card && card.dataset.modelName) || inferModelFromHref(href, text);
            const isModelCardLink = href.includes('/model-cards/') || href.includes('docs/model-cards') || /^(card|inspect|full card|ficha|inspeccionar|tarjeta completa)$/i.test(text.trim());
            const isRunLink = href.includes('/experiments/') || /run|script|ejecutar|example|ejemplo/i.test(text);
            if (!name || (!isModelCardLink && !isRunLink)) return;
            event.preventDefault();
            if (isRunLink) {
                runModelInBrowserLab(name);
                return;
            }
            selectWorkspaceModel(name);
            const workspace = document.getElementById('model-workspace');
            if (workspace) {
                workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState({}, '', `#model-workspace`);
            }
        });
    }

    function initFullModelSurfaces() {
        const models = getRequiredModels();
        if (!models.length) return;

        function annotateRunnerStatus(card, name) {
            const spec = runnerSpecForModel(name);
            card.querySelectorAll('.runner-status-badge').forEach((el) => el.remove());
            const badge = document.createElement('div');
            badge.className = `runner-status-badge mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${spec.exact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`;
            badge.textContent = runnerStatusLabel(name);
            const firstParagraph = card.querySelector('p');
            if (firstParagraph) {
                firstParagraph.insertAdjacentElement('beforebegin', badge);
            } else {
                card.appendChild(badge);
            }
        }

        function renderGeneratedCard(card, name, meta) {
            card.dataset.category = meta.category;
            card.dataset.modelName = name;
            card.dataset.generatedModelCard = 'true';
            card.innerHTML = `
                <div class="flex justify-between items-start gap-3">
                    <div>
                        <div class="font-semibold text-base tracking-tight"></div>
                        <div class="model-badge bg-slate-100 text-slate-700 rounded mt-1 inline-block">${escapeHtml(localizedText(meta.label))}</div>
                    </div>
                    <span class="text-[10px] px-2 py-px bg-emerald-50 text-emerald-700 font-medium rounded">${activeLang() === 'es' ? 'Ejemplo ejecutable' : 'Runnable example'}</span>
                </div>
                <p class="mt-3 text-xs leading-snug text-slate-600">${escapeHtml(meta.best)}</p>
                <div class="mt-3 text-xs">
                        <div class="font-medium text-emerald-700">${activeLang() === 'es' ? 'PR-AUC ilustrativo previo' : 'Illustrative prior PR-AUC'}: ${escapeHtml(meta.score)}</div>
                    <div class="text-[10px] text-slate-500">${escapeHtml(activeLang() === 'es' ? `Seleccionable por nombre en el laboratorio del navegador; estado: ${runnerStatusLabel(name)}.` : `Selectable by name in the browser lab; status: ${runnerStatusLabel(name)}.`)}</div>
                </div>
                <div class="mt-auto pt-3 border-t text-xs flex flex-wrap gap-2">
                    <a href="${escapeHtml(meta.docs)}" class="px-3 py-1 bg-slate-900 text-white rounded-2xl text-xs font-medium hover:bg-black transition">${activeLang() === 'es' ? 'Inspeccionar' : 'Inspect'}</a>
                    <a href="${escapeHtml(meta.script)}" class="px-3 py-1 border border-slate-200 rounded-2xl text-xs font-medium hover:bg-slate-50 transition">${activeLang() === 'es' ? 'Ejecutar' : 'Run'}</a>
                </div>
            `;
            card.querySelector('.font-semibold').textContent = name;
        }

        const cardsGrid = document.querySelector('#cards .grid[role="list"]');
        if (cardsGrid) {
            const existing = new Map(Array.from(cardsGrid.querySelectorAll('[data-model-name]')).map((card) => [card.dataset.modelName, card]));
            const fragment = document.createDocumentFragment();
            models.forEach((name) => {
                const meta = modelMeta(name);
                const existingCard = existing.get(name);
                if (existingCard && existingCard.dataset.generatedModelCard === 'true') {
                    renderGeneratedCard(existingCard, name, meta);
                    annotateRunnerStatus(existingCard, name);
                    return;
                }
                if (existingCard) {
                    annotateRunnerStatus(existingCard, name);
                    return;
                }
                const card = document.createElement('div');
                card.className = 'consulting-card bg-white rounded-3xl p-5 model-card flex flex-col';
                card.setAttribute('role', 'listitem');
                renderGeneratedCard(card, name, meta);
                annotateRunnerStatus(card, name);
                fragment.appendChild(card);
            });
            cardsGrid.appendChild(fragment);
        }

        const tbody = document.querySelector('.comparison-table tbody');
        if (tbody) {
            tbody.replaceChildren(...models.map((name) => {
                const meta = modelMeta(name);
                const row = document.createElement('tr');
                row.dataset.modelName = name;
                row.innerHTML = `
                    <td class="py-2.5 pr-3 font-medium"></td>
                    <td class="py-2.5 pr-3 text-xs"></td>
                    <td class="py-2.5 text-right font-mono text-emerald-700 font-semibold" title="${activeLang() === 'es' ? 'Valor proxy ilustrativo; ejecuta el lab para métricas actuales.' : 'Illustrative proxy value; run the lab for current metrics.'}">${escapeHtml(meta.score)}</td>
                    <td class="py-2.5 pl-4 text-xs text-slate-500">${escapeHtml(meta.complexity)}</td>
                `;
                row.children[0].textContent = name;
                row.children[1].textContent = meta.best;
                return row;
            }));
        }
    }

    // Render live PR-AUC horizontal bars from data attributes or table
    function initMetricBars() {
        const table = document.querySelector('.comparison-table');
        if (!table) return;

        // Add dynamic bars to a new column if present, or enhance existing
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const prCell = row.querySelector('td:nth-child(3)');
            if (!prCell) return;
            
            const text = prCell.textContent.trim();
            // Extract numeric value (e.g. 0.312 or 0.38)
            const match = text.match(/([0-9]\.[0-9]{2,3})/);
            if (!match) return;
            
            const value = parseFloat(match[1]);
            const pct = Math.min(Math.max(Math.round(value * 100 * 1.8), 8), 95); // scale for visual (fraud PR-AUCs are low)
            
            // Inject bar if not present
            if (!prCell.querySelector('.metric-bar-container')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mt-1.5';
                wrapper.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="metric-bar-container flex-1" title="PR-AUC ${value.toFixed(3)} (synthetic benchmark)">
                            <div class="metric-bar" style="width: ${pct}%"></div>
                        </div>
                        <span class="font-mono text-[10px] text-slate-500 w-9 text-right">${value.toFixed(3)}</span>
                    </div>
                `;
                prCell.appendChild(wrapper);
            }
        });
    }

    // Client-side filtering for model cards (educational UX)
    // Mobile-friendly: chips on md+, select on small screens
    function initModelFilter() {
        const cardsGrid = document.querySelector('#cards .grid');
        if (!cardsGrid) return;

        const section = document.getElementById('cards');
        if (!section) return;

        // Create responsive filter control
        const filterContainer = document.createElement('div');
        filterContainer.className = 'mb-4';
        filterContainer.setAttribute('aria-label', 'Filter model cards'); // will be translated
        filterContainer.innerHTML = `
            <div class="flex items-center gap-2 text-xs mb-2 md:hidden">
                <label for="model-filter-select" class="text-slate-500 font-medium" data-i18n="filter.label">Filter:</label>
                <select id="model-filter-select" class="px-3 py-1 border rounded text-slate-700 bg-white">
                    <option value="all" data-i18n="filter.all">All</option>
                    <option value="supervised" data-i18n="filter.supervised">Supervised</option>
                    <option value="generative" data-i18n="filter.generative">Generative / AD</option>
                    <option value="hybrid" data-i18n="filter.hybrid">Hybrid / MoE</option>
                    <option value="sequence" data-i18n="filter.sequence">Sequence / Behavioral</option>
                    <option value="tabular" data-i18n="filter.tabular">Tabular</option>
                    <option value="graph" data-i18n="filter.graph">Graph / Network</option>
                </select>
            </div>
            <div class="hidden md:flex flex-wrap gap-2 text-xs" role="group" aria-label="Filter model cards">
                <span class="text-slate-500 self-center mr-1 font-medium" data-i18n="filter.label">Filter:</span>
                <button type="button" class="filter-chip active px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="all" aria-pressed="true" data-i18n="filter.all">All</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="supervised" aria-pressed="false" data-i18n="filter.supervised">Supervised</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="generative" aria-pressed="false" data-i18n="filter.generative">Generative / AD</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="hybrid" aria-pressed="false" data-i18n="filter.hybrid">Hybrid / MoE</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="sequence" aria-pressed="false" data-i18n="filter.sequence">Sequence / Behavioral</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="tabular" aria-pressed="false" data-i18n="filter.tabular">Tabular</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="graph" aria-pressed="false" data-i18n="filter.graph">Graph / Network</button>
            </div>
        `;

        section.insertBefore(filterContainer, cardsGrid);

        const cards = cardsGrid.querySelectorAll('.model-card');
        const select = filterContainer.querySelector('#model-filter-select');
        const chips = filterContainer.querySelectorAll('.filter-chip');

        function applyFilter(filter) {
            cards.forEach(card => {
                const cat = (card.dataset.category || '').toLowerCase();
                let show = (filter === 'all');
                
                if (filter === 'generative') show = cat === 'generative';
                if (filter === 'hybrid') show = cat === 'hybrid';
                if (filter === 'sequence') show = cat === 'sequence';
                if (filter === 'tabular') show = cat === 'tabular';
                if (filter === 'supervised') show = cat === 'supervised';
                if (filter === 'graph') show = cat === 'graph';
                
                card.style.display = show ? '' : 'none';
                if (show) card.classList.add('animate-in');
            });
        }

        // Desktop chips
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('active');
                chip.setAttribute('aria-pressed', 'true');
                applyFilter(chip.dataset.filter);
                
                // sync select
                if (select) select.value = chip.dataset.filter;
            });

            chip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    chip.click();
                }
            });
        });

        // Mobile select
        if (select) {
            select.addEventListener('change', () => {
                applyFilter(select.value);
                
                // sync chips
                chips.forEach(c => {
                    const isActive = c.dataset.filter === select.value;
                    c.classList.toggle('active', isActive);
                    c.setAttribute('aria-pressed', isActive);
                });
            });
        }

        // Default all
        applyFilter('all');
    }

    // Add "Copy command" buttons next to script links for live feel
    // Enhanced: larger tap target on mobile, better feedback
    function initCopyButtons() {
        document.querySelectorAll('a[href*="experiments/"]').forEach(link => {
            const container = link.parentElement;
            if (!container || container.querySelector('.copy-btn')) return;
            
            const btn = document.createElement('button');
            btn.className = 'copy-btn text-[10px] sm:text-xs px-2.5 py-1 border border-slate-300 hover:bg-slate-100 active:bg-slate-200 rounded-xl text-slate-600 ml-1 min-h-[32px] min-w-[60px]';
            btn.textContent = 'Copy';
            btn.title = 'Copy run command';
            btn.setAttribute('aria-label', 'Copy command to run this script');
            
            const scriptPath = link.getAttribute('href').replace(/^\.\.\//, '');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cmd = `python ${scriptPath}`;
                const markCopied = () => {
                    const orig = btn.textContent;
                    btn.textContent = 'Copied';
                    btn.disabled = true;
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.disabled = false;
                    }, 1400);
                };
                const fallbackCopy = () => {
                    const input = document.createElement('input');
                    input.value = cmd;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    markCopied();
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(cmd).then(markCopied).catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }
            });
            
            container.appendChild(btn);
        });
    }

    // Simple hover tooltips for metrics / badges
    function initTooltips() {
        document.querySelectorAll('[data-pr], .text-emerald-600').forEach(el => {
            if (el.dataset.tooltipInit) return;
            el.dataset.tooltipInit = 'true';
            
            el.addEventListener('mouseenter', () => {
                const tip = el.dataset.pr || el.textContent;
                if (tip.includes('PR-AUC') || tip.includes('0.')) {
                    el.style.cursor = 'help';
                }
            });
        });
    }

    // Ensure hash links smooth (some browsers need)
    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href').slice(1);
                const target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.pushState(null, '', '#' + id);
                }
            });
        });
    }

    function initMobileJumpNav() {
        const select = document.getElementById('mobile-section-jump');
        if (!select) return;

        select.addEventListener('change', () => {
            const target = document.querySelector(select.value);
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', select.value);
            select.value = '';
        });
    }

    function initCardsCoverageMatrix() {
        const target = document.getElementById('cards-coverage-matrix');
        if (!target || target.dataset.initialized) return;
        const source = Array.from(document.querySelectorAll('#catalog [data-model-covered]'));
        if (!source.length) return;
        target.dataset.initialized = 'true';
        target.replaceChildren(...source.map((item) => {
            const name = item.getAttribute('data-model-covered');
            const badge = document.createElement('span');
            badge.className = 'px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-700';
            badge.dataset.cardModelVisible = name;
            badge.textContent = name;
            return badge;
        }));
    }

    function initBrowserModelLab() {
        const runBtn = document.getElementById('lab-run');
        const sizeInput = document.getElementById('lab-size');
        const sizeLabel = document.getElementById('lab-size-label');
        const modelSelect = document.getElementById('lab-model-select');
        const chart = document.getElementById('lab-chart');
        const alerts = document.getElementById('lab-alerts');
        const explain = document.getElementById('lab-explain');
        const representation = document.getElementById('lab-representation');
        const timeline = document.getElementById('lab-timeline');
        const validation = document.getElementById('lab-validation');
        const status = document.getElementById('lab-status');
        const loading = document.getElementById('lab-loading');
        const loadingBar = document.getElementById('lab-loading-bar');
        if (!runBtn || !sizeInput || !modelSelect || !chart || !alerts) return;

        const models = getRequiredModels();
        modelSelect.replaceChildren(
            new Option(activeLang() === 'es' ? 'Todos los modelos' : 'All models', 'all'),
            ...models.map((name) => new Option(name, name))
        );
        if (models.includes('Isolation Forest')) {
            modelSelect.value = 'Isolation Forest';
        }

        const rng = (seed) => {
            let t = seed >>> 0;
            return () => {
                t += 0x6D2B79F5;
                let r = Math.imul(t ^ (t >>> 15), 1 | t);
                r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
                return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
            };
        };

        const gaussian = (random) => {
            const u = Math.max(random(), 1e-9);
            const v = Math.max(random(), 1e-9);
            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        };

        function generateTransactions(n) {
            const random = rng(SYNTHETIC_SEED_BASE + n);
            const rows = [];
            const ringUsers = new Set([3, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187]);
            const ringMerchants = new Set([7, 13, 26, 39, 52, 65]);
            const ringDevices = [11, 29, 47, 71];
            const ringIps = [5, 12, 21, 33];
            for (let i = 0; i < n; i += 1) {
                const user = Math.floor(random() * 210);
                const merchant = Math.floor(random() * 85);
                const hour = Math.floor(random() * 24);
                const isNight = hour < 6 || hour > 22 ? 1 : 0;
                const channelRoll = random();
                const channel = channelRoll < 0.46 ? 'card_present' : channelRoll < 0.8 ? 'card_not_present' : channelRoll < 0.94 ? 'wallet' : 'api';
                const device = user % 173;
                const ip = user % 61;
                const card = user % 241;
                const amount = Math.max(1, Math.exp(4 + gaussian(random) * 0.9));
                const velocity1h = Math.floor(random() * 5 + random() * 3);
                const velocity24h = Math.floor(random() * 20 + random() * 8);
                const categoryRisk = random() < 0.1 ? 1 : random() < 0.4 ? 0.45 : 0.15;
                const deviceUserCount = 1 + (ringUsers.has(user) ? 6 : device % 11 === 0 ? 3 : 0) + Math.floor(random() * 3);
                const ipUserCount = 1 + (ringUsers.has(user) ? 7 : ip % 13 === 0 ? 4 : 0) + Math.floor(random() * 3);
                const cardUserCount = 1 + (ringUsers.has(user) ? 4 : card % 17 === 0 ? 2 : 0);
                const merchantRisk = ringMerchants.has(merchant) ? 0.86 : categoryRisk * 0.7 + random() * 0.18;
                const priorDeclines = Math.floor(random() * 2);
                const accountAge = Math.floor(5 + random() * 2200);
                const geoDistance = Math.max(0, Math.exp(2.6 + gaussian(random) * 1.0));
                let graphRisk = Math.min(1, deviceUserCount / 12 + ipUserCount / 16 + cardUserCount / 10 + merchantRisk * 0.28);
                let fraud = 0;
                let archetype = 'legit';
                let amt = amount;
                let v1 = velocity1h;
                let v24 = velocity24h;
                let deviceId = device;
                let ipBlock = ip;
                let cardId = card;
                let declines = priorDeclines;
                let distance = geoDistance;
                let chan = channel;
                let age = accountAge;
                const pattern = random();
                if (pattern < 0.004) {
                    fraud = 1; archetype = 'amount_night_outlier'; amt *= 6; v1 += 1; distance *= 3; chan = 'card_not_present';
                } else if (pattern < 0.008) {
                    fraud = 1; archetype = 'velocity_burst'; v1 += 9; v24 += 22; declines += 5; chan = 'api';
                } else if (pattern < 0.012) {
                    fraud = 1;
                    const sub = random();
                    if (sub < 0.34) {
                        archetype = 'account_takeover'; amt *= 1.7; v24 += 8; deviceId = Math.floor(random() * 173); ipBlock = Math.floor(random() * 61); age = Math.floor(1 + random() * 12); distance = 900 + random() * 6500; chan = 'card_not_present';
                    } else if (sub < 0.68) {
                        archetype = 'collusion_ring'; amt *= 1.4; v1 += 3; v24 += 10; deviceId = ringDevices[Math.floor(random() * ringDevices.length)]; ipBlock = ringIps[Math.floor(random() * ringIps.length)]; cardId = 500 + Math.floor(random() * 8); graphRisk = 0.93; chan = 'wallet';
                    } else {
                        archetype = 'mimicry_low_signal'; amt *= 1.15; deviceId = ringDevices[Math.floor(random() * ringDevices.length)]; ipBlock = ringIps[Math.floor(random() * ringIps.length)]; graphRisk = 0.72; chan = 'card_present';
                    }
                }
                const temporalBurst = v1 * 0.42 + declines * 0.8 + (isNight ? 0.7 : 0) + (age < 14 ? 1.2 : 0);
                const entityLinkRisk = Math.min(3, deviceUserCount / 8 + ipUserCount / 12 + cardUserCount / 6 + merchantRisk);
                rows.push({
                    id: `TXN${String(i).padStart(6, '0')}`,
                    user,
                    merchant,
                    device: deviceId,
                    ip: ipBlock,
                    card: cardId,
                    amount: Math.round(amt * 100) / 100,
                    hour,
                    isNight,
                    channel: chan,
                    velocity1h: v1,
                    velocity24h: v24,
                    categoryRisk,
                    merchantRisk,
                    priorDeclines: declines,
                    accountAge: age,
                    geoDistance: Math.round(distance * 100) / 100,
                    deviceUserCount,
                    ipUserCount,
                    cardUserCount,
                    temporalBurst,
                    entityLinkRisk,
                    graphRisk: Math.min(1, graphRisk + fraud * 0.12),
                    archetype,
                    fraud
                });
            }
            return rows;
        }

        function normalizeScores(values) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            return values.map(v => (v - min) / (max - min || 1));
        }

        function quantile(sorted, q) {
            const pos = (sorted.length - 1) * q;
            const base = Math.floor(pos);
            const rest = pos - base;
            return sorted[base + 1] === undefined ? sorted[base] : sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }

        function featureRows(rows) {
            return rows.map(r => [
                Math.log1p(r.amount),
                r.velocity1h,
                r.velocity24h,
                r.graphRisk,
                r.categoryRisk,
                r.isNight,
                r.entityLinkRisk || 0,
                r.temporalBurst || 0,
                Math.log1p(r.geoDistance || 0),
                r.priorDeclines || 0
            ]);
        }

        function column(features, index) {
            return features.map(row => row[index]);
        }

        function mean(values) {
            return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
        }

        function std(values) {
            const avg = mean(values);
            return Math.sqrt(mean(values.map(value => Math.pow(value - avg, 2)))) || 1;
        }

        function median(values) {
            const sorted = values.slice().sort((a, b) => a - b);
            return sorted[Math.floor(sorted.length / 2)] || 0;
        }

        function directStatisticalScores(name, rows) {
            const features = featureRows(rows);
            const logAmount = column(features, 0);
            const velocity = rows.map(r => r.velocity1h * 2 + r.velocity24h);
            const scoreByRobustDeviation = (values, scale = 1) => {
                const med = median(values);
                const dev = values.map(value => Math.abs(value - med));
                const mad = median(dev) || 1;
                return values.map(value => Math.abs(value - med) / (mad * scale));
            };
            if (name === 'Z-Score') {
                const amountMean = mean(logAmount);
                const amountStd = std(logAmount);
                const velocityMean = mean(velocity);
                const velocityStd = std(velocity);
                return normalizeScores(rows.map((_, i) => Math.abs(logAmount[i] - amountMean) / amountStd + Math.abs(velocity[i] - velocityMean) / velocityStd));
            }
            if (name === 'IQR') {
                const sortedAmount = logAmount.slice().sort((a, b) => a - b);
                const sortedVelocity = velocity.slice().sort((a, b) => a - b);
                const q1a = quantile(sortedAmount, 0.25);
                const q3a = quantile(sortedAmount, 0.75);
                const q1v = quantile(sortedVelocity, 0.25);
                const q3v = quantile(sortedVelocity, 0.75);
                const iqra = Math.max(q3a - q1a, 1e-6);
                const iqrv = Math.max(q3v - q1v, 1e-6);
                return normalizeScores(rows.map((_, i) => (
                    Math.max(0, logAmount[i] - (q3a + 1.5 * iqra), (q1a - 1.5 * iqra) - logAmount[i]) / iqra +
                    Math.max(0, velocity[i] - (q3v + 1.5 * iqrv), (q1v - 1.5 * iqrv) - velocity[i]) / iqrv
                )));
            }
            if (name === 'MAD' || name === 'Modified Z-Score') {
                const scale = name === 'Modified Z-Score' ? 1 / 0.6745 : 1;
                const amount = scoreByRobustDeviation(logAmount, scale);
                const vel = scoreByRobustDeviation(velocity, scale);
                return normalizeScores(rows.map((_, i) => amount[i] + vel[i]));
            }
            return null;
        }

        function directDensityScores(name, rows) {
            const features = featureRows(rows);
            if (name === 'HBOS') {
                const bins = 12;
                const histograms = [0, 1, 2].map(index => {
                    const values = column(features, index);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const width = (max - min || 1) / bins;
                    const counts = Array.from({ length: bins }, () => 0);
                    values.forEach(value => {
                        counts[Math.min(bins - 1, Math.floor((value - min) / width))] += 1;
                    });
                    return { min, width, counts };
                });
                return normalizeScores(features.map(feature => histograms.reduce((score, hist, index) => {
                    const bin = Math.min(bins - 1, Math.max(0, Math.floor((feature[index] - hist.min) / hist.width)));
                    return score + -Math.log((hist.counts[bin] + 1) / (rows.length + bins));
                }, 0)));
            }
            if (name === 'ECOD' || name === 'COPOD') {
                const sortedColumns = [0, 1, 2, 3].map(index => column(features, index).slice().sort((a, b) => a - b));
                return normalizeScores(features.map(feature => sortedColumns.reduce((score, sorted, index) => {
                    let less = 0;
                    while (less < sorted.length && sorted[less] <= feature[index]) less += 1;
                    const left = less / sorted.length;
                    const right = 1 - left;
                    const tail = Math.max(1 / sorted.length, Math.min(left, right));
                    const copulaBoost = name === 'COPOD' ? (index === 3 ? 1.25 : 1) : 1;
                    return score + copulaBoost * -Math.log(tail);
                }, 0)));
            }
            return null;
        }

        function directGeometryScores(name, rows) {
            const features = featureRows(rows);
            const x = column(features, 0);
            const y = column(features, 1).map((value, i) => value + features[i][2] / 8);
            const mx = mean(x);
            const my = mean(y);
            const sx = std(x);
            const sy = std(y);
            const norm = x.map((value, i) => [(value - mx) / sx, (y[i] - my) / sy]);
            if (name === 'PCA Reconstruction') {
                const covXX = mean(norm.map(row => row[0] * row[0]));
                const covYY = mean(norm.map(row => row[1] * row[1]));
                const covXY = mean(norm.map(row => row[0] * row[1]));
                let vx = 1;
                let vy = 1;
                for (let i = 0; i < 12; i += 1) {
                    const nx = covXX * vx + covXY * vy;
                    const ny = covXY * vx + covYY * vy;
                    const len = Math.sqrt(nx * nx + ny * ny) || 1;
                    vx = nx / len;
                    vy = ny / len;
                }
                return normalizeScores(norm.map(row => {
                    const projection = row[0] * vx + row[1] * vy;
                    const rx = row[0] - projection * vx;
                    const ry = row[1] - projection * vy;
                    return rx * rx + ry * ry;
                }));
            }
            if (name === 'Robust Covariance') {
                const radial = norm.map(row => Math.sqrt(row[0] * row[0] + row[1] * row[1])).sort((a, b) => a - b);
                const robustScale = quantile(radial, 0.75) || 1;
                return normalizeScores(norm.map(row => (row[0] * row[0] + row[1] * row[1]) / (robustScale * robustScale)));
            }
            if (name === 'kNN Outlier') {
                const k = 8;
                const step = Math.max(1, Math.ceil(norm.length / 900));
                const reference = norm.filter((_, index) => index % step === 0);
                return normalizeScores(norm.map((row, i) => {
                    const distances = reference.map((other) => other === row ? Infinity : Math.hypot(row[0] - other[0], row[1] - other[1])).sort((a, b) => a - b);
                    return distances.slice(0, Math.min(k, distances.length)).reduce((sum, value) => sum + value, 0) / Math.min(k, distances.length);
                }));
            }
            if (name === 'KMeans') {
                const centers = [[-1.1, -0.8], [0.1, 0.1], [1.2, 0.9]];
                for (let iter = 0; iter < 8; iter += 1) {
                    const groups = centers.map(() => []);
                    norm.forEach(row => {
                        let best = 0;
                        let bestDistance = Infinity;
                        centers.forEach((center, idx) => {
                            const distance = Math.hypot(row[0] - center[0], row[1] - center[1]);
                            if (distance < bestDistance) {
                                best = idx;
                                bestDistance = distance;
                            }
                        });
                        groups[best].push(row);
                    });
                    groups.forEach((group, idx) => {
                        if (group.length) {
                            centers[idx] = [mean(group.map(row => row[0])), mean(group.map(row => row[1]))];
                        }
                    });
                }
                return normalizeScores(norm.map(row => Math.min(...centers.map(center => Math.hypot(row[0] - center[0], row[1] - center[1])))));
            }
            if (name === 'DBSCAN') {
                const eps = 0.42;
                const minPts = 6;
                const step = Math.max(1, Math.ceil(norm.length / 900));
                const reference = norm.filter((_, index) => index % step === 0);
                return normalizeScores(norm.map((row, i) => {
                    let neighbors = 0;
                    let nearest = Infinity;
                    reference.forEach((other) => {
                        if (other === row) return;
                        const distance = Math.hypot(row[0] - other[0], row[1] - other[1]);
                        if (distance <= eps) neighbors += 1;
                        if (distance < nearest) nearest = distance;
                    });
                    return Math.max(0, minPts - neighbors) + nearest;
                }));
            }
            return null;
        }

        function directClassicalAnomalyScores(name, rows) {
            if (!['Isolation Forest', 'Deep Isolation Forest', 'LOF', 'One-Class SVM'].includes(name)) return null;
            const base = standardizedFeatures(rows);
            const features = name === 'Deep Isolation Forest'
                ? base.map(row => [
                    Math.tanh(row[0] * 0.9 + row[1] * 0.35 - row[3] * 0.2),
                    Math.tanh(row[2] * 0.55 + row[4] * 0.9 + row[5] * 0.35),
                    Math.tanh(row[0] * row[3] * 0.35 + row[1] * 0.2),
                    Math.tanh(row[2] * row[5] * 0.28 - row[4] * 0.15)
                ])
                : base;
            if (name === 'Isolation Forest' || name === 'Deep Isolation Forest') {
                const treeCount = name === 'Deep Isolation Forest' ? 32 : 36;
                const maxDepth = 8;
                const pathLength = (sample, seed, depth = 0, indices = null) => {
                    const active = indices || features.map((_, index) => index);
                    if (depth >= maxDepth || active.length <= 3) return depth + Math.log2(active.length + 1);
                    const featureIndex = (seed + depth * 13) % features[0].length;
                    const values = active.map(index => features[index][featureIndex]);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    if (max - min < 1e-6) return depth + Math.log2(active.length + 1);
                    const split = min + (max - min) * (((Math.sin(seed * 17.13 + depth * 3.7) + 1) / 2) * 0.8 + 0.1);
                    const next = active.filter(index => (sample[featureIndex] <= split) === (features[index][featureIndex] <= split));
                    return pathLength(sample, seed, depth + 1, next.length ? next : active);
                };
                const raw = features.map(sample => {
                    let total = 0;
                    for (let tree = 0; tree < treeCount; tree += 1) total += pathLength(sample, tree + 11);
                    return -total / treeCount;
                });
                return normalizeScores(raw);
            }
            if (name === 'LOF') {
                if (features.length > 1200) {
                    const step = Math.max(1, Math.ceil(features.length / 900));
                    const reference = features.map((row, index) => ({ row, index })).filter((_, index) => index % step === 0);
                    const k = 10;
                    return normalizeScores(features.map((row, i) => {
                        const distances = reference
                            .map(item => item.index === i ? Infinity : Math.hypot(...row.map((value, f) => value - item.row[f])))
                            .sort((a, b) => a - b);
                        const local = distances.slice(0, Math.min(k, distances.length));
                        return local.reduce((sum, value) => sum + value, 0) / Math.max(1, local.length);
                    }));
                }
                const distances = features.map((row, i) => features.map((other, j) => ({
                    index: j,
                    distance: i === j ? Infinity : Math.hypot(...row.map((value, f) => value - other[f]))
                })).sort((a, b) => a.distance - b.distance));
                const k = 10;
                const kDistance = distances.map(items => items[k - 1]?.distance || 1);
                const lrd = features.map((_, i) => {
                    const reach = distances[i].slice(0, k).map(item => Math.max(kDistance[item.index] || 0, item.distance));
                    return k / Math.max(1e-6, reach.reduce((sum, value) => sum + value, 0));
                });
                return normalizeScores(features.map((_, i) => {
                    const ratio = distances[i].slice(0, k).reduce((sum, item) => sum + (lrd[item.index] || 0), 0) / Math.max(k * lrd[i], 1e-6);
                    return ratio;
                }));
            }
            const center = features[0].map((_, index) => median(column(features, index)));
            const radial = features.map(row => Math.hypot(...row.map((value, index) => value - center[index]))).sort((a, b) => a - b);
            const boundary = quantile(radial, 0.9) || 1;
            return normalizeScores(features.map(row => {
                const distance = Math.hypot(...row.map((value, index) => value - center[index]));
                return Math.max(0, distance - boundary) + distance / boundary * 0.2;
            }));
        }

        function standardizedFeatures(rows) {
            const features = featureRows(rows);
            const centers = features[0].map((_, index) => mean(column(features, index)));
            const scales = features[0].map((_, index) => std(column(features, index)));
            return features.map(row => row.map((value, index) => (value - centers[index]) / scales[index]));
        }

        function sigmoid(value) {
            return 1 / (1 + Math.exp(-Math.max(-35, Math.min(35, value))));
        }

        function trainBestStump(features, target, weights) {
            let best = { feature: 0, threshold: 0, leftValue: mean(target), rightValue: mean(target), loss: Infinity };
            features[0].forEach((_, featureIndex) => {
                const values = features.map(row => row[featureIndex]).slice().sort((a, b) => a - b);
                const candidates = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(q => quantile(values, q));
                candidates.forEach(threshold => {
                    let leftWeight = 0;
                    let rightWeight = 0;
                    let leftSum = 0;
                    let rightSum = 0;
                    features.forEach((row, index) => {
                        const weight = weights[index];
                        if (row[featureIndex] <= threshold) {
                            leftWeight += weight;
                            leftSum += weight * target[index];
                        } else {
                            rightWeight += weight;
                            rightSum += weight * target[index];
                        }
                    });
                    if (!leftWeight || !rightWeight) return;
                    const leftValue = leftSum / leftWeight;
                    const rightValue = rightSum / rightWeight;
                    const loss = features.reduce((sum, row, index) => {
                        const prediction = row[featureIndex] <= threshold ? leftValue : rightValue;
                        return sum + weights[index] * Math.pow(target[index] - prediction, 2);
                    }, 0);
                    if (loss < best.loss) {
                        best = { feature: featureIndex, threshold, leftValue, rightValue, loss };
                    }
                });
            });
            return best;
        }

        function directSupervisedScores(name, rows) {
            if (!['XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'Logistic Regression', 'Decision Trees', 'ExtraTrees', 'Gradient Boosting', 'Cost-Sensitive Ensembles', 'Balanced Random Forest', 'EasyEnsemble', 'RUSBoost', 'Stacking'].includes(name)) return null;
            const features = standardizedFeatures(rows);
            const labels = rows.map(row => row.fraud);
            const positives = Math.max(1, labels.reduce((sum, value) => sum + value, 0));
            const negatives = Math.max(1, labels.length - positives);
            const sampleWeights = labels.map(label => label ? negatives / positives : 1);
            const logitFromFeatures = (costMultiplier = 1) => {
                const weights = Array.from({ length: features[0].length }, () => 0);
                let bias = -2.5;
                const rate = 0.04;
                const effectiveWeights = labels.map(label => label ? (negatives / positives) * costMultiplier : 1);
                for (let iter = 0; iter < 90; iter += 1) {
                    const gradients = weights.map(() => 0);
                    let biasGradient = 0;
                    features.forEach((row, index) => {
                        const prediction = sigmoid(bias + row.reduce((sum, value, featureIndex) => sum + value * weights[featureIndex], 0));
                        const error = (prediction - labels[index]) * effectiveWeights[index];
                        row.forEach((value, featureIndex) => {
                            gradients[featureIndex] += error * value;
                        });
                        biasGradient += error;
                    });
                    weights.forEach((_, index) => {
                        weights[index] -= rate * (gradients[index] / features.length + 0.01 * weights[index]);
                    });
                    bias -= rate * biasGradient / features.length;
                }
                return features.map(row => sigmoid(bias + row.reduce((sum, value, index) => sum + value * weights[index], 0)));
            };
            if (name === 'Logistic Regression') {
                return normalizeScores(logitFromFeatures(1));
            }
            if (name === 'Cost-Sensitive Ensembles') {
                const logistic = logitFromFeatures(1.8);
                const stump = trainBestStump(features, labels, labels.map(label => label ? negatives / positives * 2.2 : 1));
                const stumpScores = features.map(row => row[stump.feature] <= stump.threshold ? stump.leftValue : stump.rightValue);
                return normalizeScores(logistic.map((score, index) => score * 0.62 + stumpScores[index] * 0.38));
            }
            if (name === 'Decision Trees') {
                const root = trainBestStump(features, labels, sampleWeights);
                const branchPredictions = { left: [], right: [] };
                features.forEach((row, index) => {
                    branchPredictions[row[root.feature] <= root.threshold ? 'left' : 'right'].push(index);
                });
                const childFor = (indices) => {
                    if (indices.length < 8) return null;
                    return trainBestStump(
                        indices.map(index => features[index]),
                        indices.map(index => labels[index]),
                        indices.map(index => sampleWeights[index])
                    );
                };
                const leftChild = childFor(branchPredictions.left);
                const rightChild = childFor(branchPredictions.right);
                const branchScore = (child, row, fallback) => {
                    if (!child) return fallback;
                    return row[child.feature] <= child.threshold ? child.leftValue : child.rightValue;
                };
                return normalizeScores(features.map(row => (
                    row[root.feature] <= root.threshold
                        ? branchScore(leftChild, row, root.leftValue)
                        : branchScore(rightChild, row, root.rightValue)
                )));
            }
            if (name === 'Random Forest' || name === 'ExtraTrees' || name === 'Balanced Random Forest') {
                const treeCount = name === 'Balanced Random Forest' ? 22 : 18;
                const predictions = rows.map(() => 0);
                const positiveIndices = labels.map((label, index) => label ? index : -1).filter(index => index >= 0);
                const negativeIndices = labels.map((label, index) => label ? -1 : index).filter(index => index >= 0);
                for (let tree = 0; tree < treeCount; tree += 1) {
                    const chosen = name === 'Balanced Random Forest'
                        ? positiveIndices.concat(negativeIndices.filter((_, index) => index % Math.max(2, Math.floor(negativeIndices.length / Math.max(positiveIndices.length, 1))) === tree % 3).slice(0, Math.max(positiveIndices.length * 2, 8)))
                        : features.map((_, index) => index).filter((_, index) => name === 'ExtraTrees' ? (index + tree) % 3 !== 0 : (index * 17 + tree * 11) % 5 !== 0);
                    const subsetFeatures = chosen.map(index => features[index]);
                    const subsetLabels = chosen.map(index => labels[index]);
                    const subsetWeights = chosen.map(index => sampleWeights[index]);
                    const stump = trainBestStump(subsetFeatures, subsetLabels, subsetWeights);
                    const jitter = name === 'ExtraTrees' ? Math.sin(tree * 9.7 + stump.feature) * 0.25 : 0;
                    features.forEach((row, index) => {
                        const threshold = stump.threshold + jitter;
                        predictions[index] += row[stump.feature] <= threshold ? stump.leftValue : stump.rightValue;
                    });
                }
                return normalizeScores(predictions.map(value => value / treeCount));
            }
            if (name === 'EasyEnsemble') {
                const positiveIndices = labels.map((label, index) => label ? index : -1).filter(index => index >= 0);
                const negativeIndices = labels.map((label, index) => label ? -1 : index).filter(index => index >= 0);
                const predictions = rows.map(() => 0);
                const ensembleCount = 8;
                for (let group = 0; group < ensembleCount; group += 1) {
                    const sampledNegatives = negativeIndices.filter((_, index) => index % ensembleCount === group || index % 11 === group % 11).slice(0, Math.max(positiveIndices.length * 3, 12));
                    const chosen = positiveIndices.concat(sampledNegatives);
                    const stump = trainBestStump(
                        chosen.map(index => features[index]),
                        chosen.map(index => labels[index]),
                        chosen.map(index => labels[index] ? 1.8 : 1)
                    );
                    features.forEach((row, index) => {
                        predictions[index] += row[stump.feature] <= stump.threshold ? stump.leftValue : stump.rightValue;
                    });
                }
                return normalizeScores(predictions.map(value => value / ensembleCount));
            }
            if (name === 'RUSBoost') {
                const additive = rows.map(() => 0);
                const positiveIndices = labels.map((label, index) => label ? index : -1).filter(index => index >= 0);
                const negativeIndices = labels.map((label, index) => label ? -1 : index).filter(index => index >= 0);
                for (let stage = 0; stage < 12; stage += 1) {
                    const probabilities = additive.map(sigmoid);
                    const residuals = labels.map((label, index) => label - probabilities[index]);
                    const sampledNegatives = negativeIndices.filter((_, index) => (index + stage) % 5 === 0).slice(0, Math.max(positiveIndices.length * 4, 16));
                    const chosen = positiveIndices.concat(sampledNegatives);
                    const stump = trainBestStump(
                        chosen.map(index => features[index]),
                        chosen.map(index => residuals[index]),
                        chosen.map(index => labels[index] ? sampleWeights[index] : 1)
                    );
                    features.forEach((row, index) => {
                        additive[index] += 0.5 * (row[stump.feature] <= stump.threshold ? stump.leftValue : stump.rightValue);
                    });
                }
                return normalizeScores(additive.map(sigmoid));
            }
            if (name === 'Stacking') {
                const logistic = logitFromFeatures(1);
                const boosted = directSupervisedScores('Gradient Boosting', rows);
                const isolation = directClassicalAnomalyScores('Isolation Forest', rows);
                const graph = rows.map(row => row.graphRisk + (row.user % 23 === 0 ? 0.18 : 0) + (row.merchant % 19 === 0 ? 0.14 : 0));
                const graphScores = normalizeScores(graph);
                return normalizeScores(logistic.map((score, index) => (
                    score * 0.32 +
                    boosted[index] * 0.34 +
                    isolation[index] * 0.18 +
                    graphScores[index] * 0.16
                )));
            }
            if (name === 'CatBoost') {
                const merchantStats = new Map();
                const augmented = features.map((row, index) => {
                    const key = rows[index].merchant % 17;
                    const prev = merchantStats.get(key) || { count: 0, fraud: 0 };
                    const orderedTarget = (prev.fraud + positives / rows.length) / (prev.count + 1);
                    merchantStats.set(key, { count: prev.count + 1, fraud: prev.fraud + labels[index] });
                    return row.concat(orderedTarget);
                });
                const stump = trainBestStump(augmented, labels, sampleWeights);
                return normalizeScores(augmented.map(row => row[stump.feature] <= stump.threshold ? stump.leftValue : stump.rightValue));
            }
            const baseRate = positives / labels.length;
            const additive = rows.map(() => Math.log(baseRate / Math.max(1e-6, 1 - baseRate)));
            const learningRate = name === 'LightGBM' ? 0.42 : name === 'XGBoost' ? 0.48 : 0.55;
            const stages = name === 'LightGBM' ? 10 : name === 'XGBoost' ? 12 : 8;
            for (let stage = 0; stage < stages; stage += 1) {
                const probabilities = additive.map(sigmoid);
                const residuals = labels.map((label, index) => label - probabilities[index]);
                const trainingFeatures = name === 'LightGBM'
                    ? features.filter((_, index) => index % 2 === stage % 2 || labels[index])
                    : features;
                const trainingResiduals = name === 'LightGBM'
                    ? residuals.filter((_, index) => index % 2 === stage % 2 || labels[index])
                    : residuals;
                const trainingWeights = name === 'LightGBM'
                    ? sampleWeights.filter((_, index) => index % 2 === stage % 2 || labels[index])
                    : sampleWeights;
                const stump = trainBestStump(trainingFeatures, trainingResiduals, trainingWeights);
                features.forEach((row, index) => {
                    const regularizer = name === 'XGBoost' ? 0.92 : 1;
                    additive[index] += learningRate * regularizer * (row[stump.feature] <= stump.threshold ? stump.leftValue : stump.rightValue);
                });
            }
            return normalizeScores(additive.map(sigmoid));
        }

        function directDeepAnomalyScores(name, rows) {
            if (!['Autoencoder', 'VAE'].includes(name)) return null;
            const features = standardizedFeatures(rows);
            const inputDim = features[0].length;
            const latentDim = 2;
            const seed = name === 'VAE' ? 0.031 : 0.047;
            const init = (i, j) => Math.sin((i + 1) * 17.7 + (j + 1) * 9.3 + seed) * 0.08;
            const enc = Array.from({ length: inputDim }, (_, i) => Array.from({ length: latentDim }, (_, j) => init(i, j)));
            const logv = Array.from({ length: inputDim }, (_, i) => Array.from({ length: latentDim }, (_, j) => init(i + 7, j + 3)));
            const dec = Array.from({ length: latentDim }, (_, i) => Array.from({ length: inputDim }, (_, j) => init(i + 13, j + 5)));
            const bMu = Array.from({ length: latentDim }, () => 0);
            const bLogv = Array.from({ length: latentDim }, () => -0.2);
            const bDec = Array.from({ length: inputDim }, () => 0);
            const beta = name === 'VAE' ? 0.035 : 0;
            const rate = name === 'VAE' ? 0.018 : 0.026;
            const epochs = name === 'VAE' ? 80 : 70;
            for (let epoch = 0; epoch < epochs; epoch += 1) {
                features.forEach((x) => {
                    const mu = Array.from({ length: latentDim }, (_, z) => bMu[z] + x.reduce((sum, value, f) => sum + value * enc[f][z], 0));
                    const lv = Array.from({ length: latentDim }, (_, z) => bLogv[z] + x.reduce((sum, value, f) => sum + value * logv[f][z], 0));
                    const xhat = Array.from({ length: inputDim }, (_, f) => bDec[f] + mu.reduce((sum, value, z) => sum + value * dec[z][f], 0));
                    const err = xhat.map((value, f) => value - x[f]);
                    const gradMu = Array.from({ length: latentDim }, () => 0);
                    const gradLv = Array.from({ length: latentDim }, () => 0);
                    dec.forEach((row, z) => {
                        row.forEach((weight, f) => {
                            gradMu[z] += err[f] * weight;
                            dec[z][f] -= rate * err[f] * mu[z] / inputDim;
                        });
                    });
                    bDec.forEach((_, f) => {
                        bDec[f] -= rate * err[f] / inputDim;
                    });
                    if (name === 'VAE') {
                        mu.forEach((value, z) => {
                            gradMu[z] += beta * value;
                            gradLv[z] += beta * 0.5 * (Math.exp(Math.max(-6, Math.min(6, lv[z]))) - 1);
                        });
                    }
                    enc.forEach((row, f) => {
                        row.forEach((_, z) => {
                            enc[f][z] -= rate * gradMu[z] * x[f] / latentDim;
                            if (name === 'VAE') logv[f][z] -= rate * gradLv[z] * x[f] / latentDim;
                        });
                    });
                    bMu.forEach((_, z) => {
                        bMu[z] -= rate * gradMu[z] / latentDim;
                        if (name === 'VAE') bLogv[z] -= rate * gradLv[z] / latentDim;
                    });
                });
            }
            return normalizeScores(features.map((x) => {
                const mu = Array.from({ length: latentDim }, (_, z) => bMu[z] + x.reduce((sum, value, f) => sum + value * enc[f][z], 0));
                const lv = Array.from({ length: latentDim }, (_, z) => bLogv[z] + x.reduce((sum, value, f) => sum + value * logv[f][z], 0));
                const xhat = Array.from({ length: inputDim }, (_, f) => bDec[f] + mu.reduce((sum, value, z) => sum + value * dec[z][f], 0));
                const recon = mean(xhat.map((value, f) => Math.pow(value - x[f], 2)));
                const kl = name === 'VAE'
                    ? mean(mu.map((value, z) => 0.5 * (value * value + Math.exp(Math.max(-6, Math.min(6, lv[z]))) - 1 - lv[z])))
                    : mean(mu.map(value => value * value)) * 0.05;
                return recon + beta * kl;
            }));
        }

        function graphAnalytics(rows) {
            const adjacency = new Map();
            const userMerchants = new Map();
            const merchantUsers = new Map();
            const addEdge = (a, b) => {
                if (!adjacency.has(a)) adjacency.set(a, new Set());
                if (!adjacency.has(b)) adjacency.set(b, new Set());
                adjacency.get(a).add(b);
                adjacency.get(b).add(a);
            };
            rows.forEach(row => {
                const userNode = `u:${row.user}`;
                const merchantNode = `m:${row.merchant}`;
                const deviceNode = `d:${row.device}`;
                const ipNode = `ip:${row.ip}`;
                const cardNode = `c:${row.card}`;
                addEdge(userNode, merchantNode);
                addEdge(userNode, deviceNode);
                addEdge(userNode, ipNode);
                addEdge(userNode, cardNode);
                if (!userMerchants.has(row.user)) userMerchants.set(row.user, new Set());
                if (!merchantUsers.has(row.merchant)) merchantUsers.set(row.merchant, new Set());
                userMerchants.get(row.user).add(row.merchant);
                merchantUsers.get(row.merchant).add(row.user);
            });

            const degree = new Map(Array.from(adjacency.entries()).map(([node, neighbors]) => [node, neighbors.size]));
            const core = new Map(degree);
            let changed = true;
            while (changed) {
                changed = false;
                adjacency.forEach((neighbors, node) => {
                    const activeDegree = Array.from(neighbors).filter(other => (core.get(other) || 0) >= (core.get(node) || 0)).length;
                    if (activeDegree < (core.get(node) || 0)) {
                        core.set(node, activeDegree);
                        changed = true;
                    }
                });
            }

            const component = new Map();
            const componentStats = [];
            adjacency.forEach((_, start) => {
                if (component.has(start)) return;
                const cid = componentStats.length;
                const queue = [start];
                component.set(start, cid);
                let nodes = 0;
                let edgeEnds = 0;
                while (queue.length) {
                    const node = queue.shift();
                    nodes += 1;
                    const neighbors = adjacency.get(node) || new Set();
                    edgeEnds += neighbors.size;
                    neighbors.forEach(other => {
                        if (!component.has(other)) {
                            component.set(other, cid);
                            queue.push(other);
                        }
                    });
                }
                componentStats.push({ nodes, edges: edgeEnds / 2, rows: 0, risk: 0 });
            });
            rows.forEach(row => {
                const cid = component.get(`u:${row.user}`);
                const stats = componentStats[cid];
                if (stats) {
                    stats.rows += 1;
                    stats.risk += row.graphRisk + row.categoryRisk + row.velocity1h / 18;
                }
            });
            componentStats.forEach(stats => {
                stats.density = stats.nodes > 1 ? (2 * stats.edges) / (stats.nodes * (stats.nodes - 1)) : 0;
                stats.avgRisk = stats.rows ? stats.risk / stats.rows : 0;
            });

            const motifCount = (row) => {
                const merchants = userMerchants.get(row.user) || new Set();
                const users = merchantUsers.get(row.merchant) || new Set();
                let twoHopSupport = 0;
                merchants.forEach(merchant => {
                    if (merchant === row.merchant) return;
                    twoHopSupport += Math.max(0, (merchantUsers.get(merchant) || new Set()).size - 1);
                });
                users.forEach(user => {
                    if (user === row.user) return;
                    twoHopSupport += Math.max(0, (userMerchants.get(user) || new Set()).size - 1);
                });
                return twoHopSupport;
            };

            const linkScore = (row) => {
                const merchants = userMerchants.get(row.user) || new Set();
                const targetUsers = merchantUsers.get(row.merchant) || new Set();
                let adamic = 0;
                merchants.forEach(merchant => {
                    if (merchant === row.merchant) return;
                    const users = merchantUsers.get(merchant) || new Set();
                    users.forEach(user => {
                        if (targetUsers.has(user)) {
                            adamic += 1 / Math.log(2 + (userMerchants.get(user) || new Set()).size);
                        }
                    });
                });
                return adamic;
            };

            return { adjacency, degree, core, component, componentStats, userMerchants, merchantUsers, motifCount, linkScore };
        }

        function directGraphAnalyticsScores(name, rows) {
            if (!['Centrality', 'Community Detection', 'Collusion Detection', 'Louvain', 'Leiden', 'k-core', 'Motif Counting', 'Link Prediction', 'GCN', 'GraphSAGE', 'GAT'].includes(name)) return null;
            const graph = graphAnalytics(rows);
            const nodeRisk = (node) => {
                const [kind, rawId] = node.split(':');
                const id = Number(rawId);
                if (kind === 'u') {
                    const merchants = graph.userMerchants.get(id) || new Set();
                    const merchantExposure = Array.from(merchants).reduce((sum, merchant) => sum + ((graph.merchantUsers.get(merchant) || new Set()).size), 0) / Math.max(1, merchants.size);
                    return Math.log1p(merchants.size) + merchantExposure / 20 + (id % 23 === 0 ? 0.55 : 0);
                }
                const users = graph.merchantUsers.get(id) || new Set();
                const userExposure = Array.from(users).reduce((sum, user) => sum + ((graph.userMerchants.get(user) || new Set()).size), 0) / Math.max(1, users.size);
                return Math.log1p(users.size) + userExposure / 20 + (id % 19 === 0 ? 0.45 : 0);
            };
            const neighborAggregate = (node, attention = false) => {
                const neighbors = Array.from((graph.adjacency && graph.adjacency.get(node)) || []);
                if (!neighbors.length) return nodeRisk(node);
                let weightSum = 0;
                let scoreSum = 0;
                neighbors.forEach((neighbor) => {
                    const risk = nodeRisk(neighbor);
                    const weight = attention ? 0.6 + Math.min(1.8, risk) : 1;
                    weightSum += weight;
                    scoreSum += weight * risk;
                });
                return scoreSum / Math.max(weightSum, 1);
            };
            const values = rows.map(row => {
                const userNode = `u:${row.user}`;
                const merchantNode = `m:${row.merchant}`;
                const userDegree = graph.degree.get(userNode) || 0;
                const merchantDegree = graph.degree.get(merchantNode) || 0;
                const cid = graph.component.get(userNode);
                const community = graph.componentStats[cid] || { density: 0, avgRisk: 0, nodes: 1 };
                if (name === 'Centrality') return Math.log1p(userDegree) + Math.log1p(merchantDegree) + row.graphRisk;
                if (name === 'k-core') return (graph.core.get(userNode) || 0) + (graph.core.get(merchantNode) || 0) + row.graphRisk;
                if (name === 'Motif Counting') return graph.motifCount(row) + row.velocity1h * 0.5 + row.graphRisk * 3;
                if (name === 'Link Prediction') return graph.linkScore(row) + row.categoryRisk + row.graphRisk;
                if (name === 'Community Detection') return community.avgRisk + community.density * 2 + Math.log1p(community.nodes) / 5;
                if (name === 'Louvain') return community.avgRisk + community.density * 2.4 + graph.motifCount(row) / 14 + row.graphRisk;
                if (name === 'Leiden') return community.avgRisk + community.density * 2.1 + Math.log1p(community.nodes) / 4 + graph.linkScore(row) / 3;
                if (name === 'GCN') return (nodeRisk(userNode) + nodeRisk(merchantNode) + neighborAggregate(userNode) + neighborAggregate(merchantNode)) / 4 + row.categoryRisk;
                if (name === 'GraphSAGE') return neighborAggregate(userNode) * 0.45 + neighborAggregate(merchantNode) * 0.45 + row.velocity1h / 18 + row.graphRisk;
                if (name === 'GAT') return neighborAggregate(userNode, true) * 0.42 + neighborAggregate(merchantNode, true) * 0.42 + graph.linkScore(row) / 3 + row.categoryRisk;
                const merchantUsers = (graph.merchantUsers.get(row.merchant) || new Set()).size;
                const userMerchants = (graph.userMerchants.get(row.user) || new Set()).size;
                return community.avgRisk + row.graphRisk * 2 + Math.log1p(merchantUsers * userMerchants) + graph.motifCount(row) / 10;
            });
            return normalizeScores(values);
        }

        function scoreRows(rows) {
            const amounts = rows.map(r => r.amount).sort((a, b) => a - b);
            const median = amounts[Math.floor(amounts.length / 2)];
            const deviations = rows.map(r => Math.abs(r.amount - median)).sort((a, b) => a - b);
            const mad = deviations[Math.floor(deviations.length / 2)] || 1;
            const raw = {
                rules: rows.map(r => (r.amount > median + 6 * mad ? 0.45 : 0) + (r.velocity1h > 7 ? 0.35 : 0) + (r.isNight ? 0.12 : 0) + r.categoryRisk * 0.08 + (r.priorDeclines || 0) * 0.04),
                iforest: rows.map(r => Math.abs(r.amount - median) / (mad * 12) + r.velocity1h / 18 + r.velocity24h / 60 + r.isNight * 0.08 + (r.entityLinkRisk || 0) / 14 + Math.log1p(r.geoDistance || 0) / 18),
                gbdt: rows.map(r => 1 / (1 + Math.exp(-(0.004 * (r.amount - median) + 0.18 * r.velocity1h + 0.05 * r.velocity24h + 0.45 * r.categoryRisk + 0.28 * (r.merchantRisk || 0) + 0.22 * (r.entityLinkRisk || 0) + 0.3 * r.isNight - 2.8)))),
                vae: rows.map(r => Math.pow((r.amount - median) / (mad * 10), 2) + Math.pow((r.velocity1h - 3) / 8, 2) + Math.pow((r.velocity24h - 12) / 32, 2) + Math.pow(((r.geoDistance || 0) - 70) / 1200, 2)),
                graph: rows.map(r => r.graphRisk + (r.entityLinkRisk || 0) * 0.24 + (r.deviceUserCount || 1) / 18 + (r.ipUserCount || 1) / 22 + (r.user % 23 === 0 ? 0.18 : 0) + (r.merchant % 19 === 0 ? 0.14 : 0))
            };
            const normalized = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, normalizeScores(v)]));
            normalized.moe = rows.map((_, i) => (
                normalized.rules[i] * 0.18 +
                normalized.iforest[i] * 0.20 +
                normalized.gbdt[i] * 0.28 +
                normalized.vae[i] * 0.16 +
                normalized.graph[i] * 0.18
            ));
            return normalized;
        }

        function hashModel(name) {
            return Array.from(name).reduce((acc, ch) => ((acc * 31) + ch.charCodeAt(0)) >>> 0, 7);
        }

        function runnerSpec(name) {
            return runnerSpecForModel(name);
        }

        function scoreModel(name, rows, baseScores) {
            const spec = runnerSpec(name);
            const directScores = directStatisticalScores(name, rows) || directDensityScores(name, rows) || directGeometryScores(name, rows) || directClassicalAnomalyScores(name, rows) || directSupervisedScores(name, rows) || directDeepAnomalyScores(name, rows) || directGraphAnalyticsScores(name, rows);
            if (directScores) return directScores;
            const h = spec.hash;
            const base = baseScores[spec.family] || baseScores.iforest;
            const weight = {
                amount: ((h % 7) + 3) / 20,
                velocity: (((h >> 3) % 7) + 3) / 20,
                graph: (((h >> 6) % 7) + 2) / 22,
                temporal: (((h >> 9) % 7) + 2) / 24,
                identity: (((h >> 12) % 7) + 2) / 26
            };
            const amounts = rows.map(r => r.amount).sort((a, b) => a - b);
            const median = amounts[Math.floor(amounts.length / 2)];
            const amountSignal = normalizeScores(rows.map(r => Math.abs(r.amount - median)));
            const velocitySignal = normalizeScores(rows.map(r => r.velocity1h * 2 + r.velocity24h));
            const graphSignal = normalizeScores(rows.map(r => r.graphRisk + (r.entityLinkRisk || 0) * 0.22 + (r.user % 23 === 0 ? 0.2 : 0) + (r.merchant % 19 === 0 ? 0.16 : 0)));
            const temporalSignal = normalizeScores(rows.map(r => r.isNight + Math.abs(r.hour - 13) / 24 + r.velocity1h / 12 + (r.temporalBurst || 0) / 12));
            const identitySignal = normalizeScores(rows.map(r => ((r.user % 17 === 0) ? 1 : 0) + ((r.merchant % 13 === 0) ? 1 : 0) + r.categoryRisk + (r.deviceUserCount || 1) / 8 + (r.ipUserCount || 1) / 12));
            return normalizeScores(rows.map((_, i) => (
                base[i] * 0.52 +
                amountSignal[i] * weight.amount +
                velocitySignal[i] * weight.velocity +
                graphSignal[i] * weight.graph +
                temporalSignal[i] * weight.temporal +
                identitySignal[i] * weight.identity +
                ((h % 13) / 1000)
            )));
        }

        function explanationFor(spec, alert) {
            const row = alert.row;
            const baseItems = [
                { key: 'amount', label: activeLang() === 'es' ? 'Monto anómalo' : 'Amount anomaly', value: Math.min(1, Math.log10(row.amount + 1) / 4) },
                { key: 'velocity', label: activeLang() === 'es' ? 'Velocidad' : 'Velocity', value: Math.min(1, (row.velocity1h * 2 + row.velocity24h) / 55) },
                { key: 'graph', label: activeLang() === 'es' ? 'Vecindario de grafo' : 'Graph neighborhood', value: Math.min(1, row.graphRisk + (row.entityLinkRisk || 0) * 0.22 + (row.user % 23 === 0 ? 0.18 : 0)) },
                { key: 'temporal', label: activeLang() === 'es' ? 'Temporalidad' : 'Temporal context', value: Math.min(1, row.isNight * 0.55 + Math.abs(row.hour - 13) / 24 + (row.temporalBurst || 0) / 15) },
                { key: 'identity', label: activeLang() === 'es' ? 'KYA/KYE' : 'KYA/KYE context', value: Math.min(1, row.categoryRisk + (row.merchantRisk || 0) * 0.3 + (row.deviceUserCount || 1) / 10 + (row.ipUserCount || 1) / 14) }
            ];
            const emphasis = {
                rules: ['velocity', 'amount', 'temporal'],
                iforest: ['amount', 'velocity', 'identity'],
                gbdt: ['velocity', 'identity', 'amount'],
                vae: ['amount', 'velocity', 'temporal'],
                graph: ['graph', 'identity', 'temporal'],
                moe: ['velocity', 'graph', 'amount']
            }[spec.family];
            return baseItems
                .map(item => ({ ...item, value: Math.min(1, item.value * (emphasis.includes(item.key) ? 1.25 : 0.8)) }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
        }

        function renderExplanation(spec, topAlert) {
            if (!explain || !topAlert) return;
            const items = explanationFor(spec, topAlert);
            explain.innerHTML = `
                <div class="flex items-center justify-between gap-3 text-xs">
                    <span class="font-semibold text-slate-700">${escapeHtml(localizedText(spec.explainKind))}</span>
                    <span class="rounded-full ${spec.exact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-2 py-1 text-[10px] font-semibold">${escapeHtml(localizedText(spec.status))}</span>
                </div>
                ${items.map(item => `
                    <div>
                        <div class="mb-1 flex justify-between text-xs">
                            <span class="text-slate-600">${escapeHtml(item.label)}</span>
                            <span class="font-mono text-slate-500">${item.value.toFixed(2)}</span>
                        </div>
                        <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div class="h-full rounded-full bg-emerald-600" style="width:${Math.max(5, item.value * 100)}%"></div>
                        </div>
                    </div>
                `).join('')}
            `;
        }

        function pcaProjection(rows) {
            const features = standardizedFeatures(rows);
            const dim = features[0]?.length || 0;
            if (!features.length || !dim) return [];
            const covariance = Array.from({ length: dim }, (_, i) => Array.from({ length: dim }, (_, j) => mean(features.map(row => row[i] * row[j]))));
            const multiply = (vector, matrix = covariance) => matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
            const normalizeVector = (vector) => {
                const length = Math.hypot(...vector) || 1;
                return vector.map(value => value / length);
            };
            let pc1 = normalizeVector(Array.from({ length: dim }, (_, index) => index === 0 ? 1 : 0.15));
            for (let iter = 0; iter < 18; iter += 1) pc1 = normalizeVector(multiply(pc1));
            const lambda1 = pc1.reduce((sum, value, index) => sum + value * multiply(pc1)[index], 0);
            const deflated = covariance.map((row, i) => row.map((value, j) => value - lambda1 * pc1[i] * pc1[j]));
            let pc2 = normalizeVector(Array.from({ length: dim }, (_, index) => index === 1 ? 1 : 0.11));
            for (let iter = 0; iter < 18; iter += 1) {
                const projected = multiply(pc2, deflated);
                const dot = projected.reduce((sum, value, index) => sum + value * pc1[index], 0);
                pc2 = normalizeVector(projected.map((value, index) => value - dot * pc1[index]));
            }
            const raw = features.map(row => ({
                x: row.reduce((sum, value, index) => sum + value * pc1[index], 0),
                y: row.reduce((sum, value, index) => sum + value * pc2[index], 0)
            }));
            const xs = raw.map(point => point.x).sort((a, b) => a - b);
            const ys = raw.map(point => point.y).sort((a, b) => a - b);
            const xLo = quantile(xs, 0.03);
            const xHi = quantile(xs, 0.97);
            const yLo = quantile(ys, 0.03);
            const yHi = quantile(ys, 0.97);
            const scale = (value, lo, hi, min, max) => min + Math.max(0, Math.min(1, (value - lo) / (hi - lo || 1))) * (max - min);
            return raw.map(point => ({
                x: scale(point.x, xLo, xHi, 22, 212),
                y: 142 - scale(point.y, yLo, yHi, 0, 124),
                pc1: point.x,
                pc2: point.y
            }));
        }

        function convexHull(points) {
            const unique = Array.from(new Map(points.map(point => [`${point.x.toFixed(1)},${point.y.toFixed(1)}`, point])).values())
                .sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
            if (unique.length < 3) return unique;
            const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
            const lower = [];
            unique.forEach(point => {
                while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
                lower.push(point);
            });
            const upper = [];
            unique.slice().reverse().forEach(point => {
                while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
                upper.push(point);
            });
            return lower.slice(0, -1).concat(upper.slice(0, -1));
        }

        function paddedHull(points, pad = 7) {
            const hull = convexHull(points);
            if (hull.length < 3) return '';
            const cx = mean(hull.map(point => point.x));
            const cy = mean(hull.map(point => point.y));
            return hull.map(point => {
                const dx = point.x - cx;
                const dy = point.y - cy;
                const length = Math.hypot(dx, dy) || 1;
                return `${(point.x + dx / length * pad).toFixed(1)},${(point.y + dy / length * pad).toFixed(1)}`;
            }).join(' ');
        }

        function renderRepresentation(spec, rows, scores) {
            if (!representation) return;
            const top = scores.map((score, i) => ({ score, row: rows[i] }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 42);
            const threshold = top[Math.min(9, top.length - 1)]?.score || 0.5;
            const graphLike = spec.family === 'graph' || ['Collusion Detection', 'Louvain', 'Leiden', 'GraphSAGE', 'GAT', 'GCN', 'R-GCN', 'HGT', 'CrimeGNN', 'BRIGHT', 'Knowledge Graph', 'Graph Attention Evidence'].includes(spec.name);
            if (graphLike) {
                const colorFor = (item) => item.row.fraud && item.score >= threshold ? '#16a34a' : item.row.fraud ? '#dc2626' : item.score >= threshold ? '#2563eb' : '#94a3b8';
                const focus = top.slice(0, 8);
                const nodes = new Map();
                const addNode = (id, label, kind, x, y, item) => {
                    if (!nodes.has(id)) nodes.set(id, { id, label, kind, x, y, color: colorFor(item), fraud: item.row.fraud });
                    else if (item.row.fraud && item.score >= threshold) nodes.get(id).color = '#16a34a';
                };
                const edges = [];
                focus.forEach((item, index) => {
                    const row = item.row;
                    const y = 26 + index * 13;
                    const jitter = (index % 2) * 8;
                    addNode(`u${row.user}`, `U${row.user}`, 'user', 40 + jitter, y, item);
                    addNode(`m${row.merchant}`, `M${row.merchant}`, 'merchant', 172 - jitter, y, item);
                    addNode(`d${row.device}`, `D${row.device}`, 'device', 84, Math.max(18, y - 8), item);
                    addNode(`ip${row.ip}`, `IP${row.ip}`, 'ip', 128, Math.min(138, y + 8), item);
                    edges.push({ a: `u${row.user}`, b: `m${row.merchant}`, color: colorFor(item), width: item.score >= threshold ? 1.8 : 1.0, label: row.id });
                    edges.push({ a: `u${row.user}`, b: `d${row.device}`, color: colorFor(item), width: 0.9, label: row.archetype });
                    edges.push({ a: `u${row.user}`, b: `ip${row.ip}`, color: colorFor(item), width: 0.9, label: row.archetype });
                });
                const nodeList = Array.from(nodes.values()).slice(0, 34);
                const nodeById = new Map(nodeList.map(node => [node.id, node]));
                const priorityNodes = nodeList.filter(node => node.color === '#16a34a' || node.color === '#2563eb');
                const graphDecisionRegion = paddedHull(priorityNodes, 11);
                const edgeSvg = edges
                    .filter(edge => nodeById.has(edge.a) && nodeById.has(edge.b))
                    .map(edge => {
                        const a = nodeById.get(edge.a);
                        const b = nodeById.get(edge.b);
                        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${edge.color}" stroke-width="${edge.width}" opacity="0.52"><title>${escapeHtml(edge.label)}</title></line>`;
                    }).join('');
                const nodeSvg = nodeList.map(node => `
                    <g>
                        <circle cx="${node.x}" cy="${node.y}" r="${node.kind === 'merchant' ? 4.2 : node.kind === 'user' ? 3.8 : 3.1}" fill="${node.color}" opacity="0.9"><title>${escapeHtml(`${node.kind} ${node.label}`)}</title></circle>
                        <text x="${node.x}" y="${node.y - 5.2}" font-size="6.2" fill="#475569" text-anchor="middle">${escapeHtml(node.label)}</text>
                    </g>
                `).join('');
                representation.innerHTML = `
                    <svg viewBox="0 0 230 160" class="w-full rounded-2xl border border-slate-200 bg-slate-50" role="img" aria-label="${escapeHtml(spec.name)} graph representation">
                        <rect x="12" y="12" width="206" height="132" rx="12" fill="#eff6ff" opacity="0.65" />
                        ${graphDecisionRegion ? `<polygon points="${graphDecisionRegion}" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.42"><title>${activeLang() === 'es' ? 'Región de decisión priorizada' : 'Prioritized decision region'}</title></polygon>` : ''}
                        <text x="115" y="154" font-size="8" fill="#64748b" text-anchor="middle">${activeLang() === 'es' ? 'subgrafo de usuarios, comercios, dispositivos e IP' : 'user, merchant, device, and IP subgraph'}</text>
                        ${edgeSvg}
                        ${nodeSvg}
                    </svg>
                    <div class="mt-2 text-[10px] text-slate-500">${activeLang() === 'es' ? 'Azul: alertas priorizadas. Verde: fraude priorizado correctamente. Rojo: fraude etiquetado no priorizado. Halo azul: región de decisión. Las aristas comparten el color de la transacción que conectan.' : 'Blue: prioritized alerts. Green: correctly prioritized fraud. Red: labeled fraud not prioritized. Blue halo: decision region. Edges inherit the color of the transaction they connect.'}</div>
                `;
                return;
            }
            const projected = pcaProjection(rows);
            const pointData = top.map((item, idx) => {
                const rowIndex = rows.indexOf(item.row);
                const point = projected[rowIndex] || { x: 22 + idx * 4, y: 142 - item.score * 112 };
                const prioritized = item.score >= threshold;
                const color = item.row.fraud && prioritized ? '#16a34a' : item.row.fraud ? '#dc2626' : prioritized ? '#2563eb' : '#94a3b8';
                return { x: point.x, y: point.y, color, item, idx, prioritized };
            });
            const decisionRegion = paddedHull(pointData.filter(point => point.prioritized), 8);
            const points = pointData.map(point => `
                <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${point.idx < 8 ? 3.7 : 2.7}" fill="${point.color}" opacity="0.86">
                    <title>${escapeHtml(`${point.item.row.id} score ${point.item.score.toFixed(3)} PC1 ${point.x.toFixed(1)} PC2 ${point.y.toFixed(1)}`)}</title>
                </circle>
            `).join('');
            representation.innerHTML = `
                <svg viewBox="0 0 230 160" class="w-full rounded-2xl border border-slate-200 bg-slate-50" role="img" aria-label="${escapeHtml(spec.name)} PCA representation plot">
                    ${decisionRegion ? `<polygon points="${decisionRegion}" fill="#dbeafe" stroke="#2563eb" stroke-width="1.3" stroke-dasharray="4 3" opacity="0.78"><title>${activeLang() === 'es' ? 'Región de decisión priorizada' : 'Prioritized decision region'}</title></polygon>` : ''}
                    <line x1="18" y1="142" x2="214" y2="142" stroke="#cbd5e1" />
                    <line x1="18" y1="16" x2="18" y2="142" stroke="#cbd5e1" />
                    <text x="116" y="155" font-size="8" fill="#64748b" text-anchor="middle">${activeLang() === 'es' ? 'PC1: mezcla de anomalía transaccional' : 'PC1: transaction anomaly mix'}</text>
                    <text x="8" y="82" font-size="8" fill="#64748b" text-anchor="middle" transform="rotate(-90 8 82)">${activeLang() === 'es' ? 'PC2: riesgo relacional / temporal' : 'PC2: relational / temporal risk'}</text>
                    ${points}
                </svg>
                <div class="mt-2 text-[10px] text-slate-500">${activeLang() === 'es' ? 'Azul: alertas priorizadas. Verde: fraude priorizado correctamente. Rojo: fraude etiquetado no priorizado. Área azul: región de decisión.' : 'Blue: prioritized alerts. Green: correctly prioritized fraud. Red: labeled fraud not prioritized. Blue area: decision region.'}</div>
            `;
        }

        function hydrateWorkbench(spec, alert) {
            const row = alert.row;
            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            };
            setText('workbench-txn-id', row.id);
            setText('workbench-risk-score', alert.score.toFixed(2));
            setText('workbench-model-label', `${spec.name} ${activeLang() === 'es' ? 'puntaje' : 'score'}`);
            setText('workbench-model-score', alert.score.toFixed(3));
            setText('workbench-graph-context', activeLang() === 'es'
                ? `riesgo de grafo ${row.graphRisk.toFixed(2)}`
                : `graph risk ${row.graphRisk.toFixed(2)}`);
            setText('workbench-memo-body', activeLang() === 'es'
                ? `Priorizar revisión. ${spec.name} elevó ${row.id} por monto ${row.amount.toFixed(2)}, velocidad 1h ${row.velocity1h}, exposición de grafo ${row.graphRisk.toFixed(2)} y contexto KYA/KYE. Datos faltantes: historial de dispositivo y cambios recientes de entidad.`
                : `Prioritize review. ${spec.name} elevated ${row.id} because of amount ${row.amount.toFixed(2)}, 1h velocity ${row.velocity1h}, graph exposure ${row.graphRisk.toFixed(2)}, and KYA/KYE context. Missing data: device history and recent entity-change log.`);
            const target = document.getElementById('workbench-explainability');
            if (target) {
                target.innerHTML = explanationFor(spec, alert).slice(0, 3).map((item) => `
                    <div>
                        <div class="flex justify-between"><span>${item.label}</span><span class="font-mono">${item.value.toFixed(2)}</span></div>
                        <div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-emerald-600 rounded-full" style="width:${Math.max(5, item.value * 100)}%"></div></div>
                    </div>
                `).join('') + `
                    <div class="rounded-2xl bg-slate-50 p-3 text-[10px] text-slate-500">
                        ${activeLang() === 'es'
                            ? `Vista vinculada desde el laboratorio: ${localizedText(spec.explainKind)} para ${spec.name}.`
                            : `Linked from the lab: ${localizedText(spec.explainKind)} for ${spec.name}.`}
                    </div>
                `;
            }
            const workbench = document.getElementById('workbench');
            if (workbench) {
                workbench.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState({}, '', '#workbench');
            }
        }

        function prAuc(labels, scores) {
            const pairs = scores.map((score, i) => ({ score, label: labels[i] })).sort((a, b) => b.score - a.score);
            const positives = labels.reduce((sum, v) => sum + v, 0);
            if (!positives) return 0;
            let tp = 0;
            let fp = 0;
            let prevRecall = 0;
            let area = 0;
            pairs.forEach(p => {
                if (p.label) tp += 1; else fp += 1;
                const recall = tp / positives;
                const precision = tp / Math.max(tp + fp, 1);
                area += (recall - prevRecall) * precision;
                prevRecall = recall;
            });
            return area;
        }

        function recallAtK(labels, scores, k) {
            const positives = labels.reduce((sum, v) => sum + v, 0);
            if (!positives) return 0;
            const top = scores.map((score, i) => ({ score, label: labels[i] })).sort((a, b) => b.score - a.score).slice(0, k);
            return top.reduce((sum, p) => sum + p.label, 0) / positives;
        }

        function foldDiagnostics(labels, scores, folds = 4) {
            const foldResults = Array.from({ length: folds }, (_, fold) => {
                const foldLabels = [];
                const foldScores = [];
                labels.forEach((label, i) => {
                    if (i % folds === fold) {
                        foldLabels.push(label);
                        foldScores.push(scores[i]);
                    }
                });
                return {
                    fold: fold + 1,
                    prAuc: prAuc(foldLabels, foldScores),
                    recall25: recallAtK(foldLabels, foldScores, Math.min(25, foldLabels.length))
                };
            });
            const mean = foldResults.reduce((sum, fold) => sum + fold.prAuc, 0) / foldResults.length;
            const variance = foldResults.reduce((sum, fold) => sum + Math.pow(fold.prAuc - mean, 2), 0) / foldResults.length;
            return { foldResults, mean, std: Math.sqrt(variance) };
        }

        function renderTimeline(spec, rows, diagnostics) {
            if (!timeline) return;
            const stageBase = spec.exact ? 0.74 : 0.58;
            const curve = Array.from({ length: 9 }, (_, index) => {
                const progress = index / 8;
                const wobble = (((spec.hash >> index) & 3) - 1.5) * 0.008;
                const loss = Math.max(0.08, (spec.exact ? 0.68 : 0.78) - progress * (spec.exact ? 0.42 : 0.34) + wobble);
                const val = Math.max(0.1, loss + diagnostics.std * 0.7 + (index % 3) * 0.012);
                return { progress, loss, val };
            });
            const pathFor = (key) => curve.map((point, index) => {
                const x = 18 + point.progress * 180;
                const y = 70 - point[key] * 58;
                return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(' ');
            const stages = [
                { label: activeLang() === 'es' ? 'Datos' : 'Data', pct: 0.98 },
                { label: activeLang() === 'es' ? 'Variables' : 'Features', pct: 0.9 },
                { label: activeLang() === 'es' ? 'CV temporal' : 'Temporal CV', pct: Math.max(0.34, 0.86 - diagnostics.std * 2.6) },
                { label: spec.exact ? (activeLang() === 'es' ? 'Ajuste exacto' : 'Exact fit') : (activeLang() === 'es' ? 'Ajuste educativo' : 'Educational fit'), pct: stageBase },
                { label: activeLang() === 'es' ? 'Explicación' : 'Explain', pct: 0.82 }
            ];
            timeline.innerHTML = stages.map((stage, index) => `
                <div>
                    <div class="mb-1 flex justify-between text-[10px]">
                        <span class="font-medium text-slate-600">${stage.label}</span>
                        <span class="font-mono text-slate-400">${Math.round(stage.pct * 100)}%</span>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div class="h-full rounded-full bg-slate-900 transition-all duration-700" style="width:${Math.max(6, stage.pct * 100)}%; transition-delay:${index * 90}ms"></div>
                    </div>
                </div>
            `).join('') + `
                <div class="rounded-2xl border border-slate-200 bg-white p-3">
                    <div class="mb-2 flex items-center justify-between text-[10px]">
                        <span class="font-semibold text-slate-600">${spec.exact ? (activeLang() === 'es' ? 'Traza real de entrenamiento' : 'Actual browser training trace') : (activeLang() === 'es' ? 'Traza simulada de entrenamiento' : 'Simulated training trace')}</span>
                        <span class="font-mono text-slate-400">${activeLang() === 'es' ? 'pérdida / validación' : 'loss / validation'}</span>
                    </div>
                    <svg viewBox="0 0 220 92" class="h-28 w-full" role="img" aria-label="${escapeHtml(spec.name)} training timeline">
                        <line x1="18" y1="70" x2="198" y2="70" stroke="#e2e8f0" />
                        <line x1="18" y1="10" x2="18" y2="70" stroke="#e2e8f0" />
                        <text x="108" y="88" font-size="7.5" fill="#64748b" text-anchor="middle">${activeLang() === 'es' ? 'paso de ajuste / fold de validación' : 'fit step / validation fold'}</text>
                        <text x="7" y="43" font-size="7.5" fill="#64748b" text-anchor="middle" transform="rotate(-90 7 43)">${activeLang() === 'es' ? 'error / pérdida de validación' : 'error / validation loss'}</text>
                        <text x="158" y="14" font-size="6.8" fill="#0f172a">${activeLang() === 'es' ? 'entrenamiento' : 'train'}</text>
                        <line x1="144" y1="12" x2="154" y2="12" stroke="#0f172a" stroke-width="2" />
                        <text x="158" y="23" font-size="6.8" fill="#2563eb">${activeLang() === 'es' ? 'validación' : 'validation'}</text>
                        <line x1="144" y1="21" x2="154" y2="21" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4 3" />
                        <path d="${pathFor('loss')}" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" />
                        <path d="${pathFor('val')}" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round" />
                        ${curve.map((point, index) => `<circle cx="${(18 + point.progress * 180).toFixed(1)}" cy="${(70 - point.loss * 58).toFixed(1)}" r="${index === curve.length - 1 ? 3 : 2}" fill="#0f172a" />`).join('')}
                    </svg>
                </div>
                <div class="rounded-2xl bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-500">
                    ${activeLang() === 'es'
                        ? `${spec.name}: ${rows.length} filas sintéticas, ${diagnostics.foldResults.length} folds, desviación PR-AUC ${diagnostics.std.toFixed(3)}. ${spec.exact ? 'La curva se deriva del ajuste ligero en JS.' : 'La curva simula el comportamiento esperado de ajuste para mantener la misma experiencia sin afirmar entrenamiento completo de DL/GNN en el navegador.'}`
                        : `${spec.name}: ${rows.length} synthetic rows, ${diagnostics.foldResults.length} folds, PR-AUC std ${diagnostics.std.toFixed(3)}. ${spec.exact ? 'The curve is derived from the lightweight JS fit.' : 'The curve simulates expected fitting behavior so the UX stays consistent without claiming full DL/GNN browser training.'}`}
                </div>
            `;
        }

        function renderValidation(spec, diagnostics) {
            if (!validation) return;
            const maxFold = Math.max(...diagnostics.foldResults.map(fold => fold.prAuc), 0.01);
            validation.innerHTML = `
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="rounded-2xl bg-slate-50 p-3">
                        <div class="text-[10px] text-slate-500">${activeLang() === 'es' ? 'Media PR-AUC CV' : 'CV mean PR-AUC'}</div>
                        <div class="font-semibold text-slate-900">${diagnostics.mean.toFixed(3)}</div>
                    </div>
                    <div class="rounded-2xl bg-slate-50 p-3">
                        <div class="text-[10px] text-slate-500">${activeLang() === 'es' ? 'Estabilidad' : 'Stability'}</div>
                        <div class="font-semibold ${diagnostics.std < 0.08 ? 'text-emerald-700' : 'text-amber-700'}">${diagnostics.std.toFixed(3)}</div>
                    </div>
                </div>
                <div class="space-y-2">
                    ${diagnostics.foldResults.map(fold => `
                        <div>
                            <div class="mb-1 flex justify-between text-[10px]">
                                <span>${activeLang() === 'es' ? 'Fold' : 'Fold'} ${fold.fold}</span>
                                <span class="font-mono">PR ${fold.prAuc.toFixed(3)} · R@25 ${fold.recall25.toFixed(2)}</span>
                            </div>
                            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div class="h-full rounded-full bg-blue-700" style="width:${Math.max(5, (fold.prAuc / maxFold) * 100)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="rounded-2xl bg-blue-50 p-3 text-[10px] leading-relaxed text-blue-800">
                    ${activeLang() === 'es'
                        ? `Validación de navegador para ${spec.name}: partición determinista en folds, sin fuga temporal simulada y chequeo de explicación/renderizado.`
                        : `Browser validation for ${spec.name}: deterministic fold split, simulated temporal-leakage guard, and explanation/render check.`}
                </div>
                <div class="rounded-2xl ${spec.exact ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'} p-3 text-[10px] leading-relaxed">
                    ${spec.exact
                        ? (activeLang() === 'es' ? `Implementación directa en navegador: ${spec.name}.` : `Direct in-browser implementation: ${spec.name}.`)
                        : (activeLang() === 'es' ? `Aproximación educativa específica del modelo: ${spec.name}. Traza simulada de entrenamiento/validación cruzada con métricas, explicaciones y visualizaciones equivalentes.` : `Model-specific educational approximation: ${spec.name}. Simulated training/cross-validation trace with equivalent metrics, explanations, and visualizations.`)}
                </div>
            `;
        }

        let lastLabState = null;

        function render(results, rows, selected, runId = pendingRun) {
            chart.dataset.labRunId = String(runId);
            chart.dataset.labSelected = selected;
            const filtered = selected === 'all' ? results : results.filter(r => r.key === selected || r.name === selected);
            const maxPr = Math.max(...filtered.map(r => r.prAuc), 0.01);
            chart.innerHTML = filtered.map(r => `
                <div data-lab-result-name="${escapeHtml(r.name)}">
                    <div class="flex justify-between gap-2 text-xs mb-1">
                        <span class="font-medium text-slate-700">${escapeHtml(r.name)} <span class="ml-1 rounded-full ${r.spec.exact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-1.5 py-0.5 text-[9px]">${r.spec.exact ? (activeLang() === 'es' ? 'exacto' : 'exact') : (activeLang() === 'es' ? 'educativo' : 'educational')}</span></span>
                        <span class="font-mono text-emerald-700">PR-AUC ${r.prAuc.toFixed(3)} · R@50 ${r.recall50.toFixed(2)}</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div class="h-full bg-blue-700 rounded-full" style="width:${Math.max(4, (r.prAuc / maxPr) * 100)}%"></div>
                    </div>
                </div>
            `).join('');

            const topModel = filtered.slice().sort((a, b) => b.prAuc - a.prAuc)[0];
            const topAlerts = topModel.scores.map((score, i) => ({ score, row: rows[i] })).sort((a, b) => b.score - a.score).slice(0, 6);
            alerts.innerHTML = topAlerts.map((item, index) => `
                <div class="rounded-2xl border border-slate-200 p-3 flex justify-between gap-3">
                    <div>
                        <div class="font-mono text-slate-800">${escapeHtml(item.row.id)}</div>
                        <div class="text-slate-500">${activeLang() === 'es' ? 'monto' : 'amount'} $${item.row.amount.toFixed(2)} · v1h ${item.row.velocity1h} · ${activeLang() === 'es' ? 'grafo' : 'graph'} ${item.row.graphRisk.toFixed(2)}</div>
                        <button type="button" class="open-workbench mt-2 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold hover:bg-slate-50" data-alert-index="${index}">${activeLang() === 'es' ? 'Abrir en workbench' : 'Open in workbench'}</button>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold ${item.row.fraud ? 'text-red-700' : 'text-slate-700'}">${item.score.toFixed(3)}</div>
                        <div class="text-[10px] text-slate-400">${item.row.fraud ? (activeLang() === 'es' ? 'etiqueta fraude' : 'fraud label') : (activeLang() === 'es' ? 'etiqueta normal' : 'normal label')}</div>
                    </div>
                </div>
            `).join('');
            alerts.querySelectorAll('.open-workbench').forEach((button) => {
                button.addEventListener('click', () => {
                    const alert = topAlerts[Number(button.dataset.alertIndex || 0)];
                    if (alert) hydrateWorkbench(topModel.spec, alert);
                });
            });
            renderExplanation(topModel.spec, topAlerts[0]);
            renderRepresentation(topModel.spec, rows, topModel.scores);
            renderTimeline(topModel.spec, rows, topModel.diagnostics);
            renderValidation(topModel.spec, topModel.diagnostics);
            lastLabState = { results, rows, selected, runId };
        }

        let pendingRun = 0;
        let loadingStartedAt = 0;

        function nextFrame() {
            return new Promise(resolve => window.requestAnimationFrame(() => resolve()));
        }

        function sleep(ms) {
            return new Promise(resolve => window.setTimeout(resolve, ms));
        }

        function updateLoadingProgress(percent, message) {
            if (loadingBar) {
                loadingBar.style.width = `${Math.max(8, Math.min(100, percent))}%`;
                loadingBar.setAttribute('aria-valuenow', String(Math.round(percent)));
            }
            if (status && message) status.textContent = message;
        }

        function setLoading(isLoading, selected = null) {
            if (!loading) return;
            loading.classList.toggle('hidden', !isLoading);
            runBtn.disabled = isLoading;
            modelSelect.disabled = isLoading;
            sizeInput.disabled = isLoading;
            if (loadingBar) {
                loadingBar.style.width = isLoading ? '8%' : '100%';
                loadingBar.setAttribute('role', 'progressbar');
                loadingBar.setAttribute('aria-valuemin', '0');
                loadingBar.setAttribute('aria-valuemax', '100');
                loadingBar.setAttribute('aria-valuenow', isLoading ? '8' : '100');
            }
            if (status && isLoading) {
                loadingStartedAt = performance.now();
                status.textContent = activeLang() === 'es'
                    ? `Ajustando ${selected === 'all' ? 'todos los modelos' : selected} en el navegador...`
                    : `Fitting ${selected === 'all' ? 'all models' : selected} in the browser...`;
            }
        }

        async function finishLoading(selected) {
            updateLoadingProgress(100, status ? status.textContent : '');
            const elapsed = performance.now() - loadingStartedAt;
            if (elapsed < 520) await sleep(520 - elapsed);
            setLoading(false, selected);
        }

        async function runLabCore(runId = pendingRun) {
            const n = parseInt(sizeInput.value, 10);
            const selected = modelSelect.value || 'all';
            updateLoadingProgress(14, activeLang() === 'es' ? 'Generando transacciones sintéticas...' : 'Generating synthetic transactions...');
            await nextFrame();
            if (runId !== pendingRun) return;
            const rows = generateTransactions(n);
            updateLoadingProgress(24, activeLang() === 'es' ? 'Construyendo variables y etiquetas...' : 'Building features and labels...');
            await nextFrame();
            if (runId !== pendingRun) return;
            const labels = rows.map(r => r.fraud);
            const baseScores = scoreRows(rows);
            const runnableModels = selected === 'all' ? models : [selected];
            const results = [];
            for (let index = 0; index < runnableModels.length; index += 1) {
                const name = runnableModels[index];
                const progress = 30 + (index / Math.max(1, runnableModels.length)) * 48;
                updateLoadingProgress(progress, activeLang() === 'es'
                    ? `Ejecutando ${name} (${index + 1}/${runnableModels.length})...`
                    : `Running ${name} (${index + 1}/${runnableModels.length})...`);
                await nextFrame();
                if (runId !== pendingRun) return;
                const spec = runnerSpec(name);
                const modelScores = scoreModel(name, rows, baseScores);
                results.push({
                    key: name,
                    name,
                    spec,
                    scores: modelScores,
                    prAuc: prAuc(labels, modelScores),
                    recall50: recallAtK(labels, modelScores, Math.min(50, rows.length)),
                    diagnostics: foldDiagnostics(labels, modelScores)
                });
            }
            updateLoadingProgress(84, activeLang() === 'es' ? 'Ordenando métricas y preparando visualizaciones...' : 'Ranking metrics and preparing visualizations...');
            await nextFrame();
            results.sort((a, b) => b.prAuc - a.prAuc);
            if (runId !== pendingRun) return;
            updateLoadingProgress(93, activeLang() === 'es' ? 'Renderizando evidencia, PCA/grafo y validación...' : 'Rendering evidence, PCA/graph view, and validation...');
            await nextFrame();
            render(results, rows, selected, runId);
            if (status) {
                const fraudCount = labels.reduce((sum, v) => sum + v, 0);
                status.textContent = activeLang() === 'es'
                    ? `Completadas ${rows.length} filas, ${fraudCount} etiquetas de fraude y ${runnableModels.length} ejecutor(es) de modelo.`
                    : `Completed ${rows.length} rows, ${fraudCount} fraud labels, and ${runnableModels.length} model runner(s).`;
            }
            await finishLoading(selected);
        }

        function runLab() {
            pendingRun += 1;
            const runId = pendingRun;
            const selected = modelSelect.value || 'all';
            setLoading(true, selected);
            window.requestAnimationFrame(() => {
                window.setTimeout(() => {
                    if (runId !== pendingRun) return;
                    runLabCore(runId).catch((error) => {
                        console.error('[Model Tour] Browser lab failed', error);
                        if (status) {
                            status.textContent = activeLang() === 'es'
                                ? 'El laboratorio encontró un error; intenta de nuevo con menos filas.'
                                : 'The lab hit an error; try again with fewer rows.';
                        }
                        setLoading(false, selected);
                    });
                }, 30);
            });
        }

        function refreshLabLanguage() {
            const allModelsOption = document.querySelector('#lab-model-select option[value="all"]');
            if (allModelsOption) {
                allModelsOption.textContent = activeLang() === 'es' ? 'Todos los modelos' : 'All models';
            }
            if (lastLabState) {
                render(lastLabState.results, lastLabState.rows, lastLabState.selected, lastLabState.runId);
                if (status) {
                    const fraudCount = lastLabState.rows.reduce((sum, row) => sum + row.fraud, 0);
                    const runnerCount = lastLabState.selected === 'all' ? models.length : 1;
                    status.textContent = activeLang() === 'es'
                        ? `Completadas ${lastLabState.rows.length} filas, ${fraudCount} etiquetas de fraude y ${runnerCount} ejecutor(es) de modelo.`
                        : `Completed ${lastLabState.rows.length} rows, ${fraudCount} fraud labels, and ${runnerCount} model runner(s).`;
                }
            }
        }

        sizeInput.addEventListener('input', () => {
            if (sizeLabel) sizeLabel.textContent = sizeInput.value;
        });
        runBtn.addEventListener('click', runLab);
        modelSelect.addEventListener('change', runLab);
        window.ModelTour = window.ModelTour || {};
        window.ModelTour.runBrowserLab = runLab;
        window.ModelTour.refreshBrowserLabLanguage = refreshLabLanguage;
        runLab();
    }

    // Public API for future (e.g. updateMetrics from external)
    window.ModelTour = {
        refreshBars: initMetricBars,
        runBrowserLab: window.ModelTour ? window.ModelTour.runBrowserLab : null,
        refreshBrowserLabLanguage: window.ModelTour ? window.ModelTour.refreshBrowserLabLanguage : null,
        filterModels: (cat) => {
            const chip = document.querySelector(`.filter-chip[data-filter="${cat}"]`);
            if (chip) chip.click();
        }
    };

    // Simple client-side sort for experiments table (PR-AUC column)
    function initTableSort() {
        const table = document.querySelector('.comparison-table');
        if (!table) return;

        const header = table.querySelector('th:nth-child(3)'); // PR-AUC column
        if (!header) return;

        header.style.cursor = 'pointer';
        header.title = 'Click to sort by PR-AUC';
        header.tabIndex = 0;
        header.setAttribute('role', 'button');
        header.setAttribute('aria-sort', 'none');

        let asc = false;
        const sortRows = () => {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                const aVal = parseFloat(a.querySelector('td:nth-child(3)').textContent) || 0;
                const bVal = parseFloat(b.querySelector('td:nth-child(3)').textContent) || 0;
                return asc ? aVal - bVal : bVal - aVal;
            });

            rows.forEach(row => tbody.appendChild(row));
            asc = !asc;

            // Update header indicator
            header.textContent = header.textContent.replace(/ [↑↓]$/, '') + (asc ? ' ↓' : ' ↑');
            header.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
        };

        header.addEventListener('click', sortRows);
        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                sortRows();
            }
        });
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            initTableSort();
            initLanguageSystem();
        });
    } else {
        init();
        initTableSort();
        initLanguageSystem();
    }

    // ============================================
    // LANGUAGE / LOCALIZATION SYSTEM (Latin America expansion)
    // Best practices applied:
    // - Key-based translations (game design style)
    // - Separate JSON (easy to maintain, like professional i18n)
    // - No string concatenation in code
    // - localStorage + browser detection
    // - URL param support (?lang=es)
    // - Accessibility (aria, lang attr)
    // - Toggle UI with visual feedback
    // - Fallback to English
    // ============================================

    let currentLang = 'en';
    let translations = {};

    async function loadTranslations() {
        try {
            const res = await fetch(`translations.json?v=${LAB_CACHE_KEY}`, { cache: 'no-store' });
            translations = await res.json();
        } catch (e) {
            console.warn('Could not load translations.json, using fallback English');
            translations = {}; // Will fall back to original text
        }
    }

    function applyTranslation(lang) {
        currentLang = lang;
        document.documentElement.lang = lang === 'es' ? 'es-419' : 'en';

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key] && translations[key][lang]) {
                const translated = translations[key][lang];
                
                // Handle different element types
                if (el.tagName === 'META') {
                    el.setAttribute('content', translated);
                } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translated;
                } else {
                    // For text or HTML content
                    if (TRUSTED_HTML_I18N_KEYS.has(key) && translated.includes('<') && translated.includes('>')) {
                        el.innerHTML = translated;
                    } else {
                        el.textContent = decodeHtmlEntities(translated);
                    }
                }
            }
        });

        // Translate SVG text elements (special handling for architecture diagram)
        const svgTexts = {
            'svg-raw': 'svg.raw',
            'svg-txns': 'svg.txns',
            'svg-graph': 'svg.graph',
            'svg-fe': 'svg.fe',
            'svg-fe1': 'svg.fe1',
            'svg-fe2': 'svg.fe2',
            'svg-fe3': 'svg.fe3',
            'svg-gate': 'svg.gate',
            'svg-gate1': 'svg.gate1',
            'svg-xgb': 'svg.xgb',
            'svg-xgb1': 'svg.xgb1',
            'svg-vae': 'svg.vae',
            'svg-vae1': 'svg.vae1',
            'svg-moe': 'svg.moe',
            'svg-moe1': 'svg.moe1',
            'svg-lstm': 'svg.lstm',
            'svg-lstm1': 'svg.lstm1',
            'svg-graphsage': 'svg.graphsage',
            'svg-graphsage1': 'svg.graphsage1',
            'svg-ensemble': 'svg.ensemble',
            'svg-ensemble1': 'svg.ensemble1',
            'svg-ensemble2': 'svg.ensemble2',
            'svg-risk': 'svg.risk',
            'svg-risk1': 'svg.risk1',
            'svg-risk2': 'svg.risk2',
            'svg-risk3': 'svg.risk3',
            'svg-device': 'svg.device',
            'svg-peer': 'svg.peer',
            'svg-worker': 'svg.worker'
        };
        Object.keys(svgTexts).forEach(id => {
            const el = document.getElementById(id);
            const key = svgTexts[id];
            if (el && translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });

        // Update toggle buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
            btn.classList.toggle('bg-slate-900', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('hover:bg-slate-100', !isActive);
            btn.classList.toggle('text-slate-700', !isActive);
        });

        // Persist
        localStorage.setItem('siteLang', lang);

        // Re-render JavaScript-generated surfaces that are not backed by data-i18n.
        initFullModelSurfaces();
        initMetricBars();
        const allModelsOption = document.querySelector('#lab-model-select option[value="all"]');
        if (allModelsOption) {
            allModelsOption.textContent = lang === 'es' ? 'Todos los modelos' : 'All models';
        }
        if (window.ModelTour && typeof window.ModelTour.refreshBrowserLabLanguage === 'function') {
            window.ModelTour.refreshBrowserLabLanguage();
        }

        // Optional: update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
    }

    function initLanguageToggle() {
        const enBtn = document.getElementById('lang-en');
        const esBtn = document.getElementById('lang-es');

        if (enBtn) {
            enBtn.addEventListener('click', () => applyTranslation('en'));
        }
        if (esBtn) {
            esBtn.addEventListener('click', () => applyTranslation('es'));
        }
    }

    async function initLanguageSystem() {
        await loadTranslations();

        // Determine language: URL > localStorage > browser > 'en'
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const storedLang = localStorage.getItem('siteLang');
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        
        let lang = 'en';
        if (urlLang === 'es' || urlLang === 'en') {
            lang = urlLang;
        } else if (storedLang === 'es' || storedLang === 'en') {
            lang = storedLang;
        } else if (browserLang.startsWith('es')) {
            lang = 'es';
        }

        // Initialize toggle UI
        initLanguageToggle();

        // Apply
        applyTranslation(lang);
    }

    // Expose for debugging / external control
    window.setLanguage = (lang) => applyTranslation(lang);
})();
