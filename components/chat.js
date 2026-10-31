Components['chat'] = {
  render(container, step, config, allSteps, onNext) {
    var session    = config._session = config._session || {};
    var chatUrl    = config._chatUrl  || '';
    var llmModel   = config._llmModel || '';
    var history    = [];
    var isTyping   = false;
    var suggested  = null;
    var safetyOn   = false;
    var ended      = false;
    var activePrompt = null;
    var activePromptKey = null;
    var activeSessionLabel = '';
    var activeSessionType = '';
    var activeDurationMinutes = 5;
    var tenMinutePhase = null;
    var tenMinuteModule = null;
    var preSessionTranscript = '';
    var timerId = null;
    var sessionElapsedSeconds = 0;
    var sessionTotalSeconds = 0;
    var hasMemberMessage = false;
    var FIRST_MESSAGE_DELAY = 800;
    var FOLLOWUP_MESSAGE_DELAY = 1250;
    var BETWEEN_MESSAGES_DELAY = 500;

    var GREETINGS_1 = [
      "Hi {name}! I'm really glad you're here.",
      "Hey {name} — welcome! I'm excited to work with you.",
      "Hi {name}, welcome! So glad you made it."
    ];
    var GREETINGS_2 = [
      "You can start anywhere — I'll help make sense of whatever's on your mind.",
      "There's no wrong way to start. Just share what's going on and we'll figure it out together.",
      "We can go wherever feels right. I'll follow your lead and help us make sense of it."
    ];
    var GREETINGS_3 = [
      "So, what's been on your mind lately?",
      "So, what's going on for you today?",
      "Where would you like to begin today?",
      "What feels most important to talk through right now?"
    ];
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function getSessionOpeners(promptKey) {
      var raw = (config.openers || {})[promptKey] || '';
      if (!raw) return [];
      return raw.trim().split(/\n---\n/).map(function(variant) {
        return variant.split('\n').map(function(line) { return line.trim(); }).filter(Boolean);
      }).filter(function(variant) { return variant.length > 0; });
    }

    function playModelMessages(text, done) {
      var messages = String(text || '')
        .replace(/\r\n/g, '\n')
        .split(/\n+/)
        .map(function(message) { return message.trim(); })
        .filter(Boolean);

      if (!messages.length) {
        hideTyping();
        if (done) done();
        return;
      }

      var index = 0;
      function showNext() {
        if (index >= messages.length) {
          hideTyping();
          if (done) done();
          input.focus();
          return;
        }

        showTyping();
        var delay = index === 0 ? FIRST_MESSAGE_DELAY : FOLLOWUP_MESSAGE_DELAY;

        setTimeout(function() {
          hideTyping();
          addT(messages[index++]);
          setTimeout(showNext, BETWEEN_MESSAGES_DELAY);
        }, delay);
      }

      showNext();
    }

    function playStaticOpener(messages, done) {
      var index = 0;
      function showNext() {
        if (index >= messages.length) {
          if (messages.length) history.push({ role: 'assistant', content: messages.join('\n\n') });
        if (done) done();
          input.focus();
          return;
        }
        showTyping();
        var delay = index === 0 ? FIRST_MESSAGE_DELAY : FOLLOWUP_MESSAGE_DELAY;
        setTimeout(function() {
          hideTyping();
          var message = messages[index++];
          addT(message);
          setTimeout(showNext, BETWEEN_MESSAGES_DELAY);
        }, delay);
      }
      showNext();
    }

    function formatTiming(seconds) {
      var minutes = Math.floor(seconds / 60);
      var remainder = seconds % 60;
      return minutes + 'm ' + String(remainder).padStart(2, '0') + 's';
    }

    function getSessionTimingContext() {
      if (!activeSessionType || !activeDurationMinutes || !sessionTotalSeconds) return '';
      var totalSeconds = sessionTotalSeconds;
      var elapsedSeconds = Math.min(totalSeconds, Math.max(0, sessionElapsedSeconds));
      var remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
      var localTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
      return '## Session Timing\n' +
        'Local time: ' + localTime + '\n' +
        'Session length: ' + activeDurationMinutes + ' minutes\n' +
        'Elapsed: ' + formatTiming(elapsedSeconds) + '\n' +
        'Remaining: ' + formatTiming(remainingSeconds);
    }

    // The therapist the member booked, for {{provider_name}} in prompts.
    function providerFirstName() {
      var appt = session.appointment;
      return appt && appt.provider && appt.provider.n ? appt.provider.n.split(' ')[0] : 'your therapist';
    }

    function buildPrompt(promptKey, transcript) {
      var name = session.name || 'there';
      var now  = new Date();
      var dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
      var shared = ((config.shared_prompts || {}).conversation_shared || '');
      var specific = (config.prompts || {})[promptKey || 'liwt_demo'] || '';
      var raw = [shared, specific].filter(Boolean).join('\n\n');
      raw = raw.replace(/\n*## Demo openers \(UI only\)[\s\S]*?\[\/DEMO_OPENERS\]\s*/i, '\n');
      var prompt = raw
        .replace(/\{\{preferred_name\}\}/g, name)
        .replace(/\{\{preferredName\}\}/g, name)
        .replace(/\{\{current_date\}\}/g, dateStr)
        .replace(/\{\{provider_name\}\}/g, providerFirstName())
        .replace(/\{\{currentDate\}\}/g, dateStr)
        .replace(/\{\{conversation\}\}/g, transcript || '')
        .replace(/\{\{userTimelineLast21DaysReverse\}\}/g, 'None available.')
        .replace(/\{\{userToolkit\}\}/g, 'None available.')
        .replace(/\{\{recent_topic_sessions\}\}/g, 'None available.');
      if (transcript) {
        prompt += '\n\n## Current Conversation\n---\n' + transcript + '\n---';
      }
      var timing = getSessionTimingContext();
      if (timing) prompt += '\n\n' + timing;
      return prompt;
    }

    /* ── Build DOM ── */
    var screen = document.createElement('div');
    screen.className = 'dc-screen';

    /* Bottom ambient glow */
    var glowWrap = document.createElement('div');
    glowWrap.className = 'dc-glow-wrap';
    var glowCanvas = document.createElement('canvas');
    glowWrap.appendChild(glowCanvas);
    screen.appendChild(glowWrap);

    /* Safety banner */
    var safetyBar = document.createElement('div');
    safetyBar.className = 'dc-safety';
    var safetyTxt = document.createElement('p');
    safetyTxt.className = 'dc-safety-text';
    safetyTxt.textContent = "If you're in crisis: call or text 988 (free, 24/7) · Emergency: call 911";
    var safetyX = document.createElement('button');
    safetyX.className = 'dc-safety-x';
    safetyX.textContent = '×';
    safetyX.addEventListener('click', function() { safetyBar.classList.remove('dc-safety--on'); });
    safetyBar.appendChild(safetyTxt);
    safetyBar.appendChild(safetyX);
    screen.appendChild(safetyBar);

    /* Header */
    var header = document.createElement('div');
    header.className = 'dc-header';

    var hLeft = document.createElement('div');
    hLeft.className = 'dc-header-left';

    var blobWrap = document.createElement('div');
    blobWrap.className = 'dc-blob-wrap';
    var blobCanvas = document.createElement('canvas');
    blobCanvas.className = 'dc-blob-canvas';
    blobWrap.appendChild(blobCanvas);
    hLeft.appendChild(blobWrap);

    var hMeta = document.createElement('div');
    hMeta.className = 'dc-header-meta';
    var hName = document.createElement('p');
    hName.className = 'dc-header-name';
    hName.textContent = 'Leave it with T';
    var hTimer = document.createElement('div');
    hTimer.className = 'dc-session-progress';
    var hTimerFill = document.createElement('div');
    hTimerFill.className = 'dc-session-progress-fill';
    hTimer.appendChild(hTimerFill);
    hMeta.appendChild(hName);
    hMeta.appendChild(hTimer);
    hLeft.appendChild(hMeta);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'dc-header-close';
    var closeImg = document.createElement('img');
    closeImg.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=Check.svg';
    closeImg.style.cssText = 'width:18px;height:18px;display:block;filter:brightness(0) invert(1);';
    closeBtn.appendChild(closeImg);
    closeBtn.addEventListener('click', function() {
      if (activeSessionType === 'PAT') { finishPat(); return; }
      if (activePrompt && !ended && hasMemberMessage) {
        if (timerId) { clearInterval(timerId); timerId = null; }
        hTimer.classList.remove('active');
        showReviewLoading();
        return;
      }
      if (timerId) { clearInterval(timerId); timerId = null; }
      saveLiwtTopicAndClose();
    });

    header.appendChild(hLeft);
    header.appendChild(closeBtn);
    screen.appendChild(header);

    /* Messages */
    var msgs = document.createElement('div');
    msgs.className = 'dc-messages';
    screen.appendChild(msgs);

    /* Input bar */
    var bar = document.createElement('div');
    bar.className = 'dc-bar';
    var inputWrap = document.createElement('div');
    inputWrap.className = 'dc-input-wrap';
    var input = document.createElement('textarea');
    input.className = 'dc-input';
    input.placeholder = 'Message T...';
    input.rows = 1;
    var sendBtn = document.createElement('button');
    sendBtn.className = 'dc-send';
    var sendImg = document.createElement('img');
    sendImg.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
    sendImg.style.cssText = 'width:22px;height:22px;display:block;filter:brightness(0);';
    sendBtn.appendChild(sendImg);
    inputWrap.appendChild(input);
    inputWrap.appendChild(sendBtn);
    bar.appendChild(inputWrap);
    screen.appendChild(bar);
    container.appendChild(screen);

    /* ── Slide in from bottom ── */
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { screen.classList.add('dc-screen--in'); });
    });

    /* ── Mount blob animations via shared TAvatar ── */
    setTimeout(function() {
      if (window.TAvatar) {
        window.TAvatar.mount(blobCanvas);
        window.TAvatar.mountAmbient(glowCanvas);
      }
    }, 50);

    /* ── Helpers ── */
    function scrollBottom(smooth) {
      var target = msgs.scrollHeight;
      if (smooth && typeof msgs.scrollTo === 'function') {
        msgs.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        msgs.scrollTop = target;
      }
    }

    function appendFormattedModelText(element, text) {
      var source = String(text || '');
      var pattern = /(\*{1,2})([^*\n]+?)\1/g;
      var lastIndex = 0;
      var match;

      while ((match = pattern.exec(source))) {
        element.appendChild(document.createTextNode(source.slice(lastIndex, match.index)));

        var strong = document.createElement('strong');
        strong.textContent = match[2];
        element.appendChild(strong);

        lastIndex = pattern.lastIndex;
      }

      element.appendChild(document.createTextNode(source.slice(lastIndex)));
    }

    function addT(text) {
      var row = document.createElement('div');
      row.className = 'dc-row dc-row--t';
      var b = document.createElement('div');
      b.className = 'dc-bubble dc-bubble--t dc-bubble--assistant-enter';
      appendFormattedModelText(b, text);
      row.appendChild(b);
      msgs.appendChild(row);
      scrollBottom();
    }

    function addUser(text) {
      var row = document.createElement('div');
      row.className = 'dc-row dc-row--user';
      var b = document.createElement('div');
      b.className = 'dc-bubble dc-bubble--user';
      b.textContent = text;
      row.appendChild(b);
      msgs.appendChild(row);
      scrollBottom();
    }

    var typingEl = null;
    function showTyping() {
      isTyping = true;
      sendBtn.disabled = true;
      if (typingEl) return;
      var row = document.createElement('div');
      row.className = 'dc-row dc-row--t dc-typing-row';
      var b = document.createElement('div');
      b.className = 'dc-bubble dc-bubble--t dc-typing';
      for (var i = 0; 3 > i; i++) {
        var dot = document.createElement('span');
        dot.className = 'dc-dot';
        b.appendChild(dot);
      }
      row.appendChild(b);
      msgs.appendChild(row);
      typingEl = row;
      requestAnimationFrame(function() {
        row.classList.add('dc-typing-row--visible');
        scrollBottom(true);
      });
    }
    function hideTyping() {
      isTyping = false;
      sendBtn.disabled = false;
      if (typingEl) { typingEl.remove(); typingEl = null; }
    }

    function tryParse(raw) {
      if (!raw) return null;
      if (typeof raw === 'object') return raw;
      try { return JSON.parse(raw); } catch(e) {}
      var stripped = raw.replace(/^\x60\x60\x60[\w]*\s*/, '').replace(/\s*\x60\x60\x60\s*$/, '').trim();
      try { return JSON.parse(stripped); } catch(e) {}
      var m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { return JSON.parse(m[0]); } catch(e2) {} }
      return null;
    }

    /* ── Safety ── */
    function showSafety() {
      if (safetyOn) return;
      safetyOn = true;
      safetyBar.classList.add('dc-safety--on');
    }

    /* ── Fork cards ── */
    function showFork(sessions) {
      var forkRow = document.createElement('div');
      forkRow.className = 'dc-row dc-row--fork';
      var fork = document.createElement('div');
      fork.className = 'dc-fork';

      sessions.forEach(function(sess) {
        var card = document.createElement('button');
        card.className = 'dc-fork-card';

        var is10 = (sess.type === '10_MINS' || sess.type === 'RECENT_TOPIC');
        var img = document.createElement('img');
        img.className = 'dc-fork-img';
        img.src = is10
          ? 'https://richardcollins-pixel.github.io/thoughtful-prototypes/images/Time-10min.png'
          : 'https://richardcollins-pixel.github.io/thoughtful-prototypes/images/Time-5min.png';
        img.alt = is10 ? '10 min' : '5 min';

        var body = document.createElement('div');
        body.className = 'dc-fork-card-body';

        var title = document.createElement('span');
        title.className = 'dc-fork-card-title';
        title.textContent = sess.title || sess.type || '';

        var rat = document.createElement('span');
        rat.className = 'dc-fork-card-rat';
        rat.textContent = sess.rationale || '';

        body.appendChild(title);
        body.appendChild(rat);
        card.appendChild(img);
        card.appendChild(body);
        card.addEventListener('click', function() {
          if (ended) return;
          ended = true;
          selectSession(sess, true);
        });
        fork.appendChild(card);
      });

      /* OR divider */
      var orDiv = document.createElement('div');
      orDiv.className = 'dc-or';
      var orL = document.createElement('div'); orL.className = 'dc-or-line';
      var orT = document.createElement('span'); orT.className = 'dc-or-text'; orT.textContent = 'OR';
      var orR = document.createElement('div'); orR.className = 'dc-or-line';
      orDiv.appendChild(orL); orDiv.appendChild(orT); orDiv.appendChild(orR);
      fork.appendChild(orDiv);

      /* Save for later */
      var saveBtn = document.createElement('button');
      saveBtn.className = 'dc-save';
      saveBtn.textContent = 'Save for later';
      saveBtn.addEventListener('click', function() {
        screen.classList.remove('dc-screen--in');
        setTimeout(function() { screen.remove(); onNext('home'); }, 380);
      });
      fork.appendChild(saveBtn);

      forkRow.appendChild(fork);
      msgs.appendChild(forkRow);
      bar.classList.add('dc-bar--hidden');

      requestAnimationFrame(function() {
        forkRow.classList.add('dc-fork--visible');
        msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
      });
    }

    /* ── Session selected ── */
    function resolvePromptKey(sess, label) {
      var prompts = config.prompts || {};
      var keys = Object.keys(prompts);
      var explicitFields = ['prompt_key', 'promptKey', 'session_key', 'sessionKey', 'key', 'id'];
      var labelFields = ['title', 'session_name', 'sessionName', 'name', 'type'];
      var candidates = [];

      explicitFields.forEach(function(field) {
        if (sess && sess[field]) candidates.push(sess[field]);
      });
      labelFields.forEach(function(field) {
        if (sess && sess[field]) candidates.push(sess[field]);
      });
      if (label) candidates.push(label);

      function canonical(value) {
        return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
      }

      for (var i = 0; i < candidates.length; i++) {
        var candidate = String(candidates[i]);
        if (prompts[candidate]) return candidate;
        var normalized = canonical(candidate);
        var exact = keys.find(function(key) { return canonical(key) === normalized; });
        if (exact) return exact;
        var flexible = keys.find(function(key) {
          var keyName = canonical(key);
          return normalized.length > 5 && (keyName.indexOf(normalized) !== -1 || normalized.indexOf(keyName) !== -1);
        });
        if (flexible) return flexible;
      }
      return null;
    }
    function startSessionTimer(minutes) {
      var total = minutes * 60;
      var remaining = total;
      sessionTotalSeconds = total;
      sessionElapsedSeconds = 0;
      if (timerId) clearInterval(timerId);
      function renderTimer() {
        hTimerFill.style.width = Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) + '%';
      }
      renderTimer();
      timerId = setInterval(function() {
        if (remaining <= 0) { clearInterval(timerId); timerId = null; return; }
        remaining -= 1;
        sessionElapsedSeconds = Math.min(total, sessionElapsedSeconds + 1);
        renderTimer();
      }, 1000);
    }

    function startFiveMinuteTimer() { startSessionTimer(5); }

    var TEN_MIN_MODULES = {
      'cmgkxj8z4006c317sc8g3uesk': { module:'Anxiety & Emotional Regulation', insights:'Ten_Min_AER_Insights', plan:'Ten_Min_AER_Plan' },
      'cmgl58yxx019g2e38f3ucbhce': { module:'Relationships & Boundaries', insights:'Ten_Min_RB_Insights', plan:'Ten_Min_RB_Plan' },
      'cmgl5ck38019p2e380b99ktre': { module:'Self-Confidence & Growth', insights:'Ten_Min_SCG_Insights', plan:'Ten_Min_SCG_Plan' },
      'cmgl5er9c01au2e38xniwmeqc': { module:'Energy, Balance & Routine', insights:'Ten_Min_EBR_Insights', plan:'Ten_Min_EBR_Plan' },
      'cmgl5ez0501b42e38etxhpioi': { module:'Meaning, Positivity & Perspective', insights:'Ten_Min_MPP_Insights', plan:'Ten_Min_MPP_Plan' }
    };

    function transcriptFromHistory(source) {
      return (source || history).map(function(message) {
        return (message.role === 'assistant' ? 'T: ' : 'Member: ') + message.content;
      }).join('\n\n');
    }

    function promptTranscript() {
      return [preSessionTranscript, transcriptFromHistory()].filter(Boolean).join('\n\n');
    }

    function resolveTenMinuteModule(data) {
      if (!data) return null;
      if (TEN_MIN_MODULES[data.prompt]) return TEN_MIN_MODULES[data.prompt];

      var wanted = String(data.sessionModule || '').toLowerCase().replace(/[^a-z]/g, '');
      var selected = null;
      Object.keys(TEN_MIN_MODULES).some(function(key) {
        var candidate = TEN_MIN_MODULES[key];
        if (candidate.module.toLowerCase().replace(/[^a-z]/g, '') === wanted) {
          selected = candidate;
          return true;
        }
        return false;
      });
      if (selected) return selected;

      return null;
    }

    function resolveOpeningModule(data) {
      var selected = resolveTenMinuteModule(data);
      if (selected) return selected;

      if (data && data.status === 'EXIT' && !data.prompt) {
        return TEN_MIN_MODULES['cmgkxj8z4006c317sc8g3uesk'];
      }

      return null;
    }

    function selectSession(sess, enteredFromFork) {
      var label = sess.title || sess.type || 'this session';
      var is10 = (sess.type === '10_MINS' || sess.type === 'RECENT_TOPIC');
      if (is10) {
        startTenMinuteSession(sess, enteredFromFork);
        return;
      }

      var promptKey = resolvePromptKey(sess, label);
      var selectedPrompt = promptKey ? (config.prompts || {})[promptKey] : null;
      if (!selectedPrompt) {
        addT("I couldn't find that session yet. Please try another recommendation.");
        return;
      }

      var transcript = history.map(function(message) {
        return (message.role === 'assistant' ? 'T: ' : 'Member: ') + message.content;
      }).join('\n\n');

      var openerVariants = getSessionOpeners(promptKey);
      var opener = openerVariants.length ? pick(openerVariants) : [];
      opener = opener.map(function(message) {
        return message.replace(/\{\{preferredName\}\}/g, session.name || 'there');
      });

      ended = false;
      activeSessionType = '5';
      activeDurationMinutes = 5;
      activeSessionLabel = label;
      activePromptKey = promptKey;
      activePrompt = buildPrompt(promptKey, transcript);
      preSessionTranscript = transcript;
      history = [];
      hasMemberMessage = false;
      hName.textContent = label;
      hTimer.classList.add('active');
      startFiveMinuteTimer();
      activePrompt = buildPrompt(promptKey, transcript);
      msgs.querySelectorAll('.dc-row--fork').forEach(function(node) { node.remove(); });
      bar.classList.remove('dc-bar--hidden');

      if (enteredFromFork) {
        var handoff = 'The member selected the "' + label + '" session. Continue naturally from the preceding Leave it with T conversation and begin this session. Do not greet them, introduce yourself, or repeat an opening question they have already answered.';
        addUser(label);
        history.push({ role: 'user', content: handoff });
        showTyping();
        fetch(chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system_prompt: activePrompt, messages: history, model: llmModel })
        }).then(function(r) { return r.json(); }).then(function(response) {
          var data = normalizePayload(response);
          hideTyping();
          var message = cleanSessionMessage(data.message || '');
          if (!message) {
            history.pop();
            addT('Something went wrong — please try again.');
            return;
          }
          addT(message);
          history.push({ role: 'assistant', content: message });
          if (!safetyOn && message.indexOf('988') !== -1) showSafety();
          if (isSessionComplete(data, data.message || '')) showSessionEnd();
        }).catch(function() {
          hideTyping();
          history.pop();
          addT('Something went wrong — please try again.');
        });
        return;
      }

      function showNextOpener(index) {
        if (index >= opener.length) {
          if (opener.length) history.push({ role: 'assistant', content: opener.join('\n\n') });
          input.focus();
          return;
        }
        showTyping();
        setTimeout(function() {
          hideTyping();
          var message = opener[index];
          addT(message);
          setTimeout(function() { showNextOpener(index + 1); }, BETWEEN_MESSAGES_DELAY);
        }, index === 0 ? FIRST_MESSAGE_DELAY : FOLLOWUP_MESSAGE_DELAY);
      }

      if (opener.length) {
        showNextOpener(0);
      } else {
        addT("Let’s begin.");
        history.push({ role: 'assistant', content: "Let’s begin." });
        input.focus();
      }
    }

    function parseJsonValue(value) {
      if (value && typeof value === 'object') return value;
      if (typeof value !== 'string') return null;
      var cleaned = value.trim()
        .replace(/^\`\`\`(?:json)?\s*/i, '')
        .replace(/\s*\`\`\`$/, '')
        .trim();
      try { return JSON.parse(cleaned); } catch (err) {}
      var first = cleaned.indexOf('{');
      var last = cleaned.lastIndexOf('}');
      if (first === -1 || last <= first) return null;
      try { return JSON.parse(cleaned.slice(first, last + 1)); } catch (err) { return null; }
    }

    function hasStructuredFields(value) {
      if (!value || typeof value !== 'object') return false;
      return [
        'status', 'message', 'suggested_sessions', 'action', 'prompt',
        'sessionTopic', 'sessionModule', 'title', 'validatingSummary',
        'topics', 'takeaway', 'nextTopicPrompt'
      ].some(function(key) {
        return Object.prototype.hasOwnProperty.call(value, key);
      });
    }

    function normalizePayload(data) {
      if (!data) return {};
      if (typeof data === 'string') return parseJsonValue(data) || { message: data };

      // Prefer a structured JSON payload embedded in a response field.
      var parsedMessage = parseJsonValue(data.message);
      if (hasStructuredFields(parsedMessage)) return Object.assign({}, data, parsedMessage);

      if (hasStructuredFields(data)) return data;

      var candidates = [data.body, data.output, data.response, data.content];
      for (var i = 0; i < candidates.length; i++) {
        var parsed = parseJsonValue(candidates[i]);
        if (hasStructuredFields(parsed)) return parsed;
      }
      return data;
    }

    function resolvedPromptKey() {
      if (activeSessionType !== '10') return activePromptKey;
      if (tenMinutePhase === 'insights' && tenMinuteModule && tenMinuteModule.insights) {
        return tenMinuteModule.insights;
      }
      if (tenMinutePhase === 'plan' && tenMinuteModule && tenMinuteModule.plan) {
        return tenMinuteModule.plan;
      }
      if (tenMinutePhase === 'closing') return 'Ten_Min_Closing';
      return 'Ten_Min_Opening';
    }

    function showPromptLoadError(promptKey) {
      hideTyping();
      console.error('Required prompt was not loaded:', promptKey);
      var row = document.createElement('div');
      row.className = 'dc-row dc-row--t';
      var notice = document.createElement('div');
      notice.className = 'dc-prompt-load-error';
      var copy = document.createElement('div');
      copy.textContent = 'We couldn’t load the next part of this session.';
      var retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Retry';
      retry.addEventListener('click', function() { window.location.reload(); });
      notice.appendChild(copy);
      notice.appendChild(retry);
      row.appendChild(notice);
      msgs.appendChild(row);
      scrollBottom();
    }

    function isSessionComplete(data, message) {
      return data.sessionComplete === true ||
        data.session_complete === true ||
        /\[\[SESSION_COMPLETE\]\]/.test(message || '');
    }

    function cleanSessionMessage(message) {
      return (message || '').replace(/\s*\[\[SESSION_COMPLETE\]\]\s*/g, '').trim();
    }

    function recordRecentTopic(summary, sourceType) {
      var topics = session.recentTopics = session.recentTopics || [];
      var title = (summary && summary.title) || activeSessionLabel || 'A recent conversation';
      var copy = (summary && (summary.nextTopicPrompt || summary.validatingSummary || summary.takeaway || summary.topics)) || 'Pick up where you left off.';
      if (!title || !copy) return;
      topics.unshift({
        id: Date.now() + '-' + Math.random().toString(16).slice(2),
        title: title,
        resumeCopy: copy,
        minutes: sourceType === 'LIWT' ? null : activeDurationMinutes,
        sessionType: sourceType || activeSessionType || 'LIWT',
        transcript: transcriptFromHistory()
      });
      session.recentTopics = topics.slice(0, 8);
    }

    function saveLiwtTopicAndClose() {
      if (hasMemberMessage && history.length) {
        var transcript = transcriptFromHistory();
        fetch(chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_prompt: buildSummaryPrompt(transcript),
            messages: [{ role: 'user', content: 'Create a concise title and a one- or two-sentence pick-up point for this conversation.' }],
            model: llmModel
          })
        }).then(function(r) { return r.json(); }).then(function(data) {
          recordRecentTopic(normalizePayload(data), 'LIWT');
        }).catch(function() {
          recordRecentTopic({ title:'A recent conversation', validatingSummary:'Pick up where you left off.' }, 'LIWT');
        });
      }
      screen.classList.remove('dc-screen--in');
      setTimeout(function() { screen.remove(); onNext('home'); }, 380);
    }

    function buildSummaryPrompt(transcript) {
      var raw = (config.prompts || {}).Bite_Size_Summary_Generation || '';
      var name = session.name || 'there';
      var date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return raw
        .replace(/\{\{preferredName\}\}/g, name)
        .replace(/\{\{currentDate\}\}/g, date)
        .replace(/\{\{conversation\}\}/g, transcript);
    }

    function showReview(summary) {
      recordRecentTopic(summary || {}, activeSessionType || 'LIWT');
      var review = document.createElement('div');
      review.className = 'dc-review';
      var hero = document.createElement('section');
      hero.className = 'dc-review-hero';
      var close = document.createElement('button');
      close.className = 'dc-review-close';
      close.textContent = '×';
      close.addEventListener('click', function() {
        onNext('home', { anchor: 'topics' });
        setTimeout(function() {
          screen.classList.remove('dc-screen--in');
          setTimeout(function() { screen.remove(); }, 380);
        }, 90);
      });
      var date = document.createElement('p');
      date.className = 'dc-review-date';
      date.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      var title = document.createElement('h2');
      title.className = 'dc-review-title';
      title.textContent = summary.title || activeSessionLabel || 'Your session';
      var intro = document.createElement('p');
      intro.className = 'dc-review-summary';
      intro.textContent = summary.validatingSummary || 'You made steady progress today.';
      var duration = document.createElement('p');
      duration.className = 'dc-review-duration';
      var durationIcon = document.createElement('img');
      durationIcon.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg';
      durationIcon.alt = '';
      var durationText = document.createElement('span');
      durationText.textContent = activeDurationMinutes + ' mins';
      duration.appendChild(durationIcon); duration.appendChild(durationText);
      hero.appendChild(close); hero.appendChild(date); hero.appendChild(title); hero.appendChild(intro); hero.appendChild(duration);

      var content = document.createElement('div');
      content.className = 'dc-review-content';
      [
        ['Today’s Topic', summary.topics],
        ['The Reframe', summary.reframe],
        ['The Takeaway', summary.takeaway],
        ['The Plan', summary.plan]
      ].forEach(function(item) {
        if (!item[1]) return;
        var section = document.createElement('section');
        section.className = 'dc-review-section';
        var sectionTitle = document.createElement('h3');
        sectionTitle.textContent = item[0];
        var copy = document.createElement('p');
        copy.textContent = item[1];
        section.appendChild(sectionTitle); section.appendChild(copy); content.appendChild(section);
      });
      review.appendChild(hero); review.appendChild(content);
      screen.appendChild(review);
    }

    function showReviewLoading() {
      var loader = document.createElement('div');
      loader.className = 'dc-review';
      var body = document.createElement('div');
      body.className = 'dc-review-loader';
      var spinner = document.createElement('div');
      spinner.className = 'dc-review-spinner';
      var reviewBlob = document.createElement('canvas');
      reviewBlob.className = 'dc-review-blob';
      spinner.appendChild(reviewBlob);
      var text = document.createElement('p');
      text.textContent = 'Reviewing session';
      body.appendChild(spinner); body.appendChild(text); loader.appendChild(body);
      screen.appendChild(loader);
      if (window.TAvatar) window.TAvatar.mount(reviewBlob);

      var transcript = history.map(function(message) {
        return (message.role === 'assistant' ? 'T: ' : 'Member: ') + message.content;
      }).join('\n\n');
      fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: buildSummaryPrompt(transcript),
          messages: [{ role: 'user', content: 'Create the session summary now.' }],
          model: llmModel
        })
      }).then(function(r) { return r.json(); }).then(function(data) {
        loader.remove();
        showReview(normalizePayload(data));
      }).catch(function() {
        loader.remove();
        showReview({});
      });
    }

    /* ── Appointment Thoughts (PAT): a chat session that the summary starts and picks up when it finishes ── */
    function startPat() {
      ended = false;
      activeSessionType = 'PAT';
      activeSessionLabel = 'Appointment Thoughts';
      activePromptKey = 'Post_Appointment_Thoughts_Session';
      activePrompt = buildPrompt(activePromptKey, '');
      hName.textContent = 'Appointment Thoughts';
      bar.classList.remove('dc-bar--hidden');
      hasMemberMessage = false;
      history = [{ role: 'user', content: '[The user has opened the appointment conversation. Begin.]' }];
      showTyping();
      fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: activePrompt, messages: history, model: llmModel })
      }).then(function(r) { return r.json(); }).then(function(response) {
        var data = normalizePayload(response);
        hideTyping();
        var message = cleanSessionMessage(data.message || '');
        if (!message) { addT('Something went wrong — please try again.'); return; }
        addT(message);
        history.push({ role: 'assistant', content: message });
      }).catch(function() {
        hideTyping();
        addT('Something went wrong — please try again.');
      });
    }

    function finishPat() {
      if (ended && !activePrompt) return;
      var transcript = transcriptFromHistory();
      ended = true;
      if (timerId) { clearInterval(timerId); timerId = null; }
      screen.classList.remove('dc-screen--in');
      setTimeout(function() {
        screen.remove();
        onNext('pat');
        if (window.onPatFinished) window.onPatFinished(transcript);
      }, 380);
    }

    function showSessionEnd() {
      if (ended) return;
      ended = true;
      if (timerId) { clearInterval(timerId); timerId = null; }
      hTimer.classList.remove('active');
      bar.classList.add('dc-bar--hidden');
      var endCard = document.createElement('section');
      endCard.className = 'dc-session-end';
      var eyebrow = document.createElement('p');
      eyebrow.className = 'dc-session-end-eyebrow';
      eyebrow.textContent = 'Time well spent';
      var title = document.createElement('h2');
      title.className = 'dc-session-end-title';
      title.textContent = 'You made steady progress today';
      var reviewButton = document.createElement('button');
      reviewButton.className = 'dc-session-end-button';
      reviewButton.textContent = 'Review key takeaways';
      reviewButton.addEventListener('click', activeSessionType === 'PAT' ? finishPat : showReviewLoading);
      endCard.appendChild(eyebrow); endCard.appendChild(title); endCard.appendChild(reviewButton);
      msgs.appendChild(endCard);
      scrollBottom();
    }

    /* ── End state ── */
    function startTenMinuteSession(sess, enteredFromFork) {
      var label = sess.title || sess.type || 'Your topic';
      var transcript = transcriptFromHistory();
      ended = false;
      activeSessionType = '10';
      activeDurationMinutes = 10;
      activeSessionLabel = label;
      activePromptKey = 'Ten_Min_Opening';
      if (!(config.prompts || {})[activePromptKey]) {
        addT('The 10-minute session is still loading. Please refresh and try again.');
        return;
      }
      var resumeContext = sess.recentTopic
        ? 'The member is returning to this topic:\nTitle: ' + (sess.recentTopic.title || label) + '\nPick-up point: ' + (sess.recentTopic.resumeCopy || '') + '\n'
        : '';
      activePrompt = buildPrompt(activePromptKey, resumeContext || transcript);
      tenMinutePhase = 'opening';
      tenMinuteModule = null;
      preSessionTranscript = transcript;
      history = [];
      hasMemberMessage = false;
      hName.textContent = label;
      hTimer.classList.add('active');
      startSessionTimer(10);
      activePrompt = buildPrompt(activePromptKey, resumeContext || transcript);
      msgs.querySelectorAll('.dc-row--fork').forEach(function(node) { node.remove(); });
      bar.classList.remove('dc-bar--hidden');

      if (!enteredFromFork && !sess.recentTopic) {
        var openerVariants = getSessionOpeners('Ten_Min_Opening');
        var opener = openerVariants.length ? pick(openerVariants) : [];
        opener = opener.map(function(message) {
          return message.replace(/\{\{preferredName\}\}/g, session.name || 'there');
        });
        if (opener.length) {
          playStaticOpener(opener);
          return;
        }
      }

      var handoff = sess.recentTopic
        ? 'The member wants to continue the topic "' + label + '". Their previous pick-up point is: ' + (sess.recentTopic.resumeCopy || 'Continue where they left off.') + ' Continue naturally from that context. Do not greet them or restart the conversation.'
        : 'The member selected the "' + label + '" 10-minute session. Continue naturally from the preceding Leave it with T conversation. Do not greet them, introduce yourself, or repeat an opening question they have already answered.';
      addUser(label);
      history.push({ role:'user', content:handoff });
      showTyping();
      fetch(chatUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ system_prompt:activePrompt, messages:history, model:llmModel })
      }).then(function(r){ return r.json(); }).then(function(response) {
        var data=normalizePayload(response);
        hideTyping();
        var msg=cleanSessionMessage(data.message || '');
        if (!msg) { history.pop(); addT('Something went wrong — please try again.'); return; }
        addT(msg);
        history.push({ role:'assistant', content:msg });
        var chosen=resolveOpeningModule(data);
        if (chosen) {
          tenMinuteModule=chosen;
          tenMinutePhase='insights';
          activePromptKey=chosen.insights;
          activePrompt=buildPrompt(activePromptKey, transcriptFromHistory());
        }
      }).catch(function(){ hideTyping(); history.pop(); addT('Something went wrong — please try again.'); });
    }

    function beginTenMinuteClosing() {
      if (ended) return;
      tenMinutePhase = 'closing';
      activePromptKey = 'Ten_Min_Closing';
      activePrompt = buildPrompt(activePromptKey, transcriptFromHistory());
    }

    async function requestTenMinuteClosing() {
      if (isTyping || ended) return;

      beginTenMinuteClosing();

      var requestPromptKey = resolvedPromptKey();
      if (!(config.prompts || {})[requestPromptKey]) {
        showPromptLoadError(requestPromptKey);
        return;
      }

      var closeInstruction =
        'The member tapped the session checkmark and is ready to wrap up. Close the session now.';

      showTyping();

      try {
        var resp = await fetch(chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_prompt: buildPrompt(requestPromptKey, promptTranscript()),
            messages: history.concat([{ role: 'user', content: closeInstruction }]),
            model: llmModel
          })
        });

        var data = normalizePayload(await resp.json());
        var msg = cleanSessionMessage(data.message || '');

        if (!msg) {
          hideTyping();
          addT('Something went wrong — please try again.');
          return;
        }

        playModelMessages(msg, function() {
          history.push({ role: 'assistant', content: msg });

          if (!safetyOn && msg.indexOf('988') !== -1) showSafety();

          if (data.status === 'EXIT') {
            showSessionEnd();
          }
        });
      } catch (err) {
        hideTyping();
        addT('Something went wrong — please try again.');
      }
    }

        /* ── Send ── */
    async function doSend() {
      var text = input.value.trim();
      if (!text || isTyping || ended) return;
      input.value = '';
      input.style.height = 'auto';
      inputWrap.classList.remove('dc-input-wrap--multiline');
      addUser(text);
      hasMemberMessage = true;
      history.push({ role: 'user', content: text });

      var requestPromptKey = resolvedPromptKey();
      if (activeSessionType === '10' && !(config.prompts || {})[requestPromptKey]) {
        showPromptLoadError(requestPromptKey);
        return;
      }

      showTyping();

      try {
        var resp   = await fetch(chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_prompt: buildPrompt(requestPromptKey, promptTranscript()),
            messages: history,
            model: llmModel
          })
        });
        var data   = normalizePayload(await resp.json());

        var rawMsg = data.message || '';
        var msg  = cleanSessionMessage(rawMsg);
        var sugg = data.suggested_sessions || null;

        if (!msg) {
          hideTyping();
          history.pop();
          addT('Something went wrong — please try again.');
          return;
        }

        var displayMsg = msg;
        if (sugg && sugg.length > 0) {
          var paras = msg.split('\\n\\n');
          var kept = [];
          for (var ki = 0; ki < paras.length; ki++) {
            if (paras[ki].trim().slice(0, 2) !== '**') kept.push(paras[ki]);
          }
          displayMsg = (kept.length > 0 ? kept : [paras[0]]).join('\\n\\n').trim();
        }

        playModelMessages(displayMsg, function() {
          history.push({ role: 'assistant', content: msg });

          if (!safetyOn && msg.indexOf('988') !== -1) showSafety();

          if (activeSessionType === '10') {
            if (tenMinutePhase === 'opening') {
              var chosen = resolveOpeningModule(data);
              if (chosen) {
                tenMinuteModule = chosen;
                tenMinutePhase = 'insights';
                activePromptKey = chosen.insights;
                activePrompt = buildPrompt(activePromptKey, transcriptFromHistory());
              }
            } else if (tenMinutePhase === 'insights' && data.status === 'EXIT' && tenMinuteModule) {
              tenMinutePhase = 'plan';
              activePromptKey = tenMinuteModule.plan;
              activePrompt = buildPrompt(activePromptKey, transcriptFromHistory());
            } else if (tenMinutePhase === 'plan' && data.status === 'EXIT') {
              beginTenMinuteClosing();
            } else if (tenMinutePhase === 'closing' && data.status === 'EXIT') {
              showSessionEnd();
            }
            return;
          }

          if ((activeSessionType === '5' || activeSessionType === 'PAT') && data.status === 'EXIT') {
            showSessionEnd();
            return;
          }

          if (!suggested && sugg && sugg.length > 0) {
            suggested = sugg;
            setTimeout(function() { showFork(suggested); }, 500);
          }
        });

      } catch(err) {
        hideTyping();
        history.pop();
        addT('Something went wrong — please try again.');
      }
    }

    sendBtn.addEventListener('click', doSend);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
    input.addEventListener('input', function() {
      input.style.height = 'auto';
      var sh = input.scrollHeight;
      input.style.height = (120 > sh ? sh : 120) + 'px';
      inputWrap.classList.toggle('dc-input-wrap--multiline', input.scrollHeight > 26);
    });

    /* ── Sequential intro messages ── */
    function sendIntro() {
      var name = session.name || '';
      var m1 = pick(GREETINGS_1).replace('{name}', name || 'there');
      var m2 = pick(GREETINGS_2);
      var m3 = pick(GREETINGS_3);
      function showIntroMessage(message, index, nextMessage) {
        showTyping();
        setTimeout(function() {
          hideTyping();
          addT(message);
          if (!nextMessage) { history.push({ role: 'assistant', content: [m1, m2, m3].join('\n\n') }); input.focus(); return; }
          setTimeout(nextMessage, BETWEEN_MESSAGES_DELAY);
        }, index === 0 ? FIRST_MESSAGE_DELAY : FOLLOWUP_MESSAGE_DELAY);
      }
      showIntroMessage(m1, 0, function() {
        showIntroMessage(m2, 1, function() {
          showIntroMessage(m3, 2, null);
        });
      });
    }
    var pendingBiteSession = session.pendingBiteSession || null;
    delete session.pendingBiteSession;
    if (pendingBiteSession && pendingBiteSession.type === 'PAT') {
      setTimeout(startPat, 400);
    } else if (pendingBiteSession) {
      setTimeout(function() { selectSession(pendingBiteSession); }, 400);
    } else {
      setTimeout(sendIntro, 400);
    }
  }
};
