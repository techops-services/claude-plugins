(function() {
  'use strict';

  // Prevent double-init
  if (window.__uiFeedbackLoaded) return;
  window.__uiFeedbackLoaded = true;

  // ============================================================
  // CSS INJECTION
  // ============================================================
  var css = [
    '.fb-toolbar{position:fixed;bottom:16px;right:16px;z-index:2147483640;display:flex;gap:6px;align-items:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}',
    '.fb-toolbar-btn{background:#1c2128;border:1px solid #30363d;color:#c9d1d9;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;transition:all 150ms ease;white-space:nowrap}',
    '.fb-toolbar-btn:hover{background:#30363d;border-color:#484f58}',
    '.fb-stop-btn{background:rgba(253,182,9,0.13);border-color:#FDB609;color:#FDB609}',
    '.fb-stop-btn:hover{background:rgba(253,182,9,0.27);border-color:#FDB609}',
    '.fb-count-badge{background:#484f58;color:#f0f6fc;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;min-width:18px;text-align:center}',

    '.fb-popover{position:fixed;z-index:2147483645;width:320px;background:#161b22;border:1px solid #30363d;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.4);padding:0;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}',
    '.fb-popover.fb-visible{display:flex}',
    '.fb-popover-header{padding:10px 12px 8px;border-bottom:1px solid #21262d}',
    '.fb-popover-breadcrumb{font-size:11px;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.fb-popover-existing{max-height:120px;overflow-y:auto;padding:0 12px}',
    '.fb-popover-existing:empty{display:none}',
    '.fb-existing-note{display:flex;align-items:flex-start;gap:6px;padding:6px 0;border-bottom:1px solid #21262d;font-size:12px;color:#c9d1d9;line-height:1.4}',
    '.fb-existing-note:last-child{border-bottom:none}',
    '.fb-existing-text{flex:1;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '.fb-existing-del{background:none;border:none;color:#484f58;cursor:pointer;font-size:14px;padding:0 2px;flex-shrink:0;line-height:1}',
    '.fb-existing-del:hover{color:#f85149}',
    '.fb-popover-body{padding:10px 12px}',
    '.fb-textarea{width:100%;height:64px;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;padding:8px;font-size:12px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;resize:vertical;outline:none;line-height:1.4}',
    '.fb-textarea:focus{border-color:#1f6feb}',
    '.fb-textarea::placeholder{color:#484f58}',
    '.fb-popover-footer{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-top:1px solid #21262d}',
    '.fb-popover-footer-hint{font-size:10px;color:#484f58}',
    '.fb-popover-actions{display:flex;gap:6px}',
    '.fb-btn-cancel{background:none;border:1px solid #30363d;color:#8b949e;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px}',
    '.fb-btn-cancel:hover{background:#21262d;border-color:#484f58;color:#c9d1d9}',
    '.fb-btn-save{background:#238636;border:1px solid #2ea043;color:#fff;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600}',
    '.fb-btn-save:hover{background:#2ea043}',

    '.fb-panel{position:fixed;top:0;right:0;width:380px;height:100vh;background:#161b22;border-left:1px solid #30363d;z-index:2147483642;display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}',
    '.fb-panel.fb-visible{transform:translateX(0)}',
    '.fb-panel-header{padding:12px 16px;border-bottom:1px solid #30363d;display:flex;align-items:center;gap:8px;flex-shrink:0}',
    '.fb-panel-title{flex:1;font-size:14px;font-weight:600;color:#f0f6fc}',
    '.fb-panel-close{background:none;border:none;color:#8b949e;cursor:pointer;font-size:18px;padding:2px 6px;line-height:1;border-radius:4px;transition:all 150ms ease}',
    '.fb-panel-close:hover{color:#f0f6fc;background:#21262d}',
    '.fb-filters{padding:8px 16px;border-bottom:1px solid #30363d;display:flex;gap:4px;flex-wrap:wrap;align-items:center;flex-shrink:0}',
    '.fb-filter-btn{background:#21262d;border:1px solid #30363d;color:#8b949e;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 150ms ease}',
    '.fb-filter-btn:hover{background:#30363d;border-color:#484f58;color:#c9d1d9}',
    '.fb-filter-btn.fb-active{color:#f0f6fc;border-color:#484f58;background:#30363d}',
    '.fb-filter-count{font-size:9px;color:#484f58;margin-left:2px}',
    '.fb-panel-body{flex:1;overflow-y:auto;padding:12px 16px}',
    '.fb-annotation-item{background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;margin-bottom:6px;cursor:pointer;transition:all 150ms ease;display:flex;gap:8px;align-items:flex-start}',
    '.fb-annotation-item:hover{border-color:#484f58;background:#21262d}',
    '.fb-annotation-num{font-size:11px;font-weight:700;color:#484f58;flex-shrink:0;min-width:20px}',
    '.fb-annotation-content{flex:1;min-width:0}',
    '.fb-annotation-target{font-size:11px;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px}',
    '.fb-annotation-text{font-size:12px;color:#c9d1d9;line-height:1.4;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '.fb-empty{font-size:12px;color:#484f58;padding:24px 0;text-align:center;line-height:1.5}',
    '.fb-panel-footer{padding:10px 16px;border-top:1px solid #30363d;display:flex;gap:8px;flex-shrink:0}',
    '.fb-btn-copy{flex:1;background:#238636;border:1px solid #2ea043;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;text-align:center;transition:all 150ms ease}',
    '.fb-btn-copy:hover{background:#2ea043}',
    '.fb-btn-copy.fb-copied{background:#1f6feb;border-color:#58a6ff}',
    '.fb-btn-clear{background:#21262d;border:1px solid rgba(248,81,73,0.2);color:#f85149;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;transition:all 150ms ease}',
    '.fb-btn-clear:hover{background:rgba(248,81,73,0.13);border-color:#f85149}',

    '.fb-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(80px);background:#238636;color:#fff;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:600;z-index:2147483647;opacity:0;transition:all 0.3s ease;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}',
    '.fb-toast.fb-visible{opacity:1;transform:translateX(-50%) translateY(0)}',

    'body.fb-mode [data-fb]{outline:2px solid transparent;outline-offset:2px;transition:outline-color 150ms ease}',
    'body.fb-mode [data-fb]:hover{outline-color:#FDB609}',
    'body.fb-mode [data-fb].fb-has-notes:hover{outline-color:#58a6ff}',

    '.fb-badge{position:absolute;top:-6px;right:-6px;min-width:16px;height:16px;border-radius:8px;font-size:9px;font-weight:700;color:#0d1117;display:flex;align-items:center;justify-content:center;padding:0 4px;pointer-events:none;z-index:2147483641;background:#FDB609}',

    '@keyframes fb-pulse{0%{box-shadow:0 0 0 0 rgba(253,182,9,0.7)}100%{box-shadow:0 0 0 0 rgba(253,182,9,0)}}',
    '.fb-pulse{animation:fb-pulse 0.8s ease-out 2}',

    '.fb-bridge-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:background 300ms ease}',
    '.fb-response-item{background:#0d1117;border:1px solid #1f6feb;border-radius:6px;padding:10px 12px;margin-bottom:6px}',
    '.fb-response-header{font-size:10px;color:#58a6ff;margin-bottom:4px}',
    '.fb-response-text{font-size:12px;color:#c9d1d9;line-height:1.5;white-space:pre-wrap}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ============================================================
  // HTML INJECTION
  // ============================================================
  var container = document.createElement('div');
  container.id = 'ui-feedback-root';
  container.innerHTML = [
    '<div class="fb-toolbar">',
    '  <button class="fb-toolbar-btn fb-stop-btn" id="fb-stop-btn" style="display:none">Stop</button>',
    '  <span class="fb-bridge-dot" id="fb-bridge-dot" title="Bridge: checking..." style="background:#484f58"></span>',
    '  <button class="fb-toolbar-btn" id="fb-toolbar-btn">Feedback <span class="fb-count-badge" id="fb-count-badge" style="display:none">0</span></button>',
    '</div>',
    '<div class="fb-popover" id="fb-popover">',
    '  <div class="fb-popover-header"><div class="fb-popover-breadcrumb" id="fb-popover-breadcrumb"></div></div>',
    '  <div class="fb-popover-existing" id="fb-popover-existing"></div>',
    '  <div class="fb-popover-body"><textarea class="fb-textarea" id="fb-textarea" placeholder="Add annotation..."></textarea></div>',
    '  <div class="fb-popover-footer">',
    '    <span class="fb-popover-footer-hint">Cmd+Enter to save</span>',
    '    <div class="fb-popover-actions">',
    '      <button class="fb-btn-cancel" id="fb-cancel">Cancel</button>',
    '      <button class="fb-btn-save" id="fb-save">Save</button>',
    '    </div>',
    '  </div>',
    '</div>',
    '<div class="fb-panel" id="fb-panel">',
    '  <div class="fb-panel-header">',
    '    <span class="fb-panel-title">Annotations</span>',
    '    <button class="fb-panel-close" id="fb-panel-close">&times;</button>',
    '  </div>',
    '  <div class="fb-filters" id="fb-section-filters"></div>',
    '  <div class="fb-panel-body" id="fb-panel-body"></div>',
    '  <div class="fb-panel-footer">',
    '    <button class="fb-btn-copy" id="fb-copy">Copy for Claude</button>',
    '    <button class="fb-btn-clear" id="fb-clear">Clear All</button>',
    '  </div>',
    '</div>',
    '<div class="fb-toast" id="fb-toast"></div>'
  ].join('\n');
  document.body.appendChild(container);

  // ============================================================
  // CONSTANTS
  // ============================================================
  // Read source file path from the script tag (injected by /add-feedback)
  var scriptTag = document.getElementById('ui-feedback-system');
  var SOURCE_FILE = scriptTag ? scriptTag.getAttribute('data-source-file') : '';

  var STORAGE_KEY = 'ui-feedback-' + location.pathname;
  var LAST_COPY_KEY = STORAGE_KEY + '-last-copy';
  var MAX_AUTO_TAG = 100;

  // Bridge communication
  var BRIDGE_PORT = (scriptTag && scriptTag.getAttribute('data-bridge-port')) || '4243';
  var BRIDGE_URL = 'http://localhost:' + BRIDGE_PORT;
  var bridgeConnected = false;
  var bridgeSSE = null;

  var LANDMARK_SECTIONS = {
    HEADER: 'Header',
    NAV: 'Navigation',
    MAIN: 'Main Content',
    SECTION: 'Section',
    ARTICLE: 'Article',
    ASIDE: 'Sidebar',
    FOOTER: 'Footer',
    FORM: 'Form'
  };

  var ROLE_SECTIONS = {
    banner: 'Header',
    navigation: 'Navigation',
    main: 'Main Content',
    complementary: 'Sidebar',
    contentinfo: 'Footer'
  };

  // ============================================================
  // STATE
  // ============================================================
  var annotations = loadAnnotations();
  var lastCopy = loadLastCopy();
  var annotateMode = false;
  var panelOpen = false;
  var popoverOpen = false;
  var popoverTarget = null;
  var sectionFilter = 'all';

  // ============================================================
  // PERSISTENCE
  // ============================================================
  function loadAnnotations() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAnnotationsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    } catch (e) { /* noop */ }
  }

  function loadLastCopy() {
    try {
      var raw = localStorage.getItem(LAST_COPY_KEY);
      return raw ? Number(raw) : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveLastCopy(ts) {
    lastCopy = ts;
    try {
      localStorage.setItem(LAST_COPY_KEY, String(ts));
    } catch (e) { /* noop */ }
  }

  // ============================================================
  // UTILITIES
  // ============================================================
  var idCounter = Date.now();
  function nextId() {
    idCounter++;
    return 'fb-' + idCounter;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function truncate(str, max) {
    if (!str) return '';
    str = str.trim().replace(/\s+/g, ' ');
    return str.length > max ? str.slice(0, max - 1) + '\u2026' : str;
  }

  // ============================================================
  // BRIDGE COMMUNICATION
  // ============================================================
  function updateBridgeIndicator() {
    var dot = document.getElementById('fb-bridge-dot');
    if (!dot) return;
    dot.style.background = bridgeConnected ? '#2ea043' : '#484f58';
    dot.title = bridgeConnected ? 'Bridge: connected' : 'Bridge: offline';
  }

  function updateSendButton() {
    var btn = document.getElementById('fb-copy');
    if (!btn) return;
    btn.textContent = bridgeConnected ? 'Send to Claude' : 'Copy for Claude';
  }

  function checkBridge() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', BRIDGE_URL + '/health', true);
    xhr.timeout = 2000;
    xhr.onload = function() {
      if (xhr.status === 200) {
        var wasDisconnected = !bridgeConnected;
        bridgeConnected = true;
        updateBridgeIndicator();
        updateSendButton();
        if (wasDisconnected) connectSSE();
      } else {
        bridgeConnected = false;
        updateBridgeIndicator();
        updateSendButton();
      }
    };
    xhr.onerror = function() {
      bridgeConnected = false;
      updateBridgeIndicator();
      updateSendButton();
    };
    xhr.ontimeout = function() {
      bridgeConnected = false;
      updateBridgeIndicator();
      updateSendButton();
    };
    xhr.send();
  }

  function connectSSE() {
    if (bridgeSSE) {
      bridgeSSE.close();
      bridgeSSE = null;
    }
    if (!bridgeConnected) return;

    try {
      bridgeSSE = new EventSource(BRIDGE_URL + '/events');

      bridgeSSE.addEventListener('response', function(e) {
        try {
          var data = JSON.parse(e.data);
          showResponseInPanel(data);
        } catch (err) { /* ignore parse errors */ }
      });

      bridgeSSE.addEventListener('connected', function() {
        bridgeConnected = true;
        updateBridgeIndicator();
        updateSendButton();
      });

      bridgeSSE.onerror = function() {
        if (bridgeSSE) {
          bridgeSSE.close();
          bridgeSSE = null;
        }
        bridgeConnected = false;
        updateBridgeIndicator();
        updateSendButton();
        // Retry after 3 seconds
        setTimeout(checkBridge, 3000);
      };
    } catch (err) {
      bridgeConnected = false;
      updateBridgeIndicator();
      updateSendButton();
    }
  }

  function sendFeedbackToBridge() {
    var filtered = annotations.filter(function(a) { return a.timestamp > lastCopy; });
    filtered.sort(function(a, b) { return a.timestamp - b.timestamp; });

    if (filtered.length === 0) {
      showToast('No new annotations to send');
      return;
    }

    var payload = JSON.stringify({
      sourceFile: SOURCE_FILE,
      pageTitle: document.title || location.pathname.split('/').pop() || 'this page',
      pageUrl: location.href,
      annotations: filtered
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', BRIDGE_URL + '/feedback', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        var total = filtered.length;
        saveLastCopy(Date.now());
        showToast('Sent ' + total + ' annotation' + (total !== 1 ? 's' : '') + ' to Claude');
        var btn = document.getElementById('fb-copy');
        btn.textContent = 'Sent!';
        btn.classList.add('fb-copied');
        setTimeout(function() {
          updateSendButton();
          btn.classList.remove('fb-copied');
        }, 1500);
        renderPanel();
      } else {
        showToast('Bridge error -- falling back to clipboard');
        copyForClaude();
      }
    };
    xhr.onerror = function() {
      bridgeConnected = false;
      updateBridgeIndicator();
      updateSendButton();
      showToast('Bridge unavailable -- falling back to clipboard');
      copyForClaude();
    };
    xhr.send(payload);
  }

  function sendToClaude() {
    if (bridgeConnected) {
      sendFeedbackToBridge();
    } else {
      copyForClaude();
    }
  }

  function showResponseInPanel(data) {
    if (!panelOpen) openPanel();

    var body = document.getElementById('fb-panel-body');
    var item = document.createElement('div');
    item.className = 'fb-response-item';

    var time = new Date(data.sentAt || Date.now());
    var timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    item.innerHTML = '<div class="fb-response-header">Claude responded at ' + timeStr + '</div>'
      + '<div class="fb-response-text">' + escapeHtml(data.message) + '</div>';

    body.appendChild(item);
    body.scrollTop = body.scrollHeight;
    showToast('Claude responded');
  }

  // ============================================================
  // SECTION INFERENCE
  // ============================================================
  function inferSection(el) {
    // Check explicit attribute first
    var explicit = el.getAttribute('data-fb-section');
    if (explicit) return explicit;

    // Walk up to find landmark
    var node = el;
    while (node && node !== document.body) {
      var tag = node.tagName;
      if (tag && LANDMARK_SECTIONS[tag]) return LANDMARK_SECTIONS[tag];
      var role = node.getAttribute('role');
      if (role && ROLE_SECTIONS[role]) return ROLE_SECTIONS[role];
      node = node.parentElement;
    }
    return 'Page';
  }

  // ============================================================
  // LABEL INFERENCE
  // ============================================================
  function inferLabel(el) {
    var explicit = el.getAttribute('data-fb-label');
    if (explicit) return explicit;

    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return truncate(ariaLabel, 40);

    var tag = el.tagName.toLowerCase();
    var id = el.id;

    // For inputs/buttons, use value or text
    if (tag === 'button' || tag === 'a') {
      var txt = truncate(el.textContent, 40);
      if (txt) return txt;
    }
    if (tag === 'input') {
      var label = document.querySelector('label[for="' + id + '"]');
      if (label) return truncate(label.textContent, 40);
      var placeholder = el.getAttribute('placeholder');
      if (placeholder) return truncate(placeholder, 40);
    }

    // Tag + id or class
    if (id) return tag + '#' + id;
    var cls = el.className;
    if (typeof cls === 'string' && cls.trim()) {
      return tag + '.' + cls.trim().split(/\s+/).slice(0, 2).join('.');
    }

    // Truncated text content
    var text = truncate(el.textContent, 30);
    if (text) return tag + ': ' + text;

    return tag;
  }

  // ============================================================
  // CSS SELECTOR COMPUTATION
  // ============================================================
  function computeSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);

    var parts = [];
    var node = el;
    while (node && node !== document.body && parts.length < 5) {
      var tag = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift('#' + CSS.escape(node.id));
        break;
      }
      var parent = node.parentElement;
      if (parent) {
        var siblings = Array.prototype.filter.call(parent.children, function(c) {
          return c.tagName === node.tagName;
        });
        if (siblings.length > 1) {
          var idx = siblings.indexOf(node) + 1;
          tag += ':nth-of-type(' + idx + ')';
        }
      }
      parts.unshift(tag);
      node = parent;
    }
    return parts.join(' > ');
  }

  // ============================================================
  // DETERMINISTIC ID
  // ============================================================
  function computeDeterministicId(el) {
    var parts = [];
    var node = el;
    while (node && node !== document.body && parts.length < 4) {
      var tag = node.tagName.toLowerCase();
      var parent = node.parentElement;
      if (parent) {
        var idx = 0;
        var child = parent.firstElementChild;
        while (child) {
          if (child.tagName === node.tagName) idx++;
          if (child === node) break;
          child = child.nextElementSibling;
        }
        parts.unshift(tag + idx);
      } else {
        parts.unshift(tag);
      }
      node = parent;
    }
    return parts.join('-');
  }

  // ============================================================
  // AUTO-TAGGING
  // ============================================================
  function autoTag() {
    // Skip elements inside our own UI
    var root = document.getElementById('ui-feedback-root');

    // Semantic elements to auto-tag
    var selectors = [
      'header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'form',
      '[id]', '[role]',
      'h1', 'h2', 'h3',
      'table', 'ul', 'ol',
      '.card', '.panel', '.widget', '.module', '.block', '.container'
    ];

    var tagged = new Set();
    // First pass: respect existing data-fb
    var existing = document.querySelectorAll('[data-fb]');
    for (var e = 0; e < existing.length; e++) {
      tagged.add(existing[e]);
    }

    // Second pass: auto-discover
    for (var s = 0; s < selectors.length; s++) {
      var els;
      try {
        els = document.querySelectorAll(selectors[s]);
      } catch (err) {
        continue;
      }
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        // Skip feedback UI elements
        if (root && root.contains(el)) continue;
        // Skip already tagged
        if (tagged.has(el)) continue;
        // Skip tiny/invisible elements
        if (el.offsetHeight < 10 && el.offsetWidth < 10) continue;
        // Skip script/style/meta
        var tag = el.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'META' || tag === 'LINK') continue;

        // Generate a deterministic fb id from DOM position
        var fbId = el.id || computeDeterministicId(el);
        el.setAttribute('data-fb', fbId);
        tagged.add(el);
        if (tagged.size >= MAX_AUTO_TAG) return;
      }
    }
  }

  // ============================================================
  // ANNOTATION HELPERS
  // ============================================================
  function getAnnotationsFor(fbId) {
    return annotations.filter(function(a) { return a.target === fbId; });
  }

  // ============================================================
  // BADGES
  // ============================================================
  function updateBadges() {
    var oldBadges = document.querySelectorAll('.fb-badge');
    for (var i = 0; i < oldBadges.length; i++) {
      oldBadges[i].remove();
    }
    if (!annotateMode) return;

    var els = document.querySelectorAll('[data-fb]');
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      var fbId = el.getAttribute('data-fb');
      var anns = getAnnotationsFor(fbId);
      if (anns.length === 0) {
        el.classList.remove('fb-has-notes');
        continue;
      }
      el.classList.add('fb-has-notes');
      if (el.closest('svg')) continue;

      var badge = document.createElement('span');
      badge.className = 'fb-badge';
      badge.textContent = anns.length;

      if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
      el.appendChild(badge);
    }
  }

  // ============================================================
  // TOOLBAR
  // ============================================================
  function updateToolbarButton() {
    var badge = document.getElementById('fb-count-badge');
    var count = annotations.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  }

  // ============================================================
  // POPOVER
  // ============================================================
  function positionPopover(popover, targetRect) {
    var pw = 320;
    var ph = popover.offsetHeight || 300;
    var pad = 8;
    var left = targetRect.left + targetRect.width / 2 - pw / 2;
    var top = targetRect.bottom + pad;
    if (top + ph > window.innerHeight - pad) {
      top = targetRect.top - ph - pad;
    }
    if (left < pad) left = pad;
    if (left + pw > window.innerWidth - pad) left = window.innerWidth - pw - pad;
    if (top < pad) top = pad;
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
  }

  function openPopover(el) {
    var fbId = el.getAttribute('data-fb');
    if (!fbId) return;

    popoverTarget = fbId;
    popoverOpen = true;

    var popover = document.getElementById('fb-popover');
    var breadcrumb = document.getElementById('fb-popover-breadcrumb');
    var existing = document.getElementById('fb-popover-existing');
    var textarea = document.getElementById('fb-textarea');

    var section = inferSection(el);
    var label = inferLabel(el);
    breadcrumb.textContent = section + ' > ' + label;

    var anns = getAnnotationsFor(fbId);
    var existingHtml = '';
    for (var i = 0; i < anns.length; i++) {
      var a = anns[i];
      existingHtml += '<div class="fb-existing-note">';
      existingHtml += '<span class="fb-existing-text">' + escapeHtml(a.text) + '</span>';
      existingHtml += '<button class="fb-existing-del" data-fb-del="' + a.id + '">&times;</button>';
      existingHtml += '</div>';
    }
    existing.innerHTML = existingHtml;

    var delBtns = existing.querySelectorAll('.fb-existing-del');
    for (var d = 0; d < delBtns.length; d++) {
      delBtns[d].addEventListener('click', function(ev) {
        ev.stopPropagation();
        var delId = this.getAttribute('data-fb-del');
        deleteAnnotation(delId);
        openPopover(el);
      });
    }

    textarea.value = '';
    popover.classList.add('fb-visible');
    positionPopover(popover, el.getBoundingClientRect());
    setTimeout(function() { textarea.focus(); }, 50);
  }

  function closePopover() {
    popoverOpen = false;
    popoverTarget = null;
    document.getElementById('fb-popover').classList.remove('fb-visible');
  }

  function saveAnnotation() {
    var textarea = document.getElementById('fb-textarea');
    var text = textarea.value.trim();
    if (!text || !popoverTarget) return;

    var el = document.querySelector('[data-fb="' + CSS.escape(popoverTarget) + '"]');
    var section = el ? inferSection(el) : 'Page';
    var label = el ? inferLabel(el) : popoverTarget;
    var outerSnippet = '';
    if (el) {
      var outer = el.outerHTML;
      // Strip children to keep just the opening tag
      var closeIdx = outer.indexOf('>');
      outerSnippet = closeIdx > 0 ? outer.slice(0, closeIdx + 1) : truncate(outer, 200);
    }

    annotations.push({
      id: nextId(),
      target: popoverTarget,
      section: section,
      label: label,
      selector: el ? computeSelector(el) : '',
      outerHtml: outerSnippet,
      text: text,
      timestamp: Date.now()
    });

    saveAnnotationsToStorage();
    closePopover();
    refreshUI();
  }

  function deleteAnnotation(id) {
    annotations = annotations.filter(function(a) { return a.id !== id; });
    saveAnnotationsToStorage();
    refreshUI();
  }

  function clearAllAnnotations() {
    if (annotations.length === 0) return;
    annotations = [];
    saveAnnotationsToStorage();
    refreshUI();
  }

  // ============================================================
  // PANEL
  // ============================================================
  function openPanel() {
    panelOpen = true;
    document.getElementById('fb-panel').classList.add('fb-visible');
    renderPanel();

    if (!annotateMode) {
      annotateMode = true;
      document.body.classList.add('fb-mode');
      document.getElementById('fb-stop-btn').style.display = '';
      autoTag();
      updateBadges();
    }
  }

  function closePanel() {
    panelOpen = false;
    document.getElementById('fb-panel').classList.remove('fb-visible');
  }

  function getFilteredAnnotations() {
    var filtered = annotations.slice();
    if (sectionFilter === 'all') {
      filtered = filtered.filter(function(a) { return a.timestamp > lastCopy; });
    } else {
      filtered = filtered.filter(function(a) { return a.section === sectionFilter; });
    }
    filtered.sort(function(a, b) { return a.timestamp - b.timestamp; });
    return filtered;
  }

  function renderPanel() {
    if (!panelOpen) return;

    var sections = {};
    for (var s = 0; s < annotations.length; s++) {
      var sec = annotations[s].section;
      if (sec) sections[sec] = (sections[sec] || 0) + 1;
    }

    var filtersEl = document.getElementById('fb-section-filters');
    var uncopied = annotations.filter(function(a) { return a.timestamp > lastCopy; }).length;
    var sfHtml = '<button class="fb-filter-btn' + (sectionFilter === 'all' ? ' fb-active' : '') + '" data-fb-section-filter="all">New <span class="fb-filter-count">' + uncopied + '</span></button>';
    for (var sk in sections) {
      if (sections.hasOwnProperty(sk)) {
        var active = sectionFilter === sk ? ' fb-active' : '';
        sfHtml += '<button class="fb-filter-btn' + active + '" data-fb-section-filter="' + sk + '">' + escapeHtml(sk) + ' <span class="fb-filter-count">' + sections[sk] + '</span></button>';
      }
    }
    filtersEl.innerHTML = sfHtml;

    var sfBtns = filtersEl.querySelectorAll('[data-fb-section-filter]');
    for (var sf = 0; sf < sfBtns.length; sf++) {
      sfBtns[sf].addEventListener('click', function() {
        sectionFilter = this.getAttribute('data-fb-section-filter');
        renderPanel();
      });
    }

    var filtered = getFilteredAnnotations();
    var body = document.getElementById('fb-panel-body');

    if (filtered.length === 0) {
      if (sectionFilter === 'all' && annotations.length > 0) {
        body.innerHTML = '<div class="fb-empty">All annotations copied. Add new ones or browse by section.</div>';
      } else {
        body.innerHTML = '<div class="fb-empty">No annotations yet. Click elements on the page to add feedback.</div>';
      }
      return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var ann = filtered[i];
      var targetLabel = escapeHtml((ann.section || 'Page') + ' > ' + (ann.label || ann.target));
      html += '<div class="fb-annotation-item" data-fb-scroll-to="' + escapeHtml(ann.target) + '">';
      html += '<span class="fb-annotation-num">#' + (i + 1) + '</span>';
      html += '<div class="fb-annotation-content">';
      html += '<div class="fb-annotation-target">' + targetLabel + '</div>';
      html += '<div class="fb-annotation-text">' + escapeHtml(ann.text) + '</div>';
      html += '</div></div>';
    }
    body.innerHTML = html;

    var items = body.querySelectorAll('[data-fb-scroll-to]');
    for (var ci = 0; ci < items.length; ci++) {
      items[ci].addEventListener('click', function() {
        scrollToElement(this.getAttribute('data-fb-scroll-to'));
      });
    }
  }

  function scrollToElement(fbId) {
    var el = document.querySelector('[data-fb="' + CSS.escape(fbId) + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('fb-pulse');
    setTimeout(function() { el.classList.remove('fb-pulse'); }, 2000);
  }

  // ============================================================
  // COPY FOR CLAUDE
  // ============================================================
  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess, function() {
        fallbackCopy(text, onSuccess);
      });
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      showToast('Copy failed -- use Cmd+C manually');
    }
    document.body.removeChild(ta);
  }

  function copyForClaude() {
    var filtered = annotations.filter(function(a) { return a.timestamp > lastCopy; });
    filtered.sort(function(a, b) { return a.timestamp - b.timestamp; });

    if (filtered.length === 0) {
      showToast('No new annotations to copy');
      return;
    }

    var pageName = document.title || location.pathname.split('/').pop() || 'this page';
    var lines = [];
    lines.push('I have feedback on ' + pageName + '.');
    if (SOURCE_FILE) {
      lines.push('Source file: ' + SOURCE_FILE);
    }
    lines.push('');

    for (var i = 0; i < filtered.length; i++) {
      var a = filtered[i];
      var section = a.section || 'Page';
      var label = a.label || a.target;
      var selector = a.selector || '[data-fb="' + a.target + '"]';

      lines.push('## ' + (i + 1) + '. ' + section + ' > ' + label);
      lines.push('Element: ' + selector);
      if (a.outerHtml) {
        lines.push('HTML: ' + a.outerHtml);
      }
      lines.push('');
      lines.push('Feedback: ' + a.text);
      if (i < filtered.length - 1) {
        lines.push('');
      }
    }

    var text = lines.join('\n');
    var total = filtered.length;

    copyToClipboard(text, function() {
      saveLastCopy(Date.now());
      showToast('Copied ' + total + ' annotation' + (total !== 1 ? 's' : ''));

      var btn = document.getElementById('fb-copy');
      btn.textContent = 'Copied!';
      btn.classList.add('fb-copied');
      setTimeout(function() {
        updateSendButton();
        btn.classList.remove('fb-copied');
      }, 1500);

      renderPanel();
    });
  }

  // ============================================================
  // TOAST
  // ============================================================
  function showToast(msg) {
    var toast = document.getElementById('fb-toast');
    toast.textContent = msg;
    toast.classList.add('fb-visible');
    setTimeout(function() { toast.classList.remove('fb-visible'); }, 2500);
  }

  // ============================================================
  // ANNOTATE MODE
  // ============================================================
  function exitAnnotateMode() {
    if (!annotateMode) return;
    annotateMode = false;
    document.body.classList.remove('fb-mode');
    document.getElementById('fb-stop-btn').style.display = 'none';
    if (panelOpen) closePanel();
    updateBadges();
  }

  // ============================================================
  // REFRESH
  // ============================================================
  function refreshUI() {
    updateToolbarButton();
    renderPanel();
    updateBadges();
  }

  // ============================================================
  // EVENT WIRING
  // ============================================================
  document.getElementById('fb-toolbar-btn').addEventListener('click', function() {
    if (panelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });

  document.getElementById('fb-panel-close').addEventListener('click', closePanel);
  document.getElementById('fb-stop-btn').addEventListener('click', exitAnnotateMode);
  document.getElementById('fb-save').addEventListener('click', saveAnnotation);
  document.getElementById('fb-cancel').addEventListener('click', closePopover);
  document.getElementById('fb-copy').addEventListener('click', sendToClaude);
  document.getElementById('fb-clear').addEventListener('click', clearAllAnnotations);

  document.getElementById('fb-textarea').addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveAnnotation();
    }
  });

  document.addEventListener('click', function(e) {
    if (!annotateMode) return;

    var tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea' || tag === 'a') return;
    if (e.target.closest('.fb-popover') || e.target.closest('.fb-panel') || e.target.closest('.fb-toolbar')) return;
    if (e.target.closest('.fb-existing-del')) return;

    if (popoverOpen && !e.target.closest('.fb-popover')) {
      closePopover();
      return;
    }

    var el = e.target.closest('[data-fb]');
    if (!el) return;
    // Don't annotate our own UI
    var root = document.getElementById('ui-feedback-root');
    if (root && root.contains(el)) return;

    e.preventDefault();
    e.stopPropagation();
    openPopover(el);
  }, true);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (popoverOpen) { closePopover(); e.preventDefault(); return; }
      if (panelOpen) { closePanel(); e.preventDefault(); return; }
      if (annotateMode) { exitAnnotateMode(); e.preventDefault(); return; }
    }
  });

  // ============================================================
  // INIT
  // ============================================================
  autoTag();
  updateToolbarButton();
  checkBridge();

})();
