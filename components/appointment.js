/* Appointment: preview → fake video call → loader → summary.
   Entry point: window.launchAppointment(provider), called by the home Join Appointment button.
   Icons, blobs and the loader are the design system's (ds.css, ds.js). */
(function () {
  var REPO = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/';
  // Videos stay on the design-system site: they are large and were not copied into this repo.
  var DS_SITE = 'https://richardcollins-pixel.github.io/thoughtful-design-system/tds/';
  var PROVIDER_VIDEO = DS_SITE + 'assets/videos/provider-video.mp4';
  var USER_VIDEO = DS_SITE + 'assets/videos/user-video.mp4';
  // Long enough for the loader's three captions to play through once (see behaviors/loader.js).
  var LOADER_MS = 20000;

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

  // The design system's icon classes (icon-x, icon-mic-on, …)
  function icon(name) {
    return el('i', 'icon icon-' + name);
  }

  function iconButton(label, iconName, onClick, extraCls) {
    var b = el('button', 'ap-icon-btn' + (extraCls ? ' ' + extraCls : ''));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.appendChild(icon(iconName));
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

  function closeAll() {
    loaderToken++;
    document.querySelectorAll('.ap-screen').forEach(function (n) { n.remove(); });
  }

  function makeScreen(modifier) {
    var s = el('div', 'ap-screen ' + modifier);
    appRoot().appendChild(s);
    return s;
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

  /* ── Preview: "Get ready for your appointment" with your own camera ── */
  function renderPreview(p) {
    closeAll();
    var s = makeScreen('ap-preview');

    var top = el('div', 'ap-top');
    top.appendChild(el('span', 'ap-spacer'));
    top.appendChild(iconButton('Close', 'x', leaveAppointment));
    s.appendChild(top);

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
    controls.appendChild(iconButton('Microphone', 'mic-on', null, 'ap-icon-btn--light'));
    controls.appendChild(iconButton('Camera', 'video-on', null, 'ap-icon-btn--light'));
    tile.appendChild(controls);
    s.appendChild(tile);

    var join = el('button', 'ap-join', 'Join Appointment');
    join.type = 'button';
    join.addEventListener('click', function () { renderCall(p); });
    s.appendChild(join);
  }

  /* ── Fake video call. Therapist video fills the middle, your video sits over it, X ends the call. ── */
  function renderCall(p) {
    closeAll();
    var s = makeScreen('ap-call');

    var backdrop = el('video', 'ap-backdrop');
    setVideo(backdrop, PROVIDER_VIDEO);
    s.appendChild(backdrop);

    var top = el('div', 'ap-top');
    var left = el('div', 'ap-top-left');
    left.appendChild(iconButton('Microphone', 'mic-on', function (e) {
      var btn = e.currentTarget;
      var isOff = btn.classList.toggle('is-off');
      btn.querySelector('.icon').className = 'icon icon-' + (isOff ? 'mic-off' : 'mic-on');
    }));
    left.appendChild(iconButton('Camera', 'video-on', function (e) {
      var btn = e.currentTarget;
      var isOff = btn.classList.toggle('is-off');
      btn.querySelector('.icon').className = 'icon icon-' + (isOff ? 'video-off' : 'video-on');
    }));
    top.appendChild(left);
    top.appendChild(iconButton('Leave call', 'x', function () { renderLoader(p); }));
    s.appendChild(top);

    var remote = el('div', 'ap-remote');
    var remoteVideo = el('video', 'ap-remote-video');
    setVideo(remoteVideo, PROVIDER_VIDEO);
    remote.appendChild(remoteVideo);
    s.appendChild(remote);

    var self = el('video', 'ap-self');
    setVideo(self, USER_VIDEO);
    s.appendChild(self);

    var notes = el('div', 'ap-notes');
    var dot = el('span', 'ap-dot');
    var dotBlob = el('div', 'blob');
    dotBlob.setAttribute('data-size', '24');
    dot.appendChild(dotBlob);
    notes.appendChild(dot);
    notes.appendChild(el('span', null, 'T is taking notes'));
    s.appendChild(notes);
  }

  /* ── Loader: the design system's loading state (organisms/loading-state), which plays T's morph loader ── */
  function renderLoader(p) {
    closeAll();
    var token = loaderToken;
    var s = makeScreen('ap-loader');
    s.innerHTML =
      '<section class="loading-state" data-loader data-loader-shapes="blob,pencil,bubble" data-loader-themes="ember,bloom,bloom">' +
        '<div class="glow loading-state__glow" data-for="loader-blob" data-placement="bottom" aria-hidden="true"><canvas></canvas></div>' +
        '<div class="loading-state__content">' +
          '<span class="blob loading-state__blob" id="loader-blob" data-theme="ember"><canvas aria-hidden="true"></canvas></span>' +
          '<div class="loading-state__captions">' +
            '<p class="loading-state__line">Wrapping up your appointment...</p>' +
            '<p class="loading-state__line">Finishing up my notes...</p>' +
            '<p class="loading-state__line">Packaging it up for you...</p>' +
          '</div>' +
        '</div>' +
      '</section>';

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
