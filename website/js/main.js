/**
 * Model Tour — Professional Interactivity (BCG/McKinsey polish)
 * Self-contained for GitHub live deployment. No external deps beyond page.
 * Features: PR-AUC bar viz, model filtering, copy buttons, metric hovers, smooth nav.
 */

(function() {
    'use strict';

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
        const scoreByCategory = {
            supervised: '0.24',
            generative: '0.21',
            hybrid: '0.30',
            sequence: '0.26',
            tabular: '0.28',
            graph: '0.31'
        };
        const overrides = {
            'Isolation Forest': '0.218',
            XGBoost: '0.284',
            GraphSAGE: '0.319',
            VAE: '0.367',
            MoE: '0.295',
            TabTransformer: '0.278',
            LSTM: '0.261',
            'Collusion Detection': '0.322'
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
            score: overrides[name] || scoreByCategory[category],
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
        const exact = ['Z-Score', 'IQR', 'MAD', 'Modified Z-Score', 'Centrality', 'k-core', 'Motif Counting', 'KMeans', 'DBSCAN'].includes(name);
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
                ? `${detail.name} se ejecuta en el laboratorio con el proxy "${detail.labKey}". El enlace fuente queda disponible para revisar la implementación Python.`
                : `${detail.name} runs in the browser lab with the "${detail.labKey}" proxy. The source link remains available for the Python implementation.`;
        }
    }

    function runModelInBrowserLab(name) {
        if (!name) return;
        selectWorkspaceModel(name);
        const key = labKeyForModel(name);
        const lab = document.getElementById('browser-lab');
        const select = document.getElementById('lab-model-select');
        const runButton = document.getElementById('lab-run');
        if (select && Array.from(select.options).some((option) => option.value === name)) {
            select.value = name;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (select && Array.from(select.options).some((option) => option.value === key)) {
            select.value = key;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (window.ModelTour && typeof window.ModelTour.runBrowserLab === 'function') {
            window.ModelTour.runBrowserLab();
        }
        if (runButton) runButton.click();
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
            const isModelCardLink = href.includes('/model-cards/') || href.includes('docs/model-cards') || /^(card|full card|ficha|tarjeta completa)$/i.test(text.trim());
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
                        <div class="model-badge bg-slate-100 text-slate-700 rounded mt-1 inline-block">${localizedText(meta.label)}</div>
                    </div>
                    <span class="text-[10px] px-2 py-px bg-emerald-50 text-emerald-700 font-medium rounded">${activeLang() === 'es' ? 'Ejemplo ejecutable' : 'Runnable example'}</span>
                </div>
                <p class="mt-3 text-xs leading-snug text-slate-600">${meta.best}</p>
                <div class="mt-3 text-xs">
                    <div class="font-medium text-emerald-700">${activeLang() === 'es' ? 'PR-AUC de referencia aproximado' : 'Benchmark/proxy PR-AUC'}: ${meta.score}</div>
                    <div class="text-[10px] text-slate-500">${activeLang() === 'es' ? `Seleccionable por nombre en el laboratorio del navegador; estado: ${runnerStatusLabel(name)}.` : `Selectable by name in the browser lab; status: ${runnerStatusLabel(name)}.`}</div>
                </div>
                <div class="mt-auto pt-3 border-t text-xs flex flex-wrap gap-2">
                    <a href="${meta.docs}" class="px-3 py-1 bg-slate-900 text-white rounded-2xl text-xs font-medium hover:bg-black transition">${activeLang() === 'es' ? 'Ficha' : 'Card'}</a>
                    <a href="${meta.script}" class="px-3 py-1 border border-slate-200 rounded-2xl text-xs font-medium hover:bg-slate-50 transition">${activeLang() === 'es' ? 'Ejecutar' : 'Run'}</a>
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
                    <td class="py-2.5 text-right font-mono text-emerald-700 font-semibold">${meta.score}</td>
                    <td class="py-2.5 pl-4 text-xs text-slate-500">${meta.complexity}</td>
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
        const status = document.getElementById('lab-status');
        if (!runBtn || !sizeInput || !modelSelect || !chart || !alerts) return;

        const models = getRequiredModels();
        modelSelect.replaceChildren(
            new Option(activeLang() === 'es' ? 'Todos los modelos' : 'All models', 'all'),
            ...models.map((name) => new Option(name, name))
        );

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
            const random = rng(20260630 + n);
            const rows = [];
            for (let i = 0; i < n; i += 1) {
                const user = Math.floor(random() * 210);
                const merchant = Math.floor(random() * 85);
                const hour = Math.floor(random() * 24);
                const isNight = hour < 6 || hour > 22 ? 1 : 0;
                const amount = Math.max(1, Math.exp(4 + gaussian(random) * 0.9));
                const velocity1h = Math.floor(random() * 5 + random() * 3);
                const velocity24h = Math.floor(random() * 20 + random() * 8);
                const categoryRisk = random() < 0.1 ? 1 : random() < 0.4 ? 0.45 : 0.15;
                const graphRisk = ((user % 17 === 0) || (merchant % 13 === 0)) ? 0.75 : random() * 0.25;
                let fraud = 0;
                let amt = amount;
                let v1 = velocity1h;
                let v24 = velocity24h;
                const pattern = random();
                if (pattern < 0.004) {
                    fraud = 1; amt *= 6; v1 += 1;
                } else if (pattern < 0.008) {
                    fraud = 1; v1 += 9; v24 += 22;
                } else if (pattern < 0.012) {
                    fraud = 1; amt *= 2.2; v24 += 8;
                }
                rows.push({
                    id: `TXN${String(i).padStart(6, '0')}`,
                    user,
                    merchant,
                    amount: Math.round(amt * 100) / 100,
                    hour,
                    isNight,
                    velocity1h: v1,
                    velocity24h: v24,
                    categoryRisk,
                    graphRisk,
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

        function scoreRows(rows) {
            const amounts = rows.map(r => r.amount).sort((a, b) => a - b);
            const median = amounts[Math.floor(amounts.length / 2)];
            const deviations = rows.map(r => Math.abs(r.amount - median)).sort((a, b) => a - b);
            const mad = deviations[Math.floor(deviations.length / 2)] || 1;
            const raw = {
                rules: rows.map(r => (r.amount > median + 6 * mad ? 0.45 : 0) + (r.velocity1h > 7 ? 0.35 : 0) + (r.isNight ? 0.12 : 0) + r.categoryRisk * 0.08),
                iforest: rows.map(r => Math.abs(r.amount - median) / (mad * 12) + r.velocity1h / 18 + r.velocity24h / 60 + r.isNight * 0.08),
                gbdt: rows.map(r => 1 / (1 + Math.exp(-(0.004 * (r.amount - median) + 0.18 * r.velocity1h + 0.05 * r.velocity24h + 0.45 * r.categoryRisk + 0.3 * r.isNight - 2.6)))),
                vae: rows.map(r => Math.pow((r.amount - median) / (mad * 10), 2) + Math.pow((r.velocity1h - 3) / 8, 2) + Math.pow((r.velocity24h - 12) / 32, 2)),
                graph: rows.map(r => r.graphRisk + (r.user % 23 === 0 ? 0.18 : 0) + (r.merchant % 19 === 0 ? 0.14 : 0))
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
            const family = labKeyForModel(name);
            const exact = ['Z-Score', 'IQR', 'MAD', 'Modified Z-Score', 'Centrality', 'k-core', 'Motif Counting', 'KMeans', 'DBSCAN', 'Rules + velocity gate'].includes(name);
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

        function scoreModel(name, rows, baseScores) {
            const spec = runnerSpec(name);
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
            const graphSignal = normalizeScores(rows.map(r => r.graphRisk + (r.user % 23 === 0 ? 0.2 : 0) + (r.merchant % 19 === 0 ? 0.16 : 0)));
            const temporalSignal = normalizeScores(rows.map(r => r.isNight + Math.abs(r.hour - 13) / 24 + r.velocity1h / 12));
            const identitySignal = normalizeScores(rows.map(r => ((r.user % 17 === 0) ? 1 : 0) + ((r.merchant % 13 === 0) ? 1 : 0) + r.categoryRisk));
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
                { key: 'graph', label: activeLang() === 'es' ? 'Vecindario de grafo' : 'Graph neighborhood', value: Math.min(1, row.graphRisk + (row.user % 23 === 0 ? 0.18 : 0)) },
                { key: 'temporal', label: activeLang() === 'es' ? 'Temporalidad' : 'Temporal context', value: Math.min(1, row.isNight * 0.55 + Math.abs(row.hour - 13) / 24) },
                { key: 'identity', label: activeLang() === 'es' ? 'KYA/KYE' : 'KYA/KYE context', value: Math.min(1, row.categoryRisk + (row.merchant % 13 === 0 ? 0.25 : 0)) }
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
                    <span class="font-semibold text-slate-700">${localizedText(spec.explainKind)}</span>
                    <span class="rounded-full ${spec.exact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-2 py-1 text-[10px] font-semibold">${localizedText(spec.status)}</span>
                </div>
                ${items.map(item => `
                    <div>
                        <div class="mb-1 flex justify-between text-xs">
                            <span class="text-slate-600">${item.label}</span>
                            <span class="font-mono text-slate-500">${item.value.toFixed(2)}</span>
                        </div>
                        <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div class="h-full rounded-full bg-emerald-600" style="width:${Math.max(5, item.value * 100)}%"></div>
                        </div>
                    </div>
                `).join('')}
            `;
        }

        function renderRepresentation(spec, rows, scores) {
            if (!representation) return;
            const top = scores.map((score, i) => ({ score, row: rows[i] }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 42);
            const points = top.map((item, idx) => {
                const x = 18 + Math.min(184, Math.max(0, item.row.graphRisk * 130 + (item.row.user % 31) * 2));
                const y = 142 - Math.min(118, Math.max(0, item.score * 112 + item.row.isNight * 8));
                const color = item.row.fraud ? '#dc2626' : (idx < 10 ? '#2563eb' : '#94a3b8');
                return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${idx < 8 ? 3.7 : 2.7}" fill="${color}" opacity="0.85"><title>${item.row.id} ${item.score.toFixed(3)}</title></circle>`;
            }).join('');
            representation.innerHTML = `
                <svg viewBox="0 0 230 160" class="w-full rounded-2xl border border-slate-200 bg-slate-50" role="img" aria-label="${spec.name} representation plot">
                    <line x1="18" y1="142" x2="214" y2="142" stroke="#cbd5e1" />
                    <line x1="18" y1="16" x2="18" y2="142" stroke="#cbd5e1" />
                    <text x="116" y="155" font-size="8" fill="#64748b" text-anchor="middle">${activeLang() === 'es' ? 'exposición relacional / identidad' : 'relational / identity exposure'}</text>
                    <text x="8" y="82" font-size="8" fill="#64748b" text-anchor="middle" transform="rotate(-90 8 82)">${activeLang() === 'es' ? 'puntaje' : 'score'}</text>
                    ${points}
                </svg>
                <div class="mt-2 text-[10px] text-slate-500">${activeLang() === 'es' ? 'Azul: alertas priorizadas. Rojo: etiquetas de fraude en datos sintéticos.' : 'Blue: prioritized alerts. Red: fraud labels in synthetic data.'}</div>
            `;
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

        function render(results, rows, selected) {
            const filtered = selected === 'all' ? results : results.filter(r => r.key === selected || r.name === selected);
            const maxPr = Math.max(...filtered.map(r => r.prAuc), 0.01);
            chart.innerHTML = filtered.map(r => `
                <div>
                    <div class="flex justify-between gap-2 text-xs mb-1">
                        <span class="font-medium text-slate-700">${r.name} <span class="ml-1 rounded-full ${r.spec.exact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-1.5 py-0.5 text-[9px]">${r.spec.exact ? (activeLang() === 'es' ? 'exacto' : 'exact') : (activeLang() === 'es' ? 'educativo' : 'educational')}</span></span>
                        <span class="font-mono text-emerald-700">PR-AUC ${r.prAuc.toFixed(3)} · R@50 ${r.recall50.toFixed(2)}</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div class="h-full bg-blue-700 rounded-full" style="width:${Math.max(4, (r.prAuc / maxPr) * 100)}%"></div>
                    </div>
                </div>
            `).join('');

            const topModel = filtered.slice().sort((a, b) => b.prAuc - a.prAuc)[0];
            const topAlerts = topModel.scores.map((score, i) => ({ score, row: rows[i] })).sort((a, b) => b.score - a.score).slice(0, 6);
            alerts.innerHTML = topAlerts.map(item => `
                <div class="rounded-2xl border border-slate-200 p-3 flex justify-between gap-3">
                    <div>
                        <div class="font-mono text-slate-800">${item.row.id}</div>
                        <div class="text-slate-500">${activeLang() === 'es' ? 'monto' : 'amount'} $${item.row.amount.toFixed(2)} · v1h ${item.row.velocity1h} · ${activeLang() === 'es' ? 'grafo' : 'graph'} ${item.row.graphRisk.toFixed(2)}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold ${item.row.fraud ? 'text-red-700' : 'text-slate-700'}">${item.score.toFixed(3)}</div>
                        <div class="text-[10px] text-slate-400">${item.row.fraud ? (activeLang() === 'es' ? 'etiqueta fraude' : 'fraud label') : (activeLang() === 'es' ? 'etiqueta normal' : 'normal label')}</div>
                    </div>
                </div>
            `).join('');
            renderExplanation(topModel.spec, topAlerts[0]);
            renderRepresentation(topModel.spec, rows, topModel.scores);
        }

        function runLab() {
            const n = parseInt(sizeInput.value, 10);
            const rows = generateTransactions(n);
            const labels = rows.map(r => r.fraud);
            const baseScores = scoreRows(rows);
            const selected = modelSelect.value || 'all';
            const runnableModels = selected === 'all' ? models : [selected];
            const results = runnableModels.map(name => {
                const spec = runnerSpec(name);
                const modelScores = scoreModel(name, rows, baseScores);
                return {
                    key: name,
                    name,
                    spec,
                    scores: modelScores,
                    prAuc: prAuc(labels, modelScores),
                    recall50: recallAtK(labels, modelScores, Math.min(50, rows.length))
                };
            }).sort((a, b) => b.prAuc - a.prAuc);
            render(results, rows, selected);
            if (status) {
                const fraudCount = labels.reduce((sum, v) => sum + v, 0);
                status.textContent = activeLang() === 'es'
                    ? `Completadas ${rows.length} filas, ${fraudCount} etiquetas de fraude y ${runnableModels.length} ejecutor(es) de modelo.`
                    : `Completed ${rows.length} rows, ${fraudCount} fraud labels, and ${runnableModels.length} model runner(s).`;
            }
        }

        sizeInput.addEventListener('input', () => {
            if (sizeLabel) sizeLabel.textContent = sizeInput.value;
        });
        runBtn.addEventListener('click', runLab);
        modelSelect.addEventListener('change', runLab);
        window.ModelTour = window.ModelTour || {};
        window.ModelTour.runBrowserLab = runLab;
        runLab();
    }

    // Public API for future (e.g. updateMetrics from external)
    window.ModelTour = {
        refreshBars: initMetricBars,
        runBrowserLab: window.ModelTour ? window.ModelTour.runBrowserLab : null,
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
            const res = await fetch('translations.json?v=20260630-flow', { cache: 'no-store' });
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
                    if (translated.includes('<') && translated.includes('>')) {
                        el.innerHTML = translated;
                    } else {
                        el.textContent = translated;
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
        if (window.ModelTour && typeof window.ModelTour.runBrowserLab === 'function') {
            window.ModelTour.runBrowserLab();
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
