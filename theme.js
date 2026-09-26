/* =========================================================================
   MY NEW DOCUMENT — theme.js
   Socle commun à toutes les pages : moteur i18n 4 langues (FR/EN/DE/IT),
   méga-menu plein écran, reveal au scroll, marquees, FAB, sélecteur de langue.

   Usage dans une page :

     <script src="theme.js"></script>
     <script>
       MND.init({
         fr:{ pageTitle:"...", ... },
         en:{ ... }, de:{ ... }, it:{ ... }
       });
       MND.onLang(function(lang){ ... });   // re-render spécifique à la page
     </script>

   Les chaînes de structure (navigation, méga-menu, pied de page, CTA) sont
   déjà traduites ici : une page n'a qu'à fournir son propre contenu.
   ========================================================================= */
(function () {
  'use strict';

  var LANGS = ['fr', 'en', 'de', 'it'];
  var DEFAULT_LANG = 'fr';
  var STORAGE_KEY = 'mnd-lang';

  /* ------------------------------------------------------------------
     Chaînes partagées par toutes les pages (header, méga-menu, footer).
     ------------------------------------------------------------------ */
  var CHROME = {
    fr: {
      langLabel: "Langue",
      brandAria: "MY NEW DOCUMENT, accueil",
      brandSub: "Service de documents",
      menuOpen: "Ouvrir le menu", menuClose: "Fermer le menu",
      menuLabel: "Menu principal",
      navHome: "Accueil", navAbout: "À propos", navOrder: "Commander",
      navTrack: "Suivi", navHelp: "Aide", navContact: "Contact",
      navCta: "Commander",
      asideEyebrow: "Documents administratifs",
      asideTitle: "Votre demande en ligne, suivie de A à Z",
      asideText: "Passeport, carte d'identité, carte de séjour, permis de conduire. Instructions claires par email et code de suivi personnel.",
      asideCta: "Commencer ma demande",
      asideHours: "Lundi au vendredi · 09:00 – 18:00",
      ctaEyebrow: "Prêt à commencer ?",
      ctaTitle: "Prêt à commander votre document ?",
      ctaText: "Quelques minutes suffisent. Lancez votre demande dès maintenant.",
      ctaBtn: "Commander mon document",
      footNavLabel: "Navigation de pied de page",
      giantWord: "Documents",
      fabLabel: "Commander mon document"
    },
    en: {
      langLabel: "Language",
      brandAria: "MY NEW DOCUMENT, home",
      brandSub: "Document service",
      menuOpen: "Open menu", menuClose: "Close menu",
      menuLabel: "Main menu",
      navHome: "Home", navAbout: "About", navOrder: "Order",
      navTrack: "Tracking", navHelp: "Help", navContact: "Contact",
      navCta: "Order",
      asideEyebrow: "Administrative documents",
      asideTitle: "Your online request, tracked from A to Z",
      asideText: "Passport, ID card, residence permit, driving licence. Clear instructions by email and a personal tracking code.",
      asideCta: "Start my request",
      asideHours: "Monday to Friday · 09:00 – 18:00",
      ctaEyebrow: "Ready to start?",
      ctaTitle: "Ready to order your document?",
      ctaText: "A few minutes is all it takes. Start your request now.",
      ctaBtn: "Order my document",
      footNavLabel: "Footer navigation",
      giantWord: "Documents",
      fabLabel: "Order my document"
    },
    de: {
      langLabel: "Sprache",
      brandAria: "MY NEW DOCUMENT, Startseite",
      brandSub: "Dokumentenservice",
      menuOpen: "Menü öffnen", menuClose: "Menü schließen",
      menuLabel: "Hauptmenü",
      navHome: "Startseite", navAbout: "Über uns", navOrder: "Bestellen",
      navTrack: "Sendungsverfolgung", navHelp: "Hilfe", navContact: "Kontakt",
      navCta: "Bestellen",
      asideEyebrow: "Verwaltungsdokumente",
      asideTitle: "Ihr Online-Antrag, von A bis Z verfolgt",
      asideText: "Reisepass, Personalausweis, Aufenthaltstitel, Führerschein. Klare Anweisungen per E-Mail und persönlicher Verfolgungscode.",
      asideCta: "Antrag starten",
      asideHours: "Montag bis Freitag · 09:00 – 18:00",
      ctaEyebrow: "Bereit anzufangen?",
      ctaTitle: "Bereit, Ihr Dokument zu bestellen?",
      ctaText: "Wenige Minuten genügen. Starten Sie Ihren Antrag jetzt.",
      ctaBtn: "Dokument bestellen",
      footNavLabel: "Fußzeilen-Navigation",
      giantWord: "Dokumente",
      fabLabel: "Dokument bestellen"
    },
    it: {
      langLabel: "Lingua",
      brandAria: "MY NEW DOCUMENT, home",
      brandSub: "Servizio documenti",
      menuOpen: "Apri il menu", menuClose: "Chiudi il menu",
      menuLabel: "Menu principale",
      navHome: "Home", navAbout: "Chi siamo", navOrder: "Ordinare",
      navTrack: "Tracciamento", navHelp: "Aiuto", navContact: "Contatti",
      navCta: "Ordinare",
      asideEyebrow: "Documenti amministrativi",
      asideTitle: "La tua richiesta online, seguita dalla A alla Z",
      asideText: "Passaporto, carta d'identità, permesso di soggiorno, patente di guida. Istruzioni chiare via email e codice di tracciamento personale.",
      asideCta: "Inizia la richiesta",
      asideHours: "Dal lunedì al venerdì · 09:00 – 18:00",
      ctaEyebrow: "Pronto a iniziare?",
      ctaTitle: "Pronto a ordinare il tuo documento?",
      ctaText: "Bastano pochi minuti. Avvia la richiesta ora.",
      ctaBtn: "Ordina il mio documento",
      footNavLabel: "Navigazione del piè di pagina",
      giantWord: "Documenti",
      fabLabel: "Ordina il mio documento"
    }
  };

  /* ------------------------------------------------------------------
     État interne
     ------------------------------------------------------------------ */
  var dict = { fr: {}, en: {}, de: {}, it: {} };
  var lang = DEFAULT_LANG;
  var hooks = [];
  var started = false;
  var observer = null;

  function warn(msg) {
    if (window.console && console.warn) console.warn('[MND] ' + msg);
  }

  /* ------------------------------------------------------------------
     Utilitaires
     ------------------------------------------------------------------ */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function t(key) {
    var v = dict[lang] ? dict[lang][key] : undefined;
    if (typeof v === 'string') return v;
    v = dict[DEFAULT_LANG] ? dict[DEFAULT_LANG][key] : undefined;
    return typeof v === 'string' ? v : '';
  }

  /* t() renvoie aussi les tableaux et les fonctions (listes, pluriels) */
  function raw(key) {
    var v = dict[lang] ? dict[lang][key] : undefined;
    if (v === undefined) v = dict[DEFAULT_LANG] ? dict[DEFAULT_LANG][key] : undefined;
    return v;
  }

  function byId(id) { return document.getElementById(id); }

  function fmtDate(iso, code) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      return d.toLocaleString(code || lang, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return d.toISOString().slice(0, 16).replace('T', ' ');
    }
  }

  var toastTimer = null;
  function toast(msg, isError) {
    var el = byId('toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.id = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 4200);
  }

  function setNote(el, msg, kind) {
    if (!el) return;
    el.textContent = msg || '';
    el.classList.remove('error', 'ok');
    if (kind) el.classList.add(kind);
    el.classList.toggle('show', !!msg);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  /* ------------------------------------------------------------------
     Reveal au scroll (re-observable pour le contenu injecté par les pages)
     ------------------------------------------------------------------ */
  function observeReveal(root) {
    var items = (root || document).querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('visible'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    }
    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Marquees (bandes défilantes) — reconstruites à chaque langue
     ------------------------------------------------------------------ */
  function buildMarquees() {
    var info = raw('mqInfo');
    if (info && info.length) {
      var infoHTML = info.concat(info).map(function (x) {
        return '<span class="mq-item">' + esc(x) + '</span>';
      }).join('');
      Array.prototype.forEach.call(document.querySelectorAll('.mq-info .mq-track'), function (tr) {
        tr.innerHTML = infoHTML;
      });
    }
    var titles = raw('mqTitle');
    if (titles && titles.length) {
      var titleHTML = titles.concat(titles).map(function (o) {
        var inner, cls = 'mq-item';
        if (o.c === 'outline') { inner = esc(o.t); cls = 'mq-item outline'; }
        else if (o.c === 'box') { inner = '<span class="tbox">' + esc(o.t) + '</span>'; }
        else if (o.c === 'box orange') { inner = '<span class="tbox orange">' + esc(o.t) + '</span>'; }
        else if (o.c === 'box blue') { inner = '<span class="tbox blue">' + esc(o.t) + '</span>'; }
        else { inner = esc(o.t); }
        return '<span class="' + cls + '">' + inner + '</span>';
      }).join('');
      Array.prototype.forEach.call(document.querySelectorAll('.mq-title .mq-track'), function (tr) {
        tr.innerHTML = titleHTML;
      });
    }
  }

  /* ------------------------------------------------------------------
     Libellé ARIA du burger (ouvrir / fermer selon l'état + la langue)
     ------------------------------------------------------------------ */
  function syncBurgerLabel() {
    var b = byId('burger'), m = byId('mega');
    if (!b || !m) return;
    b.setAttribute('aria-label', t(m.classList.contains('open') ? 'menuClose' : 'menuOpen'));
  }

  /* ------------------------------------------------------------------
     Applique une langue à toute la page
     ------------------------------------------------------------------ */
  function applyLang(next) {
    if (dict[next]) lang = next;
    else warn('langue inconnue : ' + next);

    document.documentElement.lang = lang;

    var dt = byId('docTitle');
    if (dt && t('docTitle')) dt.textContent = t('docTitle');
    var dd = byId('docDesc');
    if (dd && t('docDesc')) dd.setAttribute('content', t('docDesc'));

    function each(sel, attr, apply) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        var v = dict[lang][el.getAttribute(attr)];
        if (typeof v === 'string') apply(el, v);
      });
    }
    each('[data-i18n]', 'data-i18n', function (el, v) { el.textContent = v; });
    each('[data-i18n-html]', 'data-i18n-html', function (el, v) { el.innerHTML = v; });
    each('[data-i18n-aria]', 'data-i18n-aria', function (el, v) { el.setAttribute('aria-label', v); });
    each('[data-i18n-alt]', 'data-i18n-alt', function (el, v) { el.setAttribute('alt', v); });
    each('[data-i18n-placeholder]', 'data-i18n-placeholder', function (el, v) { el.setAttribute('placeholder', v); });
    each('[data-i18n-title]', 'data-i18n-title', function (el, v) { el.setAttribute('title', v); });

    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });

    buildMarquees();
    syncBurgerLabel();

    /* contenu injecté par la page (listes, FAQ, cartes, marquees métier…) */
    hooks.forEach(function (fn) {
      try { fn(lang); } catch (e) { warn('hook i18n en erreur : ' + e.message); }
    });
    observeReveal();

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function onLang(fn) {
    if (typeof fn !== 'function') return;
    hooks.push(fn);
    if (started) { fn(lang); observeReveal(); }
  }

  /* ------------------------------------------------------------------
     Marque le lien de la page courante (méga-menu, footer)
     ------------------------------------------------------------------ */
  function markCurrentPage() {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file) file = 'index.html';
    Array.prototype.forEach.call(document.querySelectorAll('.mega-link, .footer-links a'), function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href === file) a.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------------------------
     Méga-menu plein écran
     ------------------------------------------------------------------ */
  function initMenu() {
    var burger = byId('burger'), mega = byId('mega'), megaClose = byId('megaClose');
    if (!burger || !mega) return;

    function setMenu(open) {
      mega.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      syncBurgerLabel();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && megaClose) megaClose.focus();
      else burger.focus();
    }
    burger.addEventListener('click', function () { setMenu(!mega.classList.contains('open')); });
    if (megaClose) megaClose.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mega.classList.contains('open')) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     Initialisation
     ------------------------------------------------------------------ */
  function init(pageDict) {
    if (started) { warn('init() déjà appelé'); return; }

    LANGS.forEach(function (code) {
      dict[code] = Object.assign({}, CHROME[code] || {}, (pageDict && pageDict[code]) || {});
    });

    function boot() {
      started = true;

      Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
        b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
      });

      initMenu();
      markCurrentPage();

      var saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      var navLang = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
      applyLang(dict[saved] ? saved : (dict[navLang] ? navLang : DEFAULT_LANG));
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }
  }

  window.MND = {
    LANGS: LANGS,
    DEFAULT_LANG: DEFAULT_LANG,
    init: init,
    applyLang: applyLang,
    onLang: onLang,
    observeReveal: observeReveal,
    getLang: function () { return lang; },
    t: t,
    raw: raw,
    esc: esc,
    byId: byId,
    fmtDate: fmtDate,
    toast: toast,
    setNote: setNote,
    copyText: copyText
  };
})();
