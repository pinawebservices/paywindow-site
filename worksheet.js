// /worksheet page behaviour. No dependencies.
// - Source attribution: /worksheet/ig, /worksheet/tt (or ?utm_source=instagram|tiktok)
//   -> download hop path (/worksheet/download/<src>, counted as a Vercel pageview)
//   -> App Store campaign token (ct=worksheet-<src>, shows in App Store Connect)
// - Optional Mailchimp signup via Mailchimp's public JSONP endpoint (no credentials involved).
(function () {
  'use strict';

  // Mailchimp tag ID for "worksheet" (from the embedded-form code: name="tags" value="…").
  // Leave empty until it's set; the form still subscribes, just without the tag.
  var MC_TAG_ID = '5851938';
  var MC_ENDPOINT = 'https://aiwidgetwise.us1.list-manage.com/subscribe/post-json' +
    '?u=b4bb1115d33cb6efcb52cfa8c&id=16a73f4104&f_id=00a7fae5f0';
  var HONEYPOT = 'b_b4bb1115d33cb6efcb52cfa8c_16a73f4104';

  // ---- Source attribution ----
  function detectSource() {
    var m = location.pathname.match(/^\/worksheet\/(ig|tt)\/?$/);
    if (m) return m[1];
    var utm = (new URLSearchParams(location.search).get('utm_source') || '').toLowerCase();
    if (utm === 'instagram' || utm === 'ig') return 'ig';
    if (utm === 'tiktok' || utm === 'tt') return 'tt';
    return '';
  }
  var src = detectSource();

  if (src) {
    document.querySelectorAll('[data-download]').forEach(function (a) {
      a.setAttribute('href', '/worksheet/download/' + src);
    });
  }
  document.querySelectorAll('[data-appstore]').forEach(function (a) {
    var url = new URL(a.href);
    url.searchParams.set('ct', src ? 'worksheet-' + src : 'worksheet');
    a.href = url.toString();
  });

  // ---- Email signup ----
  var form = document.getElementById('ws-signup');
  if (!form) return;
  var input = form.querySelector('input[type="email"]');
  var button = form.querySelector('button[type="submit"]');
  var status = document.getElementById('ws-status');
  var buttonLabel = button.textContent;

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'ws-status' + (kind ? ' is-' + kind : '');
  }
  function setBusy(busy) {
    button.disabled = busy;
    button.textContent = busy ? 'Subscribing…' : buttonLabel;
  }
  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  // Mailchimp error messages can include HTML and a "0 - " field prefix.
  function friendlyError(msg) {
    var text = String(msg || '').replace(/<[^>]*>/g, '').replace(/^\d+\s*-\s*/, '').trim();
    if (/already subscribed/i.test(text)) return "You're already on the list. Thanks for being here!";
    if (/too many/i.test(text)) return 'Too many signup attempts. Please try again in a few minutes.';
    if (/invalid|valid email|domain/i.test(text)) return 'That email address doesn\'t look right. Please check it and try again.';
    return 'Something went wrong. Please try again.';
  }

  input.addEventListener('input', function () {
    if (input.getAttribute('aria-invalid') === 'true' && validEmail(input.value.trim())) {
      input.removeAttribute('aria-invalid');
      setStatus('');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = input.value.trim();
    if (!validEmail(email)) {
      input.setAttribute('aria-invalid', 'true');
      setStatus('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    setBusy(true);
    setStatus('');

    var cb = 'wsMc' + Date.now();
    var script = document.createElement('script');
    var done = false;
    function cleanup() {
      done = true;
      clearTimeout(timer);
      try { delete window[cb]; } catch (_) { window[cb] = undefined; }
      script.remove();
    }
    var timer = setTimeout(function () {
      if (done) return;
      cleanup();
      setBusy(false);
      setStatus("We couldn't reach our email service. Please check your connection and try again.", 'error');
    }, 12000);

    window[cb] = function (res) {
      if (done) return;
      cleanup();
      setBusy(false);
      if (res && res.result === 'success') {
        var confirm = /confirm/i.test(res.msg || '');
        setStatus(confirm
          ? 'Almost done! Check your inbox and tap the link to confirm your subscription.'
          : "You're in! Look out for budgeting tips in your inbox.", 'success');
        form.classList.add('is-done');
      } else {
        setStatus(friendlyError(res && res.msg), 'error');
      }
    };

    var params = new URLSearchParams();
    params.set('EMAIL', email);
    params.set(HONEYPOT, form.querySelector('[name="' + HONEYPOT + '"]').value);
    if (MC_TAG_ID) params.set('tags', MC_TAG_ID);
    params.set('c', cb);
    script.src = MC_ENDPOINT + '&' + params.toString();
    script.onerror = function () {
      if (done) return;
      cleanup();
      setBusy(false);
      setStatus("We couldn't reach our email service. Please check your connection and try again.", 'error');
    };
    document.body.appendChild(script);
  });
})();
