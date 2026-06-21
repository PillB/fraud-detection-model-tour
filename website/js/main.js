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
        initPrintHint();
        
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
                        <div class="metric-bar-container flex-1" title="PR-AUC ${value.toFixed(3)} (synthetic toy)">
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
    function initModelFilter() {
        const cardsGrid = document.querySelector('#cards .grid');
        if (!cardsGrid) return;

        // Create filter chips above grid
        const filterBar = document.createElement('div');
        filterBar.className = 'mb-4 flex flex-wrap gap-2 text-xs';
        filterBar.innerHTML = `
            <span class="text-slate-500 self-center mr-1 font-medium">Filter:</span>
            <span class="filter-chip active px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50" data-filter="all">All</span>
            <span class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50" data-filter="generative">Generative / AD</span>
            <span class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50" data-filter="hybrid">Hybrid / MoE</span>
            <span class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50" data-filter="sequence">Sequence / Behavioral</span>
            <span class="filter-chip px-3 py-1 bg-white border rounded-full text-slate-700 hover:bg-slate-50" data-filter="tabular">Tabular / Graph</span>
        `;
        
        const section = document.getElementById('cards');
        if (section) section.insertBefore(filterBar, cardsGrid);

        const chips = filterBar.querySelectorAll('.filter-chip');
        const cards = cardsGrid.querySelectorAll('.model-card');

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                const filter = chip.dataset.filter;
                
                cards.forEach(card => {
                    const label = (card.textContent + ' ' + (card.dataset.category || '')).toLowerCase();
                    let show = (filter === 'all');
                    
                    if (filter === 'generative') show = /vae|generative|anomaly|recon/.test(label);
                    if (filter === 'hybrid') show = /moe|hybrid|mixture|ensemble/.test(label);
                    if (filter === 'sequence') show = /lstm|seq|behavior|velocity/.test(label);
                    if (filter === 'tabular') show = /xgboost|tab|graph|transformer|tabular|relational/.test(label);
                    
                    card.style.display = show ? '' : 'none';
                    if (show) card.classList.add('animate-in');
                });
            });
        });
    }

    // Add "Copy command" buttons next to toy links for live feel
    function initCopyButtons() {
        document.querySelectorAll('a[href*="/experiments/"]').forEach(link => {
            const container = link.parentElement;
            if (!container || container.querySelector('.copy-btn')) return;
            
            const btn = document.createElement('button');
            btn.className = 'copy-btn text-[10px] px-2 py-0.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-600 ml-1';
            btn.textContent = 'Copy cmd';
            btn.title = 'Copy run command';
            
            const scriptPath = link.getAttribute('href').replace('../', '');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cmd = `python ${scriptPath}`;
                navigator.clipboard.writeText(cmd).then(() => {
                    const orig = btn.textContent;
                    btn.textContent = '✓ Copied';
                    setTimeout(() => btn.textContent = orig, 1400);
                }).catch(() => {
                    // Fallback
                    prompt('Copy this command:', cmd);
                });
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

    function initPrintHint() {
        // Optional: hint in console or add subtle print-ready class on footer click
        const footer = document.querySelector('footer');
        if (footer) {
            footer.addEventListener('click', () => {
                if (confirm('Print / save this page as PDF for client deliverable?')) {
                    window.print();
                }
            }, { once: true });
        }
    }

    // Public API for future (e.g. updateMetrics from external)
    window.ModelTour = {
        refreshBars: initMetricBars,
        filterModels: (cat) => {
            const chip = document.querySelector(`.filter-chip[data-filter="${cat}"]`);
            if (chip) chip.click();
        }
    };

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();