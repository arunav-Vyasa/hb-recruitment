/* =============================================
   HB RECRUITMENT LTD — script.js
   Vanilla JS, no dependencies
   ============================================= */

'use strict';

/* ── 1. NAV: sticky + scroll style + hamburger ── */
(function initNav() {
  const nav    = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;

  // Add scroll class
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  toggle.addEventListener('click', function () {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    // Trap: close on outside click
    if (isOpen) {
      document.addEventListener('click', closeOnOutside);
    }
  });

  function closeOnOutside(e) {
    if (!nav.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', closeOnOutside);
    }
  }

  // Close menu when a link is clicked
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', closeOnOutside);
    });
  });
})();


/* ── 2. SCROLL ANIMATIONS (IntersectionObserver) */
(function initScrollAnimations() {
  const els = document.querySelectorAll('.animate-on-scroll');
  if (!els.length) return;

  // Tell CSS that JS is active — elements are now hidden pending their reveal.
  // Must happen before any visibility check so the CSS transition is ready.
  document.documentElement.classList.add('js-animate');

  // Reduced-motion: skip animation entirely, reveal everything at once.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  // Observer handles elements that scroll into view after load.
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  els.forEach(function (el) { observer.observe(el); });

  // Synchronous viewport sweep — reveals elements already on screen at load.
  // IntersectionObserver fires asynchronously (next task), so without this,
  // above-fold elements (hero headline, CTAs) stay invisible until first scroll.
  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }

  // Three passes: immediate, after first paint, and after all resources load.
  // Belt-and-suspenders: covers fast browsers, slow font loads, and lazy images.
  revealInView();
  requestAnimationFrame(revealInView);
  window.addEventListener('load', revealInView, { once: true });
})();


/* ── 4. FAQ ACCORDION ───────────────────────── */
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(function (item) {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      items.forEach(function (other) {
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          collapseAnswer(otherAnswer);
        }
      });

      // Toggle this one
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        collapseAnswer(answer);
      } else {
        btn.setAttribute('aria-expanded', 'true');
        expandAnswer(answer);
      }
    });

    // Keyboard: also open on Space / Enter (redundant but explicit)
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  function expandAnswer(el) {
    el.hidden = false;
    // Animate height via max-height trick
    el.style.maxHeight = '0';
    el.style.overflow  = 'hidden';
    el.style.transition = 'max-height 0.35s ease';
    // Force reflow then set target height
    requestAnimationFrame(function () {
      el.style.maxHeight = el.scrollHeight + 'px';
    });
    el.addEventListener('transitionend', function cleanup() {
      el.style.maxHeight = '';
      el.style.overflow  = '';
      el.style.transition = '';
      el.removeEventListener('transitionend', cleanup);
    });
  }

  function collapseAnswer(el) {
    if (el.hidden) return;
    el.style.maxHeight  = el.scrollHeight + 'px';
    el.style.overflow   = 'hidden';
    el.style.transition = 'max-height 0.3s ease';
    requestAnimationFrame(function () {
      el.style.maxHeight = '0';
    });
    el.addEventListener('transitionend', function cleanup() {
      el.hidden = true;
      el.style.maxHeight  = '';
      el.style.overflow   = '';
      el.style.transition = '';
      el.removeEventListener('transitionend', cleanup);
    });
  }
})();


/* ── 5. CONTACT FORM ─────────────────────────── */
(function initContactForm() {
  const form        = document.getElementById('contact-form');
  const successDiv  = document.getElementById('form-success');
  const resetBtn    = document.getElementById('reset-form');
  const submitBtn   = form && form.querySelector('.btn-submit');
  if (!form || !successDiv) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate async submission
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(function () {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      form.hidden         = true;
      successDiv.hidden   = false;
      successDiv.focus();
    }, 1200);
  });

  resetBtn && resetBtn.addEventListener('click', function () {
    form.reset();
    form.hidden        = false;
    successDiv.hidden  = true;
    // Clear error states
    form.querySelectorAll('.invalid').forEach(function (el) {
      el.classList.remove('invalid');
    });
    form.querySelectorAll('.form-error').forEach(function (el) {
      el.textContent = '';
    });
    form.querySelector('[name="name"]').focus();
  });

  function validateForm() {
    let valid = true;

    // Name
    const name = form.querySelector('#f-name');
    if (!name.value.trim()) {
      setError(name, 'f-name-error', 'Please enter your full name.');
      valid = false;
    } else {
      clearError(name, 'f-name-error');
    }

    // Email
    const email = form.querySelector('#f-email');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError(email, 'f-email-error', 'Please enter your email address.');
      valid = false;
    } else if (!emailRe.test(email.value.trim())) {
      setError(email, 'f-email-error', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(email, 'f-email-error');
    }

    // Enquiry type radio
    const typeSelected = form.querySelector('input[name="enquiry_type"]:checked');
    const typeError    = document.getElementById('f-type-error');
    if (!typeSelected) {
      if (typeError) typeError.textContent = 'Please select whether you're hiring or looking.';
      valid = false;
    } else {
      if (typeError) typeError.textContent = '';
    }

    // Message
    const msg = form.querySelector('#f-message');
    if (!msg.value.trim()) {
      setError(msg, 'f-message-error', 'Please add a brief message.');
      valid = false;
    } else {
      clearError(msg, 'f-message-error');
    }

    return valid;
  }

  function setError(field, errorId, message) {
    field.classList.add('invalid');
    field.setAttribute('aria-describedby', errorId);
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(field, errorId) {
    field.classList.remove('invalid');
    field.removeAttribute('aria-describedby');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = '';
  }

  // Live validation on blur
  ['f-name', 'f-email', 'f-message'].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function () {
      if (el.value.trim()) clearError(el, id + '-error');
    });
  });
})();


/* ── 6. COPYRIGHT YEAR ───────────────────────── */
(function setCopyrightYear() {
  const el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
})();
