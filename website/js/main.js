/**
 * Model Tour — Professional Interactivity (BCG/McKinsey polish)
 * Self-contained for GitHub live deployment. No external deps beyond page.
 * Features: PR-AUC bar viz, model filtering, copy buttons, metric hovers, smooth nav.
 */

(function() {
    'use strict';

    // Initialize on DOM ready
    function init() {
        initMetricBars();
        initModelFilter();
        initCopyButtons();
        initTooltips();
        initSmoothAnchors();
        initMobileJumpNav();
        
        // Mark animations
        document.querySelectorAll('.card, .bg-white.border').forEach((el, i) => {
            el.style.animationDelay = (i * 40) + 'ms';
            el.classList.add('animate-in');
        });
        
        console.log('%c[Model Tour] Professional site initialized — client-ready.', 'color:#64748b');
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
                    <option value="supervised">Supervised</option>
                    <option value="generative" data-i18n="filter.generative">Generative / AD</option>
                    <option value="hybrid" data-i18n="filter.hybrid">Hybrid / MoE</option>
                    <option value="sequence" data-i18n="filter.sequence">Sequence / Behavioral</option>
                    <option value="tabular" data-i18n="filter.tabular">Tabular</option>
                    <option value="graph">Graph / Network</option>
                </select>
            </div>
            <div class="hidden md:flex flex-wrap gap-2 text-xs" role="group" aria-label="Filter model cards">
                <span class="text-slate-500 self-center mr-1 font-medium" data-i18n="filter.label">Filter:</span>
                <button type="button" class="filter-chip active px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="all" aria-pressed="true" data-i18n="filter.all">All</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="supervised" aria-pressed="false">Supervised</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="generative" aria-pressed="false" data-i18n="filter.generative">Generative / AD</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="hybrid" aria-pressed="false" data-i18n="filter.hybrid">Hybrid / MoE</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="sequence" aria-pressed="false" data-i18n="filter.sequence">Sequence / Behavioral</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="tabular" aria-pressed="false" data-i18n="filter.tabular">Tabular</button>
                <button type="button" class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" data-filter="graph" aria-pressed="false">Graph / Network</button>
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

    // Public API for future (e.g. updateMetrics from external)
    window.ModelTour = {
        refreshBars: initMetricBars,
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
            const res = await fetch('translations.json');
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
            'svg-risk3': 'svg.risk3'
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
        });

        // Persist
        localStorage.setItem('siteLang', lang);

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
        if (urlLang === 'es' || storedLang === 'es' || browserLang.startsWith('es')) {
            lang = 'es';
        } else if (urlLang === 'en' || storedLang === 'en') {
            lang = 'en';
        }

        // Initialize toggle UI
        initLanguageToggle();

        // Apply
        applyTranslation(lang);
    }

    // Expose for debugging / external control
    window.setLanguage = (lang) => applyTranslation(lang);
})();
