/* Summary: the appointment summary as plain markup, laid out from the design.
   Flow: T's follow-up prompt → the post-appointment thoughts chat (chat.js) → Your thoughts.
   Entry point: window.showAppointmentSummary(provider), called by the appointment loader.
   Uses window.demoConfig (set by the home screen) for prompts and the chat endpoint. */
(function () {
  var REPO = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/';

  var PROMPT_KEYS = {
    engagement: 'Post_Appointment_Thoughts_Engagement_Question',
    thoughts: 'Post_Appointment_Thoughts_Your_Thoughts'
  };
  var FALLBACK_QUESTION = "I'm here if there's anything from your appointment that you'd like to unpack.";

  // Sample copy from the design. Replace with generated content when it is ready.
  var TOPIC = 'You came in feeling overwhelmed by low-grade depression and anxiety primarily driven by the financial uncertainty of your work situation.';
  var REFRAME = 'We reframed your challenge of paralyzing anxiety to a matter of reclaiming your power by focusing on what you can control.';
  var PLAN = 'Immediate Self-Care: Try meditating today (after this session or at 3 PM) to create a clear moment of peace.\n\nSkill Use: Use the 4-4-6 breathing technique when anxiety spikes to reclaim calm.\n\nRoutine Fix: Introduce a "tech reward" system for your children to ease the stressful bedtime routine.';
  var SUMMARY_BODY = 'You mentioned feeling anxious at work. We could slow this down together and look at what might help you feel more steady.';

  var state = null;

  /* ── Data ── */
  function config() {
    return window.demoConfig || { config_vars: {}, prompts: {} };
  }

  function session() {
    return config()._session || {};
  }

  function promptText(key) {
    return (config().prompts || {})[key] || '';
  }

  function fill(text, vars) {
    Object.keys(vars).forEach(function (k) {
      text = text.split('{{' + k + '}}').join(vars[k]);
    });
    return text;
  }

  function todayLong() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function callChat(systemPrompt, messages) {
    var cfg = config().config_vars || {};
    return fetch(cfg.chat_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system_prompt: systemPrompt, messages: messages, model: cfg.llm_model })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function photoUrl() {
    return state.p.i.indexOf('data:') === 0 ? state.p.i : REPO + 'therapists/' + state.p.i;
  }

  function closeAll() {
    document.querySelectorAll('.ap-summary').forEach(function (n) { n.remove(); });
  }

  function restoreHome() {
    var homeBlob = document.querySelector('.hm-blob-canvas');
    if (window.TAvatar && homeBlob) {
      try { window.TAvatar.transferTo(homeBlob); } catch (e) {}
    }
  }

  /* ── Markup ── */
  function section(heading, body) {
    return '<section class="sum-section"><h2 class="sum-h">' + heading + '</h2><p class="sum-copy">' + esc(body).replace(/\n\n/g, '</p><p class="sum-copy">') + '</p></section>';
  }

  function thoughtsSection() {
    if (state.phase === 'prompt' || state.phase === 'prompt-chat') return '';
    if (state.phase === 'thoughts-loading') {
      return '<section class="sum-section"><h2 class="sum-h">Your Thoughts</h2>' +
        '<div class="sum-skel"><span></span><span></span><span></span></div></section>';
    }
    return section('Your Thoughts', state.yourThoughts || 'Nothing new came up today.');
  }

  function render() {
    var screen = document.querySelector('.ap-summary');
    if (!screen) {
      screen = document.createElement('div');
      screen.className = 'ap-screen ap-summary';
      document.getElementById('app').appendChild(screen);
    }

    var isPrompt = state.phase === 'prompt' || state.phase === 'prompt-chat';
    var html = '<section class="sum-hero">' +
      '<button type="button" class="sum-close" aria-label="Close"><i class="icon icon-x"></i></button>' +
      '<img class="sum-photo" src="' + esc(photoUrl()) + '" alt="">' +
      '<p class="sum-when">' + esc(state.when) + '</p>' +
      '<h1 class="sum-title">Appointment with ' + esc(state.first) + '</h1>';

    if (isPrompt) {
      html += '<p class="sum-lead"><span class="sum-blob-slot"><span class="blob" data-size="24"><canvas aria-hidden="true"></canvas></span></span><span>I’m here to chat</span></p>' +
        '<div class="sum-prompt"><p>' + esc(state.question || FALLBACK_QUESTION) + '</p><i class="icon icon-arrow-up"></i></div>';
    } else {
      html += '<p class="sum-body">' + esc(SUMMARY_BODY) + '</p>' +
        '<p class="sum-duration"><i class="icon icon-clock"></i><span>45 min</span></p>';
    }
    html += '</section>';

    html += '<section class="sum-sections">' +
      thoughtsSection() +
      section('Today’s Topic', TOPIC) +
      section('The Reframe', REFRAME) +
      section('The Plan', PLAN) +
      '</section>';

    // The design system's glow, from the summary's provider states; it stays inside the frame.
    // The glow sits outside the scrolling area, so it stays in place.
    html = '<div class="sum-glow-wrap"><div class="glow" data-theme="cool" data-placement="bottom" aria-hidden="true"><canvas></canvas></div></div><div class="sum-scroll">' + html + '</div>';

    screen.innerHTML = html;
    screen.querySelector('.sum-close').addEventListener('click', finish);
    var prompt = screen.querySelector('.sum-prompt');
    if (prompt && state.phase === 'prompt') prompt.addEventListener('click', openChat);
  }

  /* ── PAT: the real chat screen runs the session (chat.js); the summary picks up when it finishes ── */
  function openChat() {
    var sum = document.querySelector('.ap-summary');
    if (sum) sum.style.display = 'none';
    if (window.launchPat) window.launchPat();
  }

  window.onPatFinished = function (transcript) {
    var sum = document.querySelector('.ap-summary');
    if (sum) sum.style.display = '';
    if (!state) return;
    state.phase = 'thoughts-loading';
    render();
    var prompt = fill(promptText(PROMPT_KEYS.thoughts), {
      preferredName: session().name || 'there',
      currentDate: todayLong(),
      conversation: transcript || ''
    });
    callChat(prompt, [{ role: 'user', content: 'Write the thoughts now.' }]).then(function (data) {
      state.yourThoughts = data.yourThoughts || null;
    }).catch(function () {
      state.yourThoughts = null;
    }).then(function () {
      recordRecentTopic();
      state.phase = 'thoughts';
      render();
    });
  };

  function recordRecentTopic() {
    var sess = session();
    var topics = sess.recentTopics || [];
    topics.unshift({
      title: 'Appointment with ' + state.first,
      resumeCopy: state.yourThoughts || 'Pick up your thoughts from the appointment.',
      minutes: 10
    });
    sess.recentTopics = topics.slice(0, 8);
  }

  function finish() {
    var sum = document.querySelector('.ap-summary');
    var done = function () {
      closeAll();
      restoreHome();
      if (window.onAppointmentSummaryClosed) window.onAppointmentSummaryClosed();
    };
    if (!sum) return done();
    sum.classList.add('ap-summary--out');
    setTimeout(done, 380);
  }

  /* ── Entry point ── */
  window.showAppointmentSummary = function (p) {
    var appt = session().appointment || {};
    state = {
      p: p,
      first: p.n.split(' ')[0],
      when: appt.d && appt.t ? appt.d + ' at ' + appt.t : todayLong(),
      question: null,
      phase: 'prompt',
      yourThoughts: null
    };
    closeAll();
    render();
    callChat(fill(promptText(PROMPT_KEYS.engagement), {
      preferredName: session().name || 'there',
      currentDate: todayLong()
    }), [{ role: 'user', content: 'Write the statement now.' }]).then(function (data) {
      if (data.question && state.phase === 'prompt') {
        state.question = data.question;
        render();
      }
    }).catch(function (err) {
      console.error('Summary failed to load the statement', err);
    });
  };
})();
