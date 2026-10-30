/* Summary: what T wrote after the appointment, the post-appointment thoughts chat (PAT),
   and "Your thoughts" added to the summary. Entry point: window.showAppointmentSummary(provider),
   called by the appointment loader. Uses window.demoConfig (set by the home screen) for prompts and the chat endpoint. */
(function () {
  var REPO = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/';
  var DS = REPO + 'design-system/';
  var GLYPHS = DS + 'atoms/icon/glyphs/';

  var PROMPT_KEYS = {
    engagement: 'Post_Appointment_Thoughts_Engagement_Question',
    session: 'Post_Appointment_Thoughts_Session',
    thoughts: 'Post_Appointment_Thoughts_Your_Thoughts'
  };
  var FALLBACK_QUESTION = "I'm here if there's anything from your appointment that you'd like to unpack.";
  var SEED = '[The user has opened the appointment conversation. Begin.]';

  // Static summary content from the design. Replace with generated content when it is ready.
  var SUMMARY_SECTIONS = [
    ["Today's Topic", 'You came in feeling overwhelmed by the financial uncertainty of your work situation.'],
    ['The Reframe', 'Your anxiety feels paralyzing, and it can be reframed as reclaiming your power by focusing on what you can control.'],
    ['The Plan', 'Try a 10-minute spending check each evening this week.']
  ];

  var state = null; // { p, first, when, question, messages, draft, phase, yourThoughts, busy }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function config() {
    return window.demoConfig || { config_vars: {}, prompts: {} };
  }

  function session() {
    return config()._session || {};
  }

  function providerImage(p) {
    return p.i.indexOf('data:') === 0 ? p.i : REPO + 'therapists/' + p.i;
  }

  function glyph(name) {
    var img = el('img', 'ap-glyph');
    img.src = GLYPHS + encodeURI(name);
    img.alt = '';
    return img;
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

  function userName() {
    return session().name || 'there';
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

  function sessionPrompt() {
    return fill(promptText(PROMPT_KEYS.session), {
      preferred_name: userName(),
      current_date: todayLong()
    });
  }

  function transcript() {
    return state.messages.map(function (m) {
      return (m.role === 'user' ? 'User: ' : 'T: ') + m.content;
    }).join('\n');
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

  /* ── Rendering ── */
  function render() {
    closeAll();
    var s = el('div', 'ap-screen ap-summary');
    document.getElementById('app').appendChild(s);

    var head = el('div', 'ap-sum-head');
    var close = el('button', 'ap-icon-btn ap-sum-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.appendChild(glyph('Name=X.svg'));
    close.addEventListener('click', finish);
    head.appendChild(close);
    head.appendChild(el('div', 'ap-sum-when', state.when));
    var avatar = el('img', 'ap-sum-avatar');
    avatar.src = providerImage(state.p);
    avatar.alt = '';
    head.appendChild(avatar);
    head.appendChild(el('h1', 'ap-sum-title', 'Appointment with ' + state.first));
    s.appendChild(head);

    var sections = el('div', 'ap-sum-sections');
    SUMMARY_SECTIONS.forEach(function (sec) {
      var block = el('section', 'ap-sum-block');
      block.appendChild(el('h2', 'ap-sum-h', sec[0]));
      block.appendChild(el('p', 'ap-sum-copy', sec[1]));
      sections.appendChild(block);
    });
    s.appendChild(sections);

    var pat = el('section', 'ap-pat');
    var lead = el('div', 'ap-pat-lead');
    var dot = el('span', 'ap-dot');
    var dotBlob = el('div', 'blob');
    dotBlob.setAttribute('data-size', '24');
    dot.appendChild(dotBlob);
    lead.appendChild(dot);
    lead.appendChild(el('span', null, "I'm here to chat"));
    pat.appendChild(lead);

    if (state.phase === 'intro') {
      pat.appendChild(el('p', 'ap-pat-question', state.question || FALLBACK_QUESTION));
      var start = el('button', 'ap-pat-start', 'Talk it through');
      start.type = 'button';
      start.addEventListener('click', startChat);
      pat.appendChild(start);
    } else if (state.phase === 'chat') {
      pat.appendChild(renderChat());
    } else if (state.phase === 'thoughts') {
      pat.appendChild(el('p', 'ap-pat-question', 'Your thoughts are loading...'));
    } else if (state.phase === 'done') {
      var added = el('div', 'ap-sum-block');
      added.appendChild(el('h2', 'ap-sum-h', 'Your thoughts'));
      added.appendChild(el('p', 'ap-sum-copy', state.yourThoughts || 'Nothing new came up today.'));
      pat.appendChild(added);
    }
    s.appendChild(pat);
  }

  function renderChat() {
    var wrap = el('div', 'ap-chat');
    var thread = el('div', 'ap-chat-thread');
    state.messages.forEach(function (m, i) {
      if (i === 0) return; // the seed message is not shown
      thread.appendChild(el('div', 'ap-bubble ' + (m.role === 'user' ? 'is-user' : 'is-t'), m.content));
    });
    if (state.busy) thread.appendChild(el('div', 'ap-bubble is-t is-typing', '...'));
    wrap.appendChild(thread);

    var bar = el('div', 'ap-chat-bar');
    var input = el('input', 'ap-chat-input');
    input.type = 'text';
    input.placeholder = 'Say anything...';
    input.value = state.draft || '';
    input.addEventListener('input', function () { state.draft = input.value; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    bar.appendChild(input);
    var sendBtn = el('button', 'ap-chat-send');
    sendBtn.type = 'button';
    sendBtn.setAttribute('aria-label', 'Send');
    sendBtn.appendChild(glyph('Name=arrow up.svg'));
    sendBtn.addEventListener('click', send);
    bar.appendChild(sendBtn);
    wrap.appendChild(bar);

    var wrapUp = el('button', 'ap-chat-wrap', "I'm ready to wrap up");
    wrapUp.type = 'button';
    wrapUp.addEventListener('click', function () { send("I'm ready to wrap up."); });
    wrap.appendChild(wrapUp);
    return wrap;
  }

  /* ── PAT session ── */
  function startChat() {
    state.phase = 'chat';
    state.messages = [{ role: 'user', content: SEED }];
    state.busy = true;
    render();
    callChat(sessionPrompt(), state.messages).then(function (data) {
      state.messages.push({ role: 'assistant', content: data.message || '' });
      state.busy = false;
      if (data.status === 'EXIT') return endChat();
      render();
    }).catch(function () {
      state.busy = false;
      state.messages.push({ role: 'assistant', content: 'Something went wrong. Please try again.' });
      render();
    });
  }

  function send(text) {
    var content = (text || state.draft || '').trim();
    if (!content || state.busy) return;
    state.draft = '';
    state.messages.push({ role: 'user', content: content });
    state.busy = true;
    render();
    callChat(sessionPrompt(), state.messages).then(function (data) {
      state.messages.push({ role: 'assistant', content: data.message || '' });
      state.busy = false;
      if (data.status === 'EXIT') return endChat();
      render();
    }).catch(function () {
      state.busy = false;
      state.messages.push({ role: 'assistant', content: 'Something went wrong. Please try again.' });
      render();
    });
  }

  /* ── Your thoughts, then recent topic ── */
  function endChat() {
    state.phase = 'thoughts';
    render();
    var prompt = fill(promptText(PROMPT_KEYS.thoughts), {
      preferredName: userName(),
      currentDate: todayLong(),
      conversation: transcript()
    });
    callChat(prompt, [{ role: 'user', content: 'Write the thoughts now.' }]).then(function (data) {
      state.yourThoughts = data.yourThoughts || null;
      recordRecentTopic();
      state.phase = 'done';
      render();
    }).catch(function () {
      state.yourThoughts = null;
      recordRecentTopic();
      state.phase = 'done';
      render();
    });
  }

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
    closeAll();
    restoreHome();
    if (window.onAppointmentSummaryClosed) window.onAppointmentSummaryClosed();
  }

  /* ── Entry point ── */
  window.showAppointmentSummary = function (p) {
    var appt = session().appointment || {};
    state = {
      p: p,
      first: p.n.split(' ')[0],
      when: appt.d && appt.t ? appt.d + ' at ' + appt.t : todayLong(),
      question: null,
      messages: [],
      draft: '',
      phase: 'intro',
      yourThoughts: null,
      busy: false
    };
    render();
    callChat(fill(promptText(PROMPT_KEYS.engagement), {
      preferredName: userName(),
      currentDate: todayLong()
    }), [{ role: 'user', content: 'Write the statement now.' }]).then(function (data) {
      if (data.question && state.phase === 'intro') {
        state.question = data.question;
        render();
      }
    }).catch(function () {});
  };
})();
