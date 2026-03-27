/* ══════════════════════════════════════════════════════════════
   Elite Hub — Left Sidebar Navigation
   Self-contained: injects its own CSS + HTML.
   Add to any page: <script src="elite-sidebar.js"></script>
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Skip on login page ─────────────────────────────────── */
  var page = location.pathname.split('/').pop().replace('.html', '').toLowerCase();
  if (page === 'login') return;

  /* ── Detect region from URL ─────────────────────────────── */
  var regionFromPage = '';
  var hubMatch = page.match(/^hub_(.+)$/);
  if (hubMatch) regionFromPage = hubMatch[1];
  if (!regionFromPage) {
    var sp = new URLSearchParams(location.search);
    regionFromPage = (sp.get('region') || '').toLowerCase();
  }

  /* ── Detect current page for active highlight ──────────── */
  var pageName = page.replace(/_/g, '');
  // Normalize: elite_main_hub → index (same page essentially)
  if (pageName === 'elitemainhub') pageName = 'index';

  /* ── Build region query string ─────────────────────────── */
  var rq = regionFromPage ? '?region=' + regionFromPage : '';
  var BASE = 'https://elitecrest.github.io/elite-hub/';

  /* ── Sidebar width constants ───────────────────────────── */
  var W_COLLAPSED = 52;   // px — icon strip
  var W_EXPANDED  = 200;  // px — full labels

  /* ── Inject CSS ─────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    /* Hide old horizontal navs */
    '.tool-nav { display: none !important; }',
    '.back-nav { display: none !important; }',

    /* Sidebar container */
    '#elite-sidebar {',
    '  position: fixed; top: 0; left: 0; bottom: 0;',
    '  width: ' + W_COLLAPSED + 'px;',
    '  background: #0F172A;',
    '  z-index: 300;',
    '  display: flex; flex-direction: column;',
    '  transition: width .2s ease;',
    '  overflow: hidden;',
    '  box-shadow: 2px 0 12px rgba(0,0,0,.25);',
    '  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;',
    '}',
    '#elite-sidebar:hover,',
    '#elite-sidebar.sb-pinned {',
    '  width: ' + W_EXPANDED + 'px;',
    '}',

    /* Logo area */
    '.sb-logo {',
    '  display: flex; align-items: center; gap: 10px;',
    '  padding: 14px 12px;',
    '  border-bottom: 1px solid rgba(255,255,255,.08);',
    '  flex-shrink: 0; cursor: pointer; text-decoration: none;',
    '}',
    '.sb-logo-mark {',
    '  width: 28px; height: 28px; border-radius: 6px;',
    '  background: #1F5FAD; display: flex; align-items: center;',
    '  justify-content: center; flex-shrink: 0;',
    '}',
    '.sb-logo-mark span { color: #fff; font-size: 9px; font-weight: 700; letter-spacing: .4px; }',
    '.sb-logo-text {',
    '  white-space: nowrap; overflow: hidden;',
    '  opacity: 0; transition: opacity .15s;',
    '}',
    '#elite-sidebar:hover .sb-logo-text,',
    '#elite-sidebar.sb-pinned .sb-logo-text { opacity: 1; }',
    '.sb-logo-brand { color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }',
    '.sb-logo-sub   { color: rgba(255,255,255,.35); font-size: 9px; letter-spacing: .5px; margin-top: 1px; }',

    /* Section labels */
    '.sb-section {',
    '  font-size: 8px; font-weight: 700; letter-spacing: 2px;',
    '  text-transform: uppercase; color: rgba(255,255,255,.25);',
    '  padding: 16px 14px 5px; white-space: nowrap;',
    '  overflow: hidden;',
    '  opacity: 0; transition: opacity .15s;',
    '}',
    '#elite-sidebar:hover .sb-section,',
    '#elite-sidebar.sb-pinned .sb-section { opacity: 1; }',

    /* Nav links */
    '.sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 4px 0; }',
    '.sb-nav::-webkit-scrollbar { width: 3px; }',
    '.sb-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }',

    '.sb-link {',
    '  display: flex; align-items: center; gap: 10px;',
    '  padding: 8px 14px; margin: 1px 6px;',
    '  border-radius: 6px; text-decoration: none;',
    '  color: rgba(255,255,255,.6);',
    '  transition: background .15s, color .15s;',
    '  white-space: nowrap; cursor: pointer;',
    '  font-size: 12px; font-weight: 600;',
    '  letter-spacing: .2px;',
    '}',
    '.sb-link:hover { background: rgba(255,255,255,.07); color: #fff; }',
    '.sb-link.sb-active { background: rgba(31,95,173,.35); color: #fff; }',
    '.sb-link.sb-disabled {',
    '  opacity: .3; cursor: default; pointer-events: none;',
    '}',

    '.sb-icon {',
    '  width: 24px; height: 24px; display: flex; align-items: center;',
    '  justify-content: center; font-size: 14px; flex-shrink: 0;',
    '}',
    '.sb-label {',
    '  overflow: hidden; white-space: nowrap;',
    '  opacity: 0; transition: opacity .15s;',
    '}',
    '#elite-sidebar:hover .sb-label,',
    '#elite-sidebar.sb-pinned .sb-label { opacity: 1; }',

    /* Divider */
    '.sb-divider {',
    '  height: 1px; background: rgba(255,255,255,.08);',
    '  margin: 6px 12px;',
    '}',

    /* Bottom section */
    '.sb-bottom {',
    '  border-top: 1px solid rgba(255,255,255,.08);',
    '  padding: 8px 0; flex-shrink: 0;',
    '}',

    /* Push page content right — sticky headers shift automatically with body margin */
    'body.has-sidebar { margin-left: ' + W_COLLAPSED + 'px !important; }',

    /* Login page special: centered card, no sidebar offset */
    'body.has-sidebar .login-card { margin-left: -' + W_COLLAPSED / 2 + 'px; }',

    /* Dark mode compat */
    'body.dark #elite-sidebar { background: #070B14; }',

    /* Mobile: hide sidebar below 768px, restore original horizontal navs */
    '@media (max-width: 768px) {',
    '  #elite-sidebar { display: none !important; }',
    '  body.has-sidebar { margin-left: 0 !important; }',
    '  .tool-nav { display: flex !important; }',
    '  .back-nav { display: block !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* ── Build sidebar HTML ─────────────────────────────────── */
  var sb = document.createElement('div');
  sb.id = 'elite-sidebar';

  function link(icon, label, href, id) {
    var isActive = false;
    if (id) {
      /* Match page name to id */
      isActive = pageName === id.replace(/_/g, '');
    }
    var cls = 'sb-link' + (isActive ? ' sb-active' : '');
    if (!href) cls += ' sb-disabled';
    var tag = href ? 'a' : 'span';
    return '<' + tag + ' class="' + cls + '"' +
      (href ? ' href="' + href + '"' : '') +
      '><span class="sb-icon">' + icon + '</span>' +
      '<span class="sb-label">' + label + '</span></' + tag + '>';
  }

  function section(label) {
    return '<div class="sb-section">' + label + '</div>';
  }

  var html = '';

  /* Logo → Main Hub */
  html += '<a class="sb-logo" href="' + BASE + 'index.html">';
  html += '<div class="sb-logo-mark"><span>ECS</span></div>';
  html += '<div class="sb-logo-text"><div class="sb-logo-brand">Elite Hub</div>';
  html += '<div class="sb-logo-sub">Command Center</div></div></a>';

  /* ── Main Navigation ── */
  html += '<div class="sb-nav">';
  html += section('Navigate');
  html += link('🏠', 'Main Hub', BASE + 'index.html', 'index');
  html += link('⚙️', 'Admin', BASE + 'admin.html', 'admin');

  /* ── Region Hub (if in a region context) ── */
  if (regionFromPage) {
    var regionLabel = regionFromPage.charAt(0).toUpperCase() + regionFromPage.slice(1);
    html += '<div class="sb-divider"></div>';
    html += section(regionLabel + ' Hub');
    html += link('📍', regionLabel + ' Hub', BASE + 'hub_' + regionFromPage + '.html', 'hub' + regionFromPage);
  }

  /* ── Tools ── */
  html += '<div class="sb-divider"></div>';
  html += section('Tools');
  html += link('📋', 'Compliance', regionFromPage ? BASE + 'compliance.html' + rq : BASE + 'compliance.html', 'compliance');
  html += link('🚗', 'Fleet', regionFromPage ? BASE + 'fleet.html' + rq : BASE + 'fleet.html', 'fleet');
  html += link('⚖️', 'Legal', regionFromPage ? BASE + 'legal.html' + rq : BASE + 'legal.html', 'legal');
  html += link('⭐', 'Reviews', regionFromPage ? BASE + 'reviews.html' + rq : BASE + 'reviews.html', 'reviews');
  html += link('📁', 'Documents', regionFromPage ? BASE + 'documents.html' + rq : BASE + 'documents.html', 'documents');
  html += link('⚖️', 'Licensing', '', 'licensing');
  html += link('🏷️', 'Pricing', '', 'pricing');

  /* ── Admin Tools ── */
  html += '<div class="sb-divider"></div>';
  html += section('Admin Tools');
  html += link('📋', 'Compliance Admin', BASE + 'compliance_admin.html', 'complianceadmin');
  html += link('🚗', 'Fleet Admin', BASE + 'fleet_admin.html', 'fleetadmin');
  html += link('⚖️', 'Legal Admin', BASE + 'legal_admin.html', 'legaladmin');
  html += link('⭐', 'Reviews Admin', BASE + 'reviews_admin.html', 'reviewsadmin');
  html += link('📁', 'Docs Admin', BASE + 'documents_admin.html', 'documentsadmin');
  html += link('📏', 'Scoring Rules', BASE + 'scoring_rules.html', 'scoringrules');
  html += link('👥', 'Users', BASE + 'users_admin.html', 'usersadmin');

  /* ── Dashboards ── */
  html += '<div class="sb-divider"></div>';
  html += section('Dashboards');
  html += link('👤', 'Angel', BASE + 'angel.html', 'angel');
  html += link('👤', 'Sara', BASE + 'sara.html', 'sara');
  html += link('👤', 'Emma', BASE + 'emma.html', 'emma');
  html += link('👤', 'Carlynn', BASE + 'carlynn.html', 'carlynn');
  html += link('👤', 'Jaida', BASE + 'jaida.html', 'jaida');

  html += '</div>'; /* end sb-nav */

  /* ── Bottom: Sign Out ── */
  html += '<div class="sb-bottom">';
  html += '<div class="sb-divider"></div>';
  html += '<a class="sb-link" href="#" onclick="localStorage.removeItem(\'elite_session\');window.location.href=\'login.html\';return false;">';
  html += '<span class="sb-icon">🚪</span><span class="sb-label">Sign Out</span></a>';
  html += '</div>';

  sb.innerHTML = html;

  /* ── Insert into DOM ───────────────────────────────────── */
  document.body.insertBefore(sb, document.body.firstChild);
  document.body.classList.add('has-sidebar');

})();
