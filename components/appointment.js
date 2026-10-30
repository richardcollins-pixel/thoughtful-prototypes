/* Appointment: preview → fake video call → loader → summary.
   Entry point: window.launchAppointment(provider), called by the home Join Appointment button.
   Markup and blobs follow the design system's video, appointment-preview and loading screens. */
(function () {
  var REPO = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/';
  var DS = REPO + 'design-system/';
  var PROVIDER_VIDEO = DS + 'assets/videos/provider-video.mp4';
  var USER_VIDEO = DS + 'assets/videos/user-video.mp4';
  var GLYPHS = DS + 'atoms/icon/glyphs/';
  var LOADER_MS = 3000;

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

  function glyph(name) {
    var img = el('img', 'ap-glyph');
    img.src = GLYPHS + encodeURI(name);
    img.alt = '';
    return img;
  }

  function iconButton(label, glyphName, onClick, extraCls) {
    var b = el('button', 'ap-icon-btn' + (extraCls ? ' ' + extraCls : ''));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.appendChild(glyph(glyphName));
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
    top.appendChild(iconButton('Close', 'Name=X.svg', leaveAppointment));
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
    controls.appendChild(iconButton('Microphone', 'Name=Mic on.svg', null, 'ap-icon-btn--light'));
    controls.appendChild(iconButton('Camera', 'Name=Video on.svg', null, 'ap-icon-btn--light'));
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
    left.appendChild(iconButton('Microphone', 'Name=Mic on.svg', function (e) {
      var isOff = e.currentTarget.classList.toggle('is-off');
      e.currentTarget.querySelector('img').src = GLYPHS + encodeURI(isOff ? 'Name=Mic off.svg' : 'Name=Mic on.svg');
    }));
    left.appendChild(iconButton('Camera', 'Name=Video on.svg', function (e) {
      var isOff = e.currentTarget.classList.toggle('is-off');
      e.currentTarget.querySelector('img').src = GLYPHS + encodeURI(isOff ? 'Name=video off.svg' : 'Name=Video on.svg');
    }));
    top.appendChild(left);
    top.appendChild(iconButton('Leave call', 'Name=X.svg', function () { renderLoader(p); }));
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
    var dot = el('div', 'blob');
    dot.setAttribute('data-size', '24');
    notes.appendChild(dot);
    notes.appendChild(el('span', null, 'T is taking notes'));
    s.appendChild(notes);
  }

  /* ── Loader while the summary is prepared: the design system's large blob ── */
  function renderLoader(p) {
    closeAll();
    var token = loaderToken;
    var s = makeScreen('ap-loader');

    var blob = el('div', 'blob');
    blob.setAttribute('data-size', '180');
    s.appendChild(blob);
    s.appendChild(el('p', 'ap-loader-text', 'Finishing up my notes...'));

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
