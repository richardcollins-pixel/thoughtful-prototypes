/* Appointment: preview → fake video call → loader → summary.
   Entry point: window.launchAppointment(provider), called by the home Join Appointment button.
   The loader hands off to window.showAppointmentSummary(provider) when it exists. */
(function () {
  var REPO = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/';
  var DS_VIDEOS = 'https://richardcollins-pixel.github.io/thoughtful-design-system/tds/assets/videos/';
  var PROVIDER_VIDEO = DS_VIDEOS + 'provider-video.mp4';
  var USER_VIDEO = DS_VIDEOS + 'user-video.mp4';
  var LOADER_MS = 3000;

  var X_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var MIC_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  var CAM_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>';

  var loaderToken = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function appRoot() {
    return document.getElementById('app');
  }

  function providerImage(p) {
    return p.i.indexOf('data:') === 0 ? p.i : REPO + 'therapists/' + p.i;
  }

  function firstName(p) {
    return p.n.split(' ')[0];
  }

  function closeAll() {
    loaderToken++;
    document.querySelectorAll('.ap-screen').forEach(function (n) { n.remove(); });
  }

  function makeScreen(modifier) {
    var s = el('div', 'ap-screen ' + modifier);
    appRoot().appendChild(s);
    return s;
  }

  function iconButton(label, svg, onClick, extraCls) {
    var b = el('button', 'ap-icon-btn' + (extraCls ? ' ' + extraCls : ''));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.innerHTML = svg;
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  function setVideo(v, src) {
    v.src = src;
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function restoreHome() {
    var homeBlob = document.querySelector('.hm-blob-canvas');
    if (window.TAvatar && homeBlob) {
      try { window.TAvatar.transferTo(homeBlob); } catch (e) {}
    }
  }

  function leaveAppointment() {
    closeAll();
    restoreHome();
  }

  /* ── Preview: "Get ready for your appointment" ── */
  function renderPreview(p) {
    closeAll();
    var s = makeScreen('ap-preview');

    s.appendChild(iconButton('Close', X_SVG, leaveAppointment, 'ap-close'));
    s.appendChild(el('h1', 'ap-preview-title', 'Get Ready for Your Appointment'));

    var here = el('div', 'ap-here');
    var avatar = el('img', 'ap-here-avatar');
    avatar.src = providerImage(p);
    avatar.alt = '';
    here.appendChild(avatar);
    here.appendChild(el('span', null, firstName(p) + ' is here'));
    s.appendChild(here);

    var tile = el('div', 'ap-tile');
    var tileVideo = el('video', 'ap-tile-video');
    setVideo(tileVideo, USER_VIDEO);
    tile.appendChild(tileVideo);
    var controls = el('div', 'ap-tile-controls');
    controls.appendChild(iconButton('Microphone', MIC_SVG, null, 'ap-icon-btn--light'));
    controls.appendChild(iconButton('Camera', CAM_SVG, null, 'ap-icon-btn--light'));
    tile.appendChild(controls);
    s.appendChild(tile);

    var join = el('button', 'ap-join', 'Join Appointment');
    join.type = 'button';
    join.addEventListener('click', function () { renderCall(p); });
    s.appendChild(join);
  }

  /* ── Fake video call. X ends the call. ── */
  function renderCall(p) {
    closeAll();
    var s = makeScreen('ap-call');

    s.appendChild(el('video', 'ap-backdrop'));
    var backdrop = s.lastChild;
    setVideo(backdrop, PROVIDER_VIDEO);

    var top = el('div', 'ap-call-top');
    var left = el('div', 'ap-call-left');
    left.appendChild(iconButton('Microphone', MIC_SVG, function (e) { e.currentTarget.classList.toggle('is-off'); }));
    left.appendChild(iconButton('Camera', CAM_SVG, function (e) { e.currentTarget.classList.toggle('is-off'); }));
    top.appendChild(left);
    top.appendChild(iconButton('Leave call', X_SVG, function () { renderLoader(p); }, 'ap-leave'));
    s.appendChild(top);

    var remote = el('video', 'ap-remote');
    setVideo(remote, PROVIDER_VIDEO);
    s.appendChild(remote);

    var self = el('video', 'ap-self');
    setVideo(self, USER_VIDEO);
    s.appendChild(self);

    var notes = el('div', 'ap-notes');
    notes.appendChild(el('span', 'ap-notes-dot'));
    notes.appendChild(el('span', null, 'T is taking notes'));
    s.appendChild(notes);
  }

  /* ── Loader while the summary is prepared ── */
  function renderLoader(p) {
    closeAll();
    var token = loaderToken;
    var s = makeScreen('ap-loader');

    var canvas = el('canvas', 'ap-loader-blob');
    s.appendChild(canvas);
    s.appendChild(el('p', 'ap-loader-text', 'Finishing up my notes...'));

    if (window.TAvatar) {
      try { window.TAvatar.transferTo(canvas); } catch (e) {}
    }

    setTimeout(function () {
      if (token !== loaderToken) return;
      closeAll();
      if (window.onAppointmentEnded) window.onAppointmentEnded(p);
      if (window.showAppointmentSummary) {
        window.showAppointmentSummary(p);
      } else {
        restoreHome();
      }
    }, LOADER_MS);
  }

  window.launchAppointment = renderPreview;
})();
