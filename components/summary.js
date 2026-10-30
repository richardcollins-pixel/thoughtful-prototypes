/* Summary: built from the design system's summary screen (design-system/screens/summary/summary.meta.json).
   Flow: T's follow-up prompt → post-appointment thoughts chat (PAT) → Your thoughts (loading, then added).
   Entry point: window.showAppointmentSummary(provider), called by the appointment loader.
   Uses window.demoConfig (set by the home screen) for prompts and the chat endpoint. */
(function () {
  var REPO = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/';
  var DS = REPO + 'design-system/';

  var META_PATHS = [
    'screens/summary/summary.meta.json',
    'organisms/header-card/header-card.meta.json',
    'molecules/text-section/text-section.meta.json',
    'molecules/header/header.meta.json',
    'molecules/icon-label/icon-label.meta.json',
    'molecules/avatar-text/avatar-text.meta.json',
    'molecules/chat-input/chat-input.meta.json',
    'atoms/avatar/avatar.meta.json'
  ];
  var PROMPT_KEYS = {
    engagement: 'Post_Appointment_Thoughts_Engagement_Question',
    session: 'Post_Appointment_Thoughts_Session',
    thoughts: 'Post_Appointment_Thoughts_Your_Thoughts'
  };
  var FALLBACK_QUESTION = "I'm here if there's anything from your appointment that you'd like to unpack.";
  var SEED = '[The user has opened the appointment conversation. Begin.]';
  var SECTION_KEYS = ['thoughts', 'topic', 'reframe', 'plan', 'suggestions', 'therapist', 'resources'];

  var META = {};
  var metaReady = null;
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

  function ensureMeta() {
    if (!metaReady) {
      metaReady = Promise.all(META_PATHS.map(function (path) {
        return fetch(DS + path).then(function (r) { return r.json(); }).then(function (json) {
          META[path.replace(/\/[^/]+\.meta\.json$/, '')] = json;
        });
      }));
    }
    return metaReady;
  }

  /* ── Design-system template engine: fills {{item:x}}, {{prop}}, {{?prop}}…{{/prop}} from a component's meta ── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderItem(def, parent, name) {
    if (!def || (parent && parent[name + '.hide'])) return '';
    if (def.type === 'component') {
      var sub = {};
      Object.keys(def.props || {}).forEach(function (k) { sub[k] = def.props[k]; });
      Object.keys(parent || {}).forEach(function (k) {
        if (k.indexOf(name + '.') === 0) sub[k.slice(name.length + 1)] = parent[k];
      });
      return renderComponent(def.component, sub);
    }
    if (def.type === 'text') {
      var value = parent && parent[name] !== undefined ? parent[name] : (def.value || '');
      var tag = def.tag || 'span';
      return '<' + tag + (def.class ? ' class="' + def.class + '"' : '') + '>' + esc(value) + '</' + tag + '>';
    }
    return '';
  }

  function renderComponent(path, props) {
    var meta = META[path];
    if (!meta) return '';
    var all = {};
    Object.keys(meta.props || {}).forEach(function (k) { all[k] = meta.props[k].default; });
    Object.keys(props || {}).forEach(function (k) { all[k] = props[k]; });

    var tpl = meta.template;
    if (meta.states) {
      var st = meta.states.filter(function (s) { return s.id === all.state; })[0] || meta.states[0];
      tpl = st.template;
    }

    return tpl
      .replace(/\{\{\?(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, function (_, k, inner) { return all[k] ? inner : ''; })
      .replace(/\{\{item:(\w+)\}\}/g, function (_, name) { return renderItem((meta.items || {})[name], props, name); })
      .replace(/\{\{([\w.]+)\}\}/g, function (_, k) { return esc(all[k] !== undefined ? all[k] : ''); });
  }

  /* ── What each state shows, expressed as overrides on the design-system summary screen ── */
  function summaryProps() {
    var s = state;
    var phase = s.phase;
    var isPrompt = phase === 'prompt' || phase === 'prompt-chat';
    var stateId = isPrompt ? 'provider-follow-up'
      : phase === 'thoughts-loading' ? 'provider-thoughts-loading'
      : phase === 'thoughts' ? 'provider-thoughts'
      : 'provider';

    var props = {
      state: stateId,
      'header.state': isPrompt ? 'prompt' : 'provider',
      'header.headline': 'Appointment with ' + s.first,
      'header.overline': s.when,
      'header.duration.text': '45 min',
      'header.label2.hide': true,
      'header.prompt.text': s.question || FALLBACK_QUESTION
    };

    if (isPrompt) {
      // T's follow-up prompt sits in place of the summary
      SECTION_KEYS.forEach(function (k) { props[k + '.hide'] = true; });
    } else {
      props['thoughts.loading'] = phase === 'thoughts-loading' ? 'yes' : 'no';
      props['thoughts.body'] = s.yourThoughts || 'Nothing new came up today.';
      ['suggestions', 'therapist', 'resources'].forEach(function (k) { props[k + '.hide'] = true; });
    }
    return props;
  }

  function photoUrl() {
    return state.p.i.indexOf('data:') === 0 ? state.p.i : REPO + 'therapists/' + state.p.i;
  }

  /* ── Rendering ── */
  function closeAll() {
    document.querySelectorAll('.ap-summary').forEach(function (n) { n.remove(); });
  }

  function restoreHome() {
    var homeBlob = document.querySelector('.hm-blob-canvas');
    if (window.TAvatar && homeBlob) {
      try { window.TAvatar.transferTo(homeBlob); } catch (e) {}
    }
  }

  function render() {
    var screen = document.querySelector('.ap-summary');
    if (!screen) {
      screen = document.createElement('div');
      screen.className = 'ap-screen ap-summary';
      document.getElementById('app').appendChild(screen);
    }

    var html = renderComponent('screens/summary', summaryProps())
      .replace(/src="\.\.\/tds\/assets\/[^"]*"/g, 'src="' + photoUrl() + '"');
    screen.innerHTML = '<button type="button" class="ap-sum-close" aria-label="Close"><i class="icon icon-x"></i></button>' +
      html + (state.phase === 'prompt-chat' ? renderChat() : '');

    screen.querySelector('.ap-sum-close').addEventListener('click', finish);
    var prompt = screen.querySelector('.chat-input');
    if (prompt && state.phase === 'prompt') prompt.addEventListener('click', openChat);
    bindChat(screen);
  }

  function renderChat() {
    var thread = '';
    state.messages.forEach(function (m, i) {
      if (i === 0) return; // the seed is not shown
      thread += '<div class="ap-bubble ' + (m.role === 'user' ? 'is-user' : 'is-t') + '">' + esc(m.content) + '</div>';
    });
    if (state.busy) thread += '<div class="ap-bubble is-t is-typing">...</div>';
    return '<div class="ap-chat">' +
      '<div class="ap-chat-thread">' + thread + '</div>' +
      '<div class="ap-chat-bar"><input class="ap-chat-input" type="text" placeholder="Say anything..." value="' + esc(state.draft) + '">' +
      '<button type="button" class="ap-chat-send" aria-label="Send"><i class="icon icon-arrow-up"></i></button></div>' +
      '<button type="button" class="ap-chat-wrap">I’m ready to wrap up</button>' +
      '</div>';
  }

  function bindChat(screen) {
    var input = screen.querySelector('.ap-chat-input');
    if (!input) return;
    input.addEventListener('input', function () { state.draft = input.value; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    screen.querySelector('.ap-chat-send').addEventListener('click', send);
    screen.querySelector('.ap-chat-wrap').addEventListener('click', function () { send('I’m ready to wrap up.'); });
    input.focus();
  }

  /* ── PAT session ── */
  function sessionPrompt() {
    return fill(promptText(PROMPT_KEYS.session), {
      preferred_name: session().name || 'there',
      current_date: todayLong()
    });
  }

  function openChat() {
    state.phase = 'prompt-chat';
    state.messages = [{ role: 'user', content: SEED }];
    state.busy = true;
    render();
    turn();
  }

  function send(text) {
    var content = (text || state.draft || '').trim();
    if (!content || state.busy) return;
    state.draft = '';
    state.messages.push({ role: 'user', content: content });
    state.busy = true;
    render();
    turn();
  }

  function turn() {
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

  /* ── Your thoughts ── */
  function transcript() {
    return state.messages.filter(function (m, i) { return i > 0; }).map(function (m) {
      return (m.role === 'user' ? 'User: ' : 'T: ') + m.content;
    }).join('\n');
  }

  function endChat() {
    state.phase = 'thoughts-loading';
    render();
    var prompt = fill(promptText(PROMPT_KEYS.thoughts), {
      preferredName: session().name || 'there',
      currentDate: todayLong(),
      conversation: transcript()
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
      phase: 'prompt',
      messages: [],
      draft: '',
      busy: false,
      yourThoughts: null
    };
    closeAll();
    ensureMeta().then(function () {
      render();
      return callChat(fill(promptText(PROMPT_KEYS.engagement), {
        preferredName: session().name || 'there',
        currentDate: todayLong()
      }), [{ role: 'user', content: 'Write the statement now.' }]);
    }).then(function (data) {
      if (data.question && state.phase === 'prompt') {
        state.question = data.question;
        render();
      }
    }).catch(function () {});
  };
})();
