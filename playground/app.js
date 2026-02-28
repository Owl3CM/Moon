// ── Moon Style Playground — App Logic ──────────────────────────────────────────
'use strict';

// ── State ──
const State = {
  config: null,
  build: null,
  curTheme: 'dark',
  curTab: 'styles',
};

// ── Debounce timers ──
let _buildTimer, _jitTimer;

// ── Shadow root cache (prevents memory leaks from re-attaching) ──
const _shadowRoots = {};

function getShadowRoot(containerId) {
  if (_shadowRoots[containerId]) return _shadowRoots[containerId];
  const el = document.getElementById(containerId);
  if (!el) return null;
  const host = document.createElement('div');
  el.innerHTML = '';
  el.appendChild(host);
  const sr = host.attachShadow({ mode: 'open' });
  _shadowRoots[containerId] = sr;
  return sr;
}

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  State.config = JSON.parse(JSON.stringify(MoonEngine.DEFAULT_CONFIG));
  document.getElementById('cfg').value = JSON.stringify(State.config, null, 2);
  document.getElementById('jit-in').value = JIT_DEFAULT;
  runBuild();
  initNav();
  initEventListeners();
});

const JIT_DEFAULT = `<!-- Moon JIT + Config classes working together -->
<div class="bg-prim p:32px round-xl col gap-lg">
  <div class="row justify-between items-center">
    <div class="col gap-xs">
      <h2 class="text-owl text-2x weight-bold">Moon Style</h2>
      <p class="text-lord text-sm">Config → CSS → Magic ✨</p>
    </div>
    <div class="bg-cyan text-owl px-xl py-sm round-full text-xs weight-bold">Live</div>
  </div>
  <div class="row gap-md wrap">
    <div class="bg-prince p:20px round-lg col gap-xs" style="flex:1;min-width:100px">
      <span class="text-cyan text-2x weight-bold">425</span>
      <span class="text-lord text-xs">Classes</span>
    </div>
    <div class="bg-prince p:20px round-lg col gap-xs" style="flex:1;min-width:100px">
      <span class="text-green text-2x weight-bold">3</span>
      <span class="text-lord text-xs">Themes</span>
    </div>
    <div class="bg-prince p:20px round-lg col gap-xs" style="flex:1;min-width:100px">
      <span class="text-red text-2x weight-bold">0ms</span>
      <span class="text-lord text-xs">Build</span>
    </div>
  </div>
  <div class="row gap-sm wrap">
    <span class="bg-cyan text-owl px-lg py-sm round-full text-sm hover:[bg-red]" style="cursor:pointer">Hover me!</span>
    <span class="bg:#e74c3c text:#fff p:6px round-md text-sm">JIT Color</span>
    <span class="bg:#2ecc71 text:#fff p:6px round-md text-sm">Inline Hex</span>
    <span class="bg-nice text-owl px-lg py-sm round-full text-sm">Config Class</span>
  </div>
</div>`;

// ── Event Listeners (replaces inline onclick) ──
function initEventListeners() {
  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      loadPreset(preset, btn);
    });
  });

  // Output tabs
  document.querySelectorAll('.output-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      showTab(tab.dataset.tab, tab);
    });
  });

  // Copy buttons
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copyTarget;
      const el = document.getElementById(targetId);
      if (el) copyText(el.value || el.textContent);
    });
  });

  // Config editor
  document.getElementById('cfg').addEventListener('input', debounceBuild);

  // Search
  document.getElementById('search').addEventListener('input', renderClasses);

  // JIT editor
  document.getElementById('jit-in').addEventListener('input', debounceJit);

  // Quick insert buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      insertJit(btn.dataset.insert);
    });
  });
}

// ── Build ──
function runBuild() {
  try {
    State.build = MoonEngine.buildFromConfig(State.config);
    document.getElementById('lab-err').textContent = State.build.error || '';
  } catch (e) {
    console.error('[Playground] Build error:', e);
    document.getElementById('lab-err').textContent = e.message;
    // Clear stale previews on error
    clearPreviews();
    return;
  }
  showTab(State.curTab);
  renderLabPreview();
  renderThemeStudio();
  renderClasses();
  renderJit();
}

function clearPreviews() {
  ['lab-pv', 'theme-pv', 'jit-pv'].forEach(id => {
    const sr = _shadowRoots[id];
    if (sr) sr.innerHTML = '<div style="padding:2rem;text-align:center;color:#e74c3c;font-family:monospace">⚠ Build error — fix config to see preview</div>';
  });
  document.getElementById('css-out').textContent = '';
  document.getElementById('jit-css').textContent = '';
}

function debounceBuild() {
  clearTimeout(_buildTimer);
  _buildTimer = setTimeout(() => {
    try {
      State.config = JSON.parse(document.getElementById('cfg').value);
      document.getElementById('lab-err').textContent = '';
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      const themes = Object.keys(State.config.colors?.themes || {});
      if (!themes.includes(State.curTheme)) State.curTheme = themes[0] || 'dark';
      runBuild();
    } catch (e) {
      document.getElementById('lab-err').textContent = 'JSON: ' + e.message;
    }
  }, 400);
}

// ── Presets ──
const PRESETS = {
  default: null,
  minimal: {
    useStaticNumbers: false, useJit: true, projectDir: "src",
    content: ["src/**/*.{html,js}"],
    colors: {
      options: { "*": { opacities: [], props: ["bg", "text"] } },
      staticColors: {},
      themes: {
        light: { prim: "#ffffff", prince: "#f5f5f5", owl: "#111", lord: "#888", goat: "#ddd" },
        dark: { prim: "#1a1a1a", prince: "#252525", owl: "#f0f0f0", lord: "#888", goat: "#333" },
      },
    },
    styles: [
      { props: { padding: "p", margin: "m", gap: "gap" }, variableName: "s", values: { "0": "0", sm: "4px", md: "8px", lg: "16px", xl: "24px" } },
      { props: { "font-size": "text" }, variableName: "text", values: { sm: "0.875rem", md: "1rem", lg: "1.25rem", xl: "1.5rem", "2x": "2rem" } },
      { props: { "border-radius": "round" }, variableName: "round", values: { sm: "4px", md: "8px", lg: "16px", full: "999px" } },
    ],
    screens: { sm: "640px", md: "768px", lg: "1024px" },
  },
  ocean: {
    useStaticNumbers: false, useJit: true, projectDir: "src",
    content: ["src/**/*.{html,js}"],
    colors: {
      options: { "*": { opacities: [0.1, 0.5], props: ["bg", "text", "border"] } },
      staticColors: { coral: "#ff6b6b", sand: "#ffd93d", foam: "#e8f4f8" },
      themes: {
        light: { prim: "#f0f9ff", prince: "#e0f2fe", lord: "#7dd3fc", owl: "#0c4a6e", goat: "#bae6fd" },
        dark: { prim: "#0c1222", prince: "#1e293b", lord: "#38bdf8", owl: "#e0f2fe", goat: "#0ea5e9" },
        deep: { prim: "#020617", prince: "#0f172a", lord: "#06b6d4", owl: "#67e8f9", goat: "#0891b2" },
      },
    },
    styles: [
      { props: { padding: "p", margin: "m", gap: "gap" }, variableName: "spacing", values: { "0": "0", xs: "2px", sm: "4px", md: "8px", lg: "12px", xl: "16px", "2x": "24px" } },
      { props: { width: "w", height: "h", size: "size" }, variableName: "size", values: { xs: "20px", sm: "40px", md: "80px", lg: "120px" } },
      { props: { "font-size": "text" }, variableName: "text", values: { xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.25rem", xl: "1.5rem", "2x": "2rem" } },
      { props: { "border-radius": "round" }, variableName: "round", values: { none: "0", sm: "6px", md: "12px", lg: "20px", full: "999px" } },
      { props: { "box-shadow": "shadow" }, variableName: "shadow", values: { sm: "0 1px 3px rgba(0,0,0,0.1)", md: "0 4px 12px rgba(0,0,0,0.15)", lg: "0 8px 30px rgba(0,0,0,0.2)" } },
    ],
    screens: { sm: "640px", md: "768px", lg: "1024px" },
  },
  neon: {
    useStaticNumbers: false, useJit: true, projectDir: "src",
    content: ["src/**/*.{html,js}"],
    colors: {
      options: { "*": { opacities: [0.15, 0.5], props: ["bg", "text", "border"] } },
      staticColors: { pink: "#ff1493", lime: "#39ff14", yellow: "#ffff00", orange: "#ff6600" },
      themes: {
        dark: { prim: "#0d0d0d", prince: "#1a1a1a", lord: "#00ffff", owl: "#ffffff", goat: "#ff00ff" },
        cyber: { prim: "#0a0020", prince: "#150040", lord: "#00ff88", owl: "#e0ffe0", goat: "#ff0080" },
        retro: { prim: "#1a0030", prince: "#2d0050", lord: "#ff6600", owl: "#ffcc00", goat: "#ff3366" },
      },
    },
    styles: [
      { props: { padding: "p", margin: "m", gap: "gap" }, variableName: "spacing", values: { "0": "0", sm: "4px", md: "8px", lg: "16px", xl: "24px", "2x": "32px" } },
      { props: { "font-size": "text" }, variableName: "text", values: { sm: "0.875rem", md: "1rem", lg: "1.25rem", xl: "1.75rem", "2x": "2.5rem" } },
      { props: { "border-radius": "round" }, variableName: "round", values: { none: "0", sm: "4px", md: "8px", lg: "16px", full: "999px" } },
      { props: { "box-shadow": "shadow" }, variableName: "shadow", values: { neon: "0 0 10px currentColor,0 0 40px currentColor", soft: "0 4px 16px rgba(0,0,0,0.3)", none: "none" } },
    ],
    screens: { sm: "640px", md: "768px", lg: "1024px" },
  },
};

function loadPreset(name, btn) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  State.config = JSON.parse(JSON.stringify(name === 'default' ? MoonEngine.DEFAULT_CONFIG : PRESETS[name]));
  document.getElementById('cfg').value = JSON.stringify(State.config, null, 2);
  const themes = Object.keys(State.config.colors?.themes || {});
  State.curTheme = themes[0] || 'dark';
  runBuild();
}

// ── Output Tabs ──
function showTab(tab, btn) {
  State.curTab = tab;
  // Always sync button active state
  document.querySelectorAll('.output-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  if (!State.build) return;
  const content = { styles: State.build.styles, themes: State.build.themes, static: State.build.static };
  document.getElementById('css-out').textContent = content[tab] || '';
}

// ── Config Lab Preview ──
function renderLabPreview() {
  const sr = getShadowRoot('lab-pv');
  if (!State.build || !sr) return;
  const t = State.curTheme || State.build.themeNames[0];
  const sc = Object.keys(State.config.colors?.staticColors || {});
  const cc = Object.keys(State.build.generatedClasses).length;

  sr.innerHTML = `<style>
*{box-sizing:border-box;margin:0}
:host{display:block;font-family:'Inter',sans-serif}
${State.build.combined}
.lab-card{padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03)}
.lab-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:-0.01em}
.lab-label{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;opacity:0.4;font-family:'JetBrains Mono',monospace;display:block;margin-bottom:6px}
.lab-divider{height:1px;background:rgba(255,255,255,0.06);margin:20px 0}
.lab-progress{height:6px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden;margin-top:10px}
.lab-progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--cyan,#63cfc9),var(--nice,#83d6e1));width:78%}
</style>
<div class="bg-prim text-owl ${t}" style="padding:32px;min-height:350px">
  <div class="row justify-between items-center" style="margin-bottom:24px">
    <div class="col" style="gap:4px">
      <div style="font-size:26px;font-weight:900;letter-spacing:-0.03em">⚡ Live Build Output</div>
      <div class="text-lord" style="font-size:14px">Built from your config · real-time preview</div>
    </div>
    <div class="lab-badge bg-goat text-owl">${cc} classes</div>
  </div>
  <div class="row wrap" style="gap:14px;margin-bottom:20px">
    <div class="lab-card bg-prince" style="flex:1;min-width:160px">
      <span class="lab-label">class="bg-prince round-lg"</span>
      <div style="font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1" class="text-cyan">${cc}</div>
      <div class="text-lord" style="font-size:13px;margin-top:6px">Utility Classes</div>
      <div class="lab-progress"><div class="lab-progress-fill"></div></div>
    </div>
    <div class="lab-card bg-prince" style="flex:1;min-width:160px">
      <span class="lab-label">class="text-green weight-bold"</span>
      <div style="font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1" class="text-green">${State.build.themeNames.length}</div>
      <div class="text-lord" style="font-size:13px;margin-top:6px">Active Themes</div>
    </div>
    <div class="lab-card bg-prince" style="flex:1;min-width:160px">
      <span class="lab-label">class="text-red weight-bold"</span>
      <div style="font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1" class="text-red">${sc.length}</div>
      <div class="text-lord" style="font-size:13px;margin-top:6px">Static Colors</div>
    </div>
  </div>
  ${sc.length ? `<div class="lab-divider"></div>
  <div style="font-size:13px;font-weight:600;margin-bottom:12px;opacity:0.5">Static Colors</div>
  <div class="row wrap items-center" style="gap:10px">${sc.map(c => `<span class="lab-badge bg-${c} text-owl" style="font-size:13px">${c}</span>`).join('')}</div>` : ''}
</div>`;
}

// ── Theme Studio ──
function renderThemeStudio() {
  if (!State.config.colors?.themes) return;
  const themes = State.config.colors.themes;
  if (!themes[State.curTheme]) State.curTheme = Object.keys(themes)[0] || 'dark';

  // Theme buttons
  const themeListEl = document.getElementById('theme-list');
  themeListEl.innerHTML = '<div style="font-size:0.8rem;font-weight:600;color:var(--pg-text-dim);margin-bottom:0.5rem">Themes</div>' +
    Object.entries(themes).map(([n, c]) =>
      `<button class="theme-btn ${n === State.curTheme ? 'active' : ''}" data-theme="${esc(n)}">` +
      `<span class="theme-swatch" style="background:${Object.values(c)[0] || '#000'}"></span>${esc(n)}</button>`
    ).join('');

  // Attach theme button listeners
  themeListEl.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      State.curTheme = btn.dataset.theme;
      renderThemeStudio();
    });
  });

  // Color pickers
  const tc = themes[State.curTheme] || {};
  const pickersEl = document.getElementById('pickers');
  pickersEl.innerHTML = Object.entries(tc).map(([n, h]) => {
    const hex6 = normalizeHex(h);
    return `<div class="color-picker-row">` +
    `<span class="color-picker-label">${esc(n)}</span>` +
    `<input type="color" class="color-picker-input" value="${hex6}" data-color-name="${esc(n)}" aria-label="Pick color for ${esc(n)}">` +
    `<span class="color-picker-hex">${h}</span></div>`;
  }
  ).join('');

  // Attach color picker listeners
  pickersEl.querySelectorAll('.color-picker-input').forEach(input => {
    input.addEventListener('input', () => {
      pickColor(input.dataset.colorName, input.value, input);
    });
  });

  // Statics
  const sc = State.config.colors?.staticColors || {};
  document.getElementById('statics').innerHTML = Object.entries(sc).map(([n, h]) =>
    `<span class="static-color-chip"><span class="static-color-dot" style="background:${h}"></span>${esc(n)} <span style="color:var(--pg-text-muted)">${h}</span></span>`
  ).join('') || '<span style="color:var(--pg-text-muted);font-size:0.82rem">None</span>';

  document.getElementById('theme-lbl').textContent = State.curTheme;
  renderThemePreview();
}

function pickColor(name, hex, input) {
  State.config.colors.themes[State.curTheme][name] = hex;
  input.nextElementSibling.textContent = hex;
  document.getElementById('cfg').value = JSON.stringify(State.config, null, 2);
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  runBuild();
}

function renderThemePreview() {
  const sr = getShadowRoot('theme-pv');
  if (!State.build || !sr) return;
  const tc = Object.keys(State.config.colors?.themes?.[State.curTheme] || {});
  const sc = Object.keys(State.config.colors?.staticColors || {});
  const all = [...tc, ...sc];

  sr.innerHTML = `<style>
*{box-sizing:border-box;margin:0}
:host{display:block;font-family:'Inter',sans-serif}
${State.build.combined}
.swatch{width:50px;height:50px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);transition:transform .2s;cursor:pointer}
.swatch:hover{transform:scale(1.1)}
.stat-card{padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03)}
.pill{display:inline-flex;align-items:center;gap:4px;padding:8px 22px;border-radius:999px;font-size:14px;font-weight:700;margin:4px;letter-spacing:-0.01em;border:1px solid rgba(255,255,255,0.06)}
.divider{height:1px;background:rgba(255,255,255,0.06);margin:20px 0}
</style>
<div class="bg-prim text-owl ${State.curTheme}" style="padding:32px;min-height:420px">
  <div class="row justify-between items-center" style="margin-bottom:28px">
    <div class="row items-center" style="gap:14px">
      <div class="bg-goat" style="width:48px;height:48px;border-radius:50%;border:3px solid rgba(255,255,255,0.1)"></div>
      <div>
        <div style="font-size:26px;font-weight:900;letter-spacing:-0.03em">Moon Dashboard</div>
        <div class="text-lord" style="font-size:14px">Active theme: <strong>${State.curTheme}</strong></div>
      </div>
    </div>
    <div class="row" style="gap:8px">${all.slice(0, 6).map(c => `<div class="bg-${c}" style="width:32px;height:32px;border-radius:10px;border:2px solid rgba(255,255,255,0.1)"></div>`).join('')}</div>
  </div>
  <div class="row wrap" style="gap:14px;margin-bottom:20px">
    <div class="stat-card bg-prince" style="flex:1;min-width:180px">
      <div style="font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1" class="text-cyan">${Object.keys(State.build.generatedClasses).length}</div>
      <div class="text-lord" style="font-size:13px;margin-top:8px">Generated Classes</div>
    </div>
    <div class="stat-card bg-prince" style="flex:1;min-width:180px">
      <div style="font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1" class="text-green">${State.build.themeNames.length}</div>
      <div class="text-lord" style="font-size:13px;margin-top:8px">Themes</div>
    </div>
  </div>
  <div class="stat-card bg-prince" style="margin-bottom:20px">
    <div style="font-size:16px;font-weight:800;margin-bottom:16px;letter-spacing:-0.02em">🎨 Color Palette</div>
    <div class="row wrap" style="gap:16px">${all.map(c => `<div class="col items-center" style="gap:8px"><div class="swatch bg-${c}"></div><span class="text-lord" style="font-size:12px;font-weight:600">${c}</span></div>`).join('')}</div>
  </div>
  <div class="row wrap" style="gap:0">${all.map(c => `<span class="pill bg-${c} text-owl">${c}</span>`).join('')}</div>
</div>`;
}

// ── Class Explorer ──
function renderClasses() {
  if (!State.build) return;
  const filter = (document.getElementById('search').value || '').toLowerCase();
  const entries = Object.entries(State.build.generatedClasses)
    .filter(([n]) => !filter || n.toLowerCase().includes(filter))
    .slice(0, 200);

  document.getElementById('count').textContent = entries.length + ' / ' + Object.keys(State.build.generatedClasses).length;
  const tableEl = document.getElementById('cls-table');
  tableEl.innerHTML = entries.length
    ? entries.map(([n, v]) =>
        `<div class="class-item" data-copy-class=".${esc(n)} { ${esc(v)} }"><span class="class-name">.${esc(n)}</span><span class="class-value" title="${esc(v)}">${esc(v)}</span></div>`
      ).join('')
    : '<div style="padding:2rem;text-align:center;color:var(--pg-text-muted)">No matches</div>';

  // Click-to-copy on class items (uses event delegation)
  tableEl.onclick = (e) => {
    const item = e.target.closest('.class-item');
    if (item && item.dataset.copyClass) copyText(item.dataset.copyClass);
  };
}

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeHex(hex) {
  if (!hex || hex.length !== 4) return hex;
  return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
}

// ── JIT Sandbox ──
function debounceJit() {
  clearTimeout(_jitTimer);
  _jitTimer = setTimeout(renderJit, 200);
}

function insertJit(txt) {
  const el = document.getElementById('jit-in');
  const pos = el.selectionStart;
  const before = el.value.slice(0, pos);
  const after = el.value.slice(pos);
  const spacer = before.length && !before.endsWith(' ') && !before.endsWith('"') && !before.endsWith('\n') ? ' ' : '';
  el.value = before + spacer + txt + after;
  el.focus();
  const newPos = pos + spacer.length + txt.length;
  el.selectionStart = el.selectionEnd = newPos;
  renderJit();
}

function extractClassValues(html) {
  const classRegex = /class="([^"]*)"/g;
  const parts = [];
  let m;
  while ((m = classRegex.exec(html)) !== null) parts.push(m[1]);
  return parts.join(' ');
}

function renderJit() {
  if (!State.build) return;
  const html = document.getElementById('jit-in').value;
  // Only feed class attribute content to JIT to avoid false-positive matches from inline styles
  const classContent = extractClassValues(html);
  const jitCSS = MoonEngine.runJit(classContent, State.build.generatedClasses, State.build.propsByShortNames, State.config.screens || {});
  document.getElementById('jit-css').textContent = jitCSS || '/* Type Moon classes above */';

  const sr = getShadowRoot('jit-pv');
  if (!sr) return;
  const safe = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/on\w+\s*=/gi, 'data-x=');
  sr.innerHTML = `<style>*{box-sizing:border-box;margin:0}:host{display:block;font-family:'Inter',sans-serif}\n${State.build.combined}\n${jitCSS}</style><div class="${State.curTheme}">${safe}</div>`;
}

// ── Nav ──
function initNav() {
  const links = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.querySelectorAll('.section').forEach(s => observer.observe(s));
}

// ── Copy with toast feedback ──
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    showToast('Copy failed', true);
  });
}

function showToast(message, isError) {
  // Remove existing toast
  const existing = document.querySelector('.pg-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'pg-toast' + (isError ? ' pg-toast-error' : '');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Force reflow then animate in
  toast.offsetHeight;
  toast.classList.add('pg-toast-visible');

  setTimeout(() => {
    toast.classList.remove('pg-toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}
