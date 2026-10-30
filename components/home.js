Components['home'] = {
  render(container, step, config, allSteps, onNext) {
    var session = config._session || {};
    var name = session.name || '';

    var screen = document.createElement('div');
    screen.className = 'hm-screen';

    var glowWrap = document.createElement('div');
    glowWrap.className = 'hm-glow-wrap';
    var glowCanvas = document.createElement('canvas');
    glowWrap.appendChild(glowCanvas);
    screen.appendChild(glowWrap);

    var mediaSlot = document.createElement('div');
    mediaSlot.className = 'hm-media-slot';
    var blobPersist = document.createElement('div');
    blobPersist.className = 'hm-blob-persistent';
    var blobCanvas = document.createElement('canvas');
    blobCanvas.className = 'hm-blob-canvas';
    blobPersist.appendChild(blobCanvas);
    mediaSlot.appendChild(blobPersist);
    var imagePersist = document.createElement('img');
    imagePersist.className = 'hm-image-persist';
    imagePersist.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/therapists/Therapist-7.png';
    imagePersist.alt = '';
    mediaSlot.appendChild(imagePersist);
    var tabLabel = document.createElement('p');
    tabLabel.className = 'hm-tab-label';
    screen.appendChild(tabLabel);

    var page = document.createElement('div');
    page.className = 'hm-page';

    var contentWrap = document.createElement('div');
    contentWrap.style.cssText = 'transition:opacity 0.2s ease;';

    var intro = document.createElement('div');
    intro.className = 'hm-intro';
    var introTitle = document.createElement('p');
    introTitle.className = 'hm-intro-title';
    introTitle.textContent = "Hi, I'm T";
    var introSub = document.createElement('p');
    introSub.className = 'hm-intro-sub';
    introSub.textContent = "Let's get to know each other. This is just a demo to show you what I can do.";
    var introName = document.createElement('input');
    introName.className = 'hm-intro-input';
    introName.type = 'text';
    introName.placeholder = 'Enter Name';
    introName.autocomplete = 'given-name';
    var introEmail = document.createElement('input');
    introEmail.className = 'hm-intro-input';
    introEmail.type = 'email';
    introEmail.placeholder = 'Enter Email';
    introEmail.autocomplete = 'email';
    var introBtn = document.createElement('button');
    introBtn.className = 'hm-intro-btn';
    introBtn.textContent = 'Try a demo';
    intro.appendChild(introTitle); intro.appendChild(introSub); intro.appendChild(introName); intro.appendChild(introEmail); intro.appendChild(introBtn);
    contentWrap.appendChild(intro);

    var hero = document.createElement('div');
    hero.className = 'hm-hero';

    var title = document.createElement('p');
    title.className = 'hm-title';
    title.textContent = 'Leave it here';
    hero.appendChild(title);

    var sub = document.createElement('p');
    sub.className = 'hm-sub';
    sub.textContent = name
      ? "Welcome, " + name + "! Share what's on your mind. We'll make sense of it together."
      : "Share what's on your mind. We'll make sense of it together.";
    hero.appendChild(sub);

    var card = document.createElement('button');
    card.className = 'hm-card';
    var ph = document.createElement('span');
    ph.className = 'hm-card-placeholder';
    ph.textContent = 'Say anything...';
    card.appendChild(ph);
    var cardRow = document.createElement('div');
    cardRow.className = 'hm-card-row';
    var arrowWrap = document.createElement('div');
    arrowWrap.className = 'hm-card-arrow';
    var arrowImg = document.createElement('img');
    arrowImg.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
    arrowImg.style.cssText = 'width:18px;height:18px;display:block;filter:brightness(0);';
    arrowWrap.appendChild(arrowImg);
    cardRow.appendChild(arrowWrap);
    card.appendChild(cardRow);
    title.style.opacity = '0'; title.style.transition = 'opacity 0.5s ease';
    sub.style.opacity = '0'; sub.style.transition = 'opacity 0.5s ease';
    card.style.opacity = '0'; card.style.transition = 'opacity 0.5s ease';
    hero.appendChild(card);
    contentWrap.appendChild(hero);

    var sections = document.createElement('div');
    sections.className = 'hm-sections';

    function makeSection(titleText, subText) {
      var sec = document.createElement('div');
      sec.className = 'hm-section';
      var head = document.createElement('div');
      head.className = 'hm-section-head';
      var st = document.createElement('p'); st.className = 'hm-section-title'; st.textContent = titleText;
      var ss = document.createElement('p'); ss.className = 'hm-section-sub'; ss.textContent = subText;
      head.appendChild(st); head.appendChild(ss);
      sec.appendChild(head);
      return sec;
    }

    /* ── Bite Size Support ── */
    var biteSec = makeSection('Bite Size Support', 'Quick, in the moment, help');
    var biteCarousel = document.createElement('div');
    biteCarousel.className = 'hm-carousel hm-bite-carousel';
    var faceBase = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/faces/Type=';
    var biteColData = [
      ['Calm Down', 'Balance the Thought', 'Set Boundaries', 'Give Yourself Grace', 'Settle for Sleep'],
      ['Reflect on today', 'Nourish Yourself', 'Get Motivated', 'Build Connections', 'Start a Plan']
    ];
    var biteColEls = [];
    biteColData.forEach(function(items, ci) {
      var col = document.createElement('div');
      col.className = 'hm-bite-col';
      col.style.opacity = ci === 0 ? '1' : '0.5';
      items.forEach(function(item) {
        var row = document.createElement('div');
        row.className = 'hm-bite-item';
        row.addEventListener('click', function() {
          launchChat({ title: item === 'Reflect on today' ? 'Reflect On Today' : item, type: '5_MINS' });
        });
        var thumb = document.createElement('div'); thumb.className = 'hm-bite-thumb';
        var faceImg = document.createElement('img');
        faceImg.src = faceBase + encodeURIComponent(item) + '.svg';
        faceImg.alt = item;
        thumb.appendChild(faceImg);
        var info = document.createElement('div'); info.className = 'hm-bite-info';
        var iName = document.createElement('span'); iName.className = 'hm-bite-name'; iName.textContent = item;
        var iMeta = document.createElement('div'); iMeta.className = 'hm-bite-meta';
        var clkImg = document.createElement('img');
        clkImg.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg';
        var timeSpan = document.createElement('span'); timeSpan.textContent = '5 mins';
        iMeta.appendChild(clkImg); iMeta.appendChild(timeSpan);
        info.appendChild(iName); info.appendChild(iMeta);
        var btn = document.createElement('button'); btn.className = 'hm-bite-btn';
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          launchChat({ title: item === 'Reflect on today' ? 'Reflect On Today' : item, type: '5_MINS' });
        });
        var bArrow = document.createElement('img');
        bArrow.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
        btn.appendChild(bArrow);
        row.appendChild(thumb); row.appendChild(info); row.appendChild(btn);
        col.appendChild(row);
      });
      biteCarousel.appendChild(col);
      biteColEls.push(col);
    });
    biteCarousel.addEventListener('scroll', function() {
      var carRect = biteCarousel.getBoundingClientRect();
      biteColEls.forEach(function(col) {
        var colRect = col.getBoundingClientRect();
        var overlap = Math.min(colRect.right, carRect.right) - Math.max(colRect.left, carRect.left);
        var ratio = Math.max(0, Math.min(1, overlap / colRect.width));
        col.style.opacity = (0.5 + ratio * 0.5).toFixed(2);
      });
    });
    biteSec.appendChild(biteCarousel);
    sections.appendChild(biteSec);

    /* ── Your Topics ── */
    var topicSec = makeSection('Your Topics', 'Pick up where you left off');
    topicSec.classList.add('hm-your-topics');
    function launchNewTopic() {
      launchChat({ title: '10 minute session', type: '10_MINS' });
    }

    function makeNewTopicCard() {
      var topicCard = document.createElement('div');
      topicCard.className = 'hm-topic-start-card';
      topicCard.addEventListener('click', launchNewTopic);
      var topicContent = document.createElement('div');
      topicContent.className = 'hm-topic-start-content';
      var topicTitle = document.createElement('p');
      topicTitle.className = 'hm-topic-start-title';
      topicTitle.textContent = 'Start a new topic';
      var topicBody = document.createElement('p');
      topicBody.className = 'hm-topic-start-body';
      topicBody.textContent = "Tell me what's new in your life or something that you've been thinking about.";
      var topicTime = document.createElement('div');
      topicTime.className = 'hm-topic-start-time';
      var topicClk = document.createElement('img');
      topicClk.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg';
      var topicTimeText = document.createElement('span');
      topicTimeText.textContent = '10 min';
      topicTime.appendChild(topicClk); topicTime.appendChild(topicTimeText);
      topicContent.appendChild(topicTitle); topicContent.appendChild(topicBody); topicContent.appendChild(topicTime);
      topicCard.appendChild(topicContent);
      var topicInput = document.createElement('div');
      topicInput.className = 'hm-topic-start-input';
      var topicInputField = document.createElement('input');
      topicInputField.type = 'text';
      topicInputField.placeholder = 'Say anything...';
      topicInputField.readOnly = true;
      topicInputField.tabIndex = -1;
      var topicSubmit = document.createElement('button');
      topicSubmit.className = 'hm-topic-start-submit';
      topicSubmit.tabIndex = -1;
      var topicSubmitImg = document.createElement('img');
      topicSubmitImg.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
      topicSubmit.appendChild(topicSubmitImg);
      topicInput.appendChild(topicInputField); topicInput.appendChild(topicSubmit);
      topicCard.appendChild(topicInput);
      return topicCard;
    }

    function makeRecentTopicCard(topic) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'hm-recent-topic-card';
      card.addEventListener('click', function() {
        launchChat({
          title: topic.title || 'Continue this topic',
          type: 'RECENT_TOPIC',
          recentTopic: topic
        });
      });

      var headline = document.createElement('p');
      headline.className = 'hm-recent-topic-title';
      headline.textContent = topic.title || 'Continue this topic';

      var copy = document.createElement('p');
      copy.className = 'hm-recent-topic-copy';
      copy.textContent = topic.resumeCopy || 'Pick up where you left off.';

      var time = document.createElement('div');
      time.className = 'hm-recent-topic-time';
      var clock = document.createElement('img');
      clock.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg';
      var text = document.createElement('span');
      text.textContent = (topic.minutes || 10) + ' min';
      time.appendChild(clock); time.appendChild(text);

      var cta = document.createElement('div');
      cta.className = 'hm-recent-topic-cta';
      var ctaText = document.createElement('span');
      ctaText.textContent = 'Start session';
      var ctaArrow = document.createElement('img');
      ctaArrow.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
      cta.appendChild(ctaText); cta.appendChild(ctaArrow);

      card.appendChild(headline); card.appendChild(copy); card.appendChild(time); card.appendChild(cta);
      return card;
    }

    var topicContentSlot = document.createElement('div');

    function renderRecentTopics() {
      topicContentSlot.innerHTML = '';
      var recentTopics = session.recentTopics || [];

      if (recentTopics.length === 0) {
        topicContentSlot.appendChild(makeNewTopicCard());
        return;
      }

      var topicRail = document.createElement('div');
      topicRail.className = 'hm-recent-topic-rail' + (recentTopics.length === 1 ? ' hm-recent-topic-rail--single' : '');
      recentTopics.forEach(function(topic) {
        topicRail.appendChild(makeRecentTopicCard(topic));
      });
      topicContentSlot.appendChild(topicRail);

      var newTopic = document.createElement('button');
      newTopic.type = 'button';
      newTopic.className = 'hm-new-topic-button';
      newTopic.textContent = '+  New Topic';
      newTopic.addEventListener('click', launchNewTopic);
      topicContentSlot.appendChild(newTopic);
    }

    renderRecentTopics();
    topicSec.appendChild(topicContentSlot);
    sections.appendChild(topicSec);

    /* ── Deep Dive ── */
    var deepSec = makeSection('Deep Dives', 'Gain insights and make a plan');
    var deepCard = document.createElement('div');
    deepCard.className = 'hm-deep-card';
    var dTitle = document.createElement('p'); dTitle.className = 'hm-deep-title'; dTitle.textContent = 'Get unstuck';
    var dBody = document.createElement('p'); dBody.className = 'hm-deep-body';
    dBody.textContent = "Dig deep into an area of your life causing you challenges. Unpack what's going on and build a plan to move forward.";
    var dTime = document.createElement('div'); dTime.className = 'hm-deep-time';
    var dClk = document.createElement('img');
    dClk.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg';
    var dTimeText = document.createElement('span'); dTimeText.textContent = '30 min';
    dTime.appendChild(dClk); dTime.appendChild(dTimeText);
    var dCta = document.createElement('button'); dCta.className = 'hm-deep-cta';
    dCta.addEventListener('click', openModal);
    var dCtaText = document.createElement('span'); dCtaText.textContent = 'Start a deep dive';
    var dCtaArrow = document.createElement('img');
    dCtaArrow.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
    dCta.appendChild(dCtaText); dCta.appendChild(dCtaArrow);
    deepCard.appendChild(dTitle); deepCard.appendChild(dBody); deepCard.appendChild(dTime); deepCard.appendChild(dCta);
    deepSec.appendChild(deepCard);
    sections.appendChild(deepSec);

    /* ── Therapist ── */
    var therapistSec = makeSection('Your Therapist', 'Get support and accountability');
    var therapistCard = document.createElement('div');
    therapistCard.className = 'hm-therapist-card';
    therapistCard.addEventListener('click', openBookingFlow);
    var avatarsDiv = document.createElement('div');
    avatarsDiv.className = 'hm-therapist-avatars';
    ['Therapist-1.png', 'Therapist-2.png', 'Therapist-3.png'].forEach(function(fname) {
      var av = document.createElement('img');
      av.className = 'hm-therapist-avatar';
      av.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/therapists/' + fname;
      av.alt = '';
      avatarsDiv.appendChild(av);
    });
    var tTitle = document.createElement('p'); tTitle.className = 'hm-therapist-title'; tTitle.textContent = 'Let’s find your therapist';
    var tBody = document.createElement('p'); tBody.className = 'hm-therapist-body'; tBody.textContent = "I'll help you find the right therapist and keep you supported every step of the way";
    var tCta = document.createElement('button'); tCta.className = 'hm-therapist-cta'; tCta.textContent = 'Find your match';
    therapistCard.appendChild(avatarsDiv); therapistCard.appendChild(tTitle); therapistCard.appendChild(tBody); therapistCard.appendChild(tCta);
    therapistSec.appendChild(therapistCard);
    sections.appendChild(therapistSec);

    sections.style.opacity = '0'; sections.style.transition = 'opacity 0.5s ease';
    contentWrap.appendChild(sections);

    var placeholder = document.createElement('div');
    placeholder.className = 'hm-placeholder';
    contentWrap.appendChild(placeholder);

    page.appendChild(mediaSlot);
    page.appendChild(contentWrap);
    screen.appendChild(page);

    var header = document.createElement('div');
    header.className = 'hm-header';
    var demoTag = document.createElement('button');
    demoTag.className = 'hm-demo-tag';
    demoTag.textContent = 'Demo';
    header.appendChild(demoTag);
    screen.appendChild(header);

    var modalOverlay = document.createElement('div');
    modalOverlay.className = 'hm-modal-overlay';
    var modal = document.createElement('div');
    modal.className = 'hm-modal';
    var mClose = document.createElement('button'); mClose.className = 'hm-modal-close';
    mClose.type = 'button'; mClose.setAttribute('aria-label', 'Close demo modal'); mClose.textContent = '×';
    var mTitle = document.createElement('p'); mTitle.className = 'hm-modal-title';
    mTitle.textContent = 'This is a demo';
    var mBody = document.createElement('p'); mBody.className = 'hm-modal-body';
    mBody.textContent = 'This is a preview of Thoughtful so limited functionality is available. The best way to get a feel for it is to chat with T.';
    var mCta = document.createElement('button'); mCta.className = 'hm-modal-cta';
    mCta.type = 'button'; mCta.textContent = 'Try chatting with T';
    modal.appendChild(mClose); modal.appendChild(mTitle); modal.appendChild(mBody); modal.appendChild(mCta);
    modalOverlay.appendChild(modal);
    screen.appendChild(modalOverlay);
    var providers=[
      {"n": "Ron L.", "c": "LCSW", "s": "Anxiety, stress & life transitions", "i": "Therapist-1.png", "q": "You don't have to have it all figured out to start.", "b": "Ron is an LCSW with 11 years specializing in anxiety and CBT. He takes a practical approach to help you understand what's going on and build real tools to manage it."},
      {"n": "Kristina R.", "c": "LCSW", "s": "Work stress & self-confidence", "i": "Therapist-2.png", "q": "Small, steady steps add up to real change.", "b": "Kristina is an LCSW with 8 years helping people manage work stress and build self-confidence. Sessions blend CBT with practical goal-setting, so you leave with something to try."},
      {"n": "Maya S.", "c": "LMFT", "s": "Relationships & communication", "i": "Therapist-3.png", "q": "Better communication starts with feeling heard.", "b": "Maya is an LMFT with 9 years supporting individuals and couples through relationship challenges. Sessions focus on communication, connection and the patterns that keep you stuck."},
      {"n": "Marco A.", "c": "LPC", "s": "Burnout & boundaries", "i": "Therapist-4.png", "q": "Rest is part of the work, not a reward for it.", "b": "Marco is an LPC with 7 years helping people recover from burnout and set boundaries that stick. Expect a warm, direct style grounded in ACT and mindfulness."},
      {"n": "Rachel T.", "c": "LCSW", "s": "Anxiety & coping skills", "i": "Therapist-5.png", "q": "Anxiety makes more sense once we understand it.", "b": "Rachel is an LCSW with 12 years treating anxiety with CBT and practical coping skills. Sessions are structured and collaborative, so you always know what you're working toward."},
      {"n": "Priya P.", "c": "LMHC", "s": "Identity & personal growth", "i": "Therapist-6.png", "q": "Growth starts when you get curious about yourself.", "b": "Priya is an LMHC with 6 years helping people explore identity, values and personal growth. The approach is curious and affirming, drawing on ACT and mindfulness."},
      {"n": "Grace K.", "c": "LMFT", "s": "Relationships & life changes", "i": "Therapist-7.png", "q": "Change is easier when you don't face it alone.", "b": "Grace is an LMFT with 10 years guiding people through relationship shifts and big life changes. Sessions are calm, practical and paced to you."},
      {"n": "Mark B.", "c": "LCSW", "s": "Stress, resilience & change", "i": "Therapist-8.png", "q": "Resilience is a skill, and it can be learned.", "b": "Mark is an LCSW with 14 years helping people handle stress and build resilience through change. Expect a grounded mix of CBT and solution-focused work."},
      {"n": "Ethan N.", "c": "LPC", "s": "Anxiety & emotional wellness", "i": "Therapist-9.png", "q": "Every feeling is information worth listening to.", "b": "Ethan is an LPC with 5 years supporting people with anxiety and emotional wellbeing. Sessions use DBT and mindfulness skills to help you feel steadier day to day."},
      {"n": "Natalie M.", "c": "LMFT", "s": "Work, relationships & balance", "i": "Therapist-10.png", "q": "Balance isn't perfect. It's something we practice.", "b": "Natalie is an LMFT with 9 years helping people balance work, relationships and their own needs. The style is relaxed, honest and focused on what matters most to you."}
    ];
    function providerImage(p){return p.i.indexOf('data:')===0?p.i:'https://richardcollins-pixel.github.io/thoughtful-prototypes/therapists/'+p.i;}
    var booking=document.createElement('div'),bookingScroll=document.createElement('div'),toast=document.createElement('div');
    booking.className='hm-booking';bookingScroll.className='hm-booking-scroll';booking.appendChild(bookingScroll);screen.appendChild(booking);toast.className='hm-home-toast';screen.appendChild(toast);
    var book={step:0,a:[],p:null,d:'Tue, Oct 20',t:'10:00 AM'};
    var questions=[
      ['What brings you here today?',['Going through something hard','Working on my mental health','Curious to explore','Checking out my employer benefit']],
      ['How would you describe your mental health right now?',['Struggling and need support','Hard but managing','Okay, want to be better','Doing well']],
      ['What does support look like for you?',['Someone to listen','Practical advice and tools','Help understanding myself better','A mix']],
      ['Have you worked with a therapist before?',['Yes, currently','Yes, in the past',"Tried it, wasn't for me",'Never have']]
    ];
    function clearBook(){bookingScroll.className='hm-booking-scroll';bookingScroll.innerHTML='';bookingScroll.scrollTop=0;}
    function bookingTop(){var top=document.createElement('div'),back=document.createElement('button'),progress=document.createElement('div');top.className='hm-booking-top';back.className='hm-booking-close';back.type='button';back.setAttribute('aria-label','Back');back.onclick=function(){if(book.step>0){book.step--;renderQuestion();}else{closeBooking();}};progress.className='hm-booking-progress';for(var i=0;i<4;i++){var dot=document.createElement('i');if(i===book.step)dot.className='active';progress.appendChild(dot);}top.append(back,progress);bookingScroll.appendChild(top);}
    function bookText(h,p){var title=document.createElement('h2'),copy=document.createElement('p');title.className='hm-booking-title';copy.className='hm-booking-copy';title.textContent=h;copy.textContent=p;bookingScroll.append(title,copy);}
    function renderQuestion(){clearBook();bookingTop();var q=questions[book.step],wrap=document.createElement('div'),blob=document.createElement('canvas'),title=document.createElement('h2'),options=document.createElement('div'),continueBtn=document.createElement('button');wrap.className='hm-question-wrap';blob.className='hm-booking-blob';blob.width=80;blob.height=80;title.className='hm-booking-title';title.textContent=q[0];options.className='hm-question-options';q[1].forEach(function(choice){var option=document.createElement('button');option.className='hm-booking-option'+(book.a[book.step]===choice?' selected':'');option.type='button';option.textContent=choice;option.onclick=function(){book.a[book.step]=choice;renderQuestion();};options.appendChild(option);});continueBtn.className='hm-question-continue'+(book.a[book.step]?' ready':'');continueBtn.type='button';continueBtn.textContent='Continue';continueBtn.disabled=!book.a[book.step];continueBtn.onclick=function(){if(book.step<3){book.step++;renderQuestion();}else{renderMatches();}};wrap.append(blob,title,options);bookingScroll.append(wrap,continueBtn);if(window.TAvatar){try{window.TAvatar.mount(blob);}catch(e){}}}
    function bookTop(label,onBack){var top=document.createElement('div'),back=document.createElement('button'),t=document.createElement('span');top.className='hm-booking-top hm-sub-top';back.className='hm-booking-close';back.type='button';back.setAttribute('aria-label','Back');back.onclick=onBack||function(){renderMatches();};t.className='hm-sub-title';t.textContent=label;top.append(back,t);bookingScroll.appendChild(top);}
    function renderMatches(){clearBook();bookingScroll.classList.add('is-sub');bookTop('Your Matches',function(){book.step=questions.length-1;renderQuestion();});var h=document.createElement('h2');h.className='hm-mx-title';h.textContent='Choose your therapist';var rail=document.createElement('div');rail.className='hm-mx-rail';var dots=document.createElement('div');dots.className='hm-mx-dots';var choose=document.createElement('button');choose.className='hm-mx-choose';choose.type='button';var idx=0;providers.forEach(function(p,k){var card=document.createElement('div'),img=document.createElement('img'),body=document.createElement('div'),name=document.createElement('p'),q=document.createElement('p'),bio=document.createElement('p');card.className='hm-mx-card';img.className='hm-mx-img';img.src=providerImage(p);img.alt='';body.className='hm-mx-body';name.className='hm-mx-name';name.textContent=p.n;q.className='hm-mx-quote';q.textContent='"'+p.q+'"';bio.className='hm-mx-bio';bio.textContent=p.b;body.append(name,q,bio);card.append(img,body);rail.appendChild(card);var d=document.createElement('i');if(k===0)d.className='active';dots.appendChild(d);});function setIdx(n){idx=n;choose.textContent='Choose '+providers[n].n;Array.prototype.forEach.call(dots.children,function(d,k){d.className=k===n?'active':'';});}rail.addEventListener('scroll',function(){var c=rail.firstChild;if(!c)return;var w=c.offsetWidth+16;var n=Math.max(0,Math.min(providers.length-1,Math.round(rail.scrollLeft/w)));if(n!==idx)setIdx(n);});choose.onclick=function(){book.p=providers[idx];renderAvailability();};setIdx(0);bookingScroll.append(h,rail,dots,choose);}
    function makeSlots(label,items,value,setter){var l=document.createElement('p'),row=document.createElement('div');l.className='hm-slot-label';l.textContent=label;row.className='hm-slot-row';items.forEach(function(item){var b=document.createElement('button');b.className='hm-slot'+(item===value?' selected':'');b.type='button';b.textContent=item;b.onclick=function(){setter(item);renderAvailability();};row.appendChild(b);});bookingScroll.append(l,row);}
    function bkWeekdays(page){var out=[],d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+1);var skip=page*5;while(out.length<5){var w=d.getDay();if(w>0&&w<6){if(skip>0)skip--;else out.push(new Date(d));}d.setDate(d.getDate()+1);}return out;}
    var BK_TIMES=[['9:00 am','1:30 pm','3:30 pm','5:00 pm'],['8:30 am','11:00 am','2:00 pm','4:30 pm'],['10:00 am','12:30 pm','3:00 pm','6:00 pm']];
    function renderAvailability(){clearBook();bookingScroll.classList.add('is-sub');bookTop('Book Session');if(book.wk==null)book.wk=0;var days=bkWeekdays(book.wk);if(!book.day||!days.some(function(x){return x.getTime()===book.day.getTime();})){book.day=days[0];book.t=null;}var wrap=document.createElement('div');wrap.className='hm-bk';var pr=document.createElement('div'),av=document.createElement('img'),nm=document.createElement('p');pr.className='hm-bk-provider';av.className='hm-bk-avatar';av.src=providerImage(book.p);av.alt='';nm.className='hm-bk-name';nm.textContent=book.p.n;pr.append(av,nm);var s1=document.createElement('div'),head=document.createElement('div'),l1=document.createElement('p'),nav=document.createElement('div'),prev=document.createElement('button'),next=document.createElement('button');s1.className='hm-bk-sec';head.className='hm-bk-head';l1.className='hm-bk-label';l1.textContent='Soonest Availability';nav.className='hm-bk-nav';prev.className='hm-bk-arrow';prev.type='button';prev.setAttribute('aria-label','Earlier dates');prev.innerHTML='<img src="https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=chevron%20left.svg" alt="">';prev.disabled=book.wk===0;prev.onclick=function(){book.wk--;renderAvailability();};next.className='hm-bk-arrow';next.type='button';next.setAttribute('aria-label','Later dates');next.innerHTML='<img src="https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=chevron%20right.svg" alt="">';next.disabled=book.wk>=2;next.onclick=function(){book.wk++;renderAvailability();};nav.append(prev,next);head.append(l1,nav);var row=document.createElement('div');row.className='hm-bk-days';days.forEach(function(dt){var b=document.createElement('button'),dy=document.createElement('span'),dn=document.createElement('b');b.type='button';b.className='hm-bk-day'+(dt.getTime()===book.day.getTime()?' selected':'');dy.textContent=dt.toLocaleDateString('en-US',{weekday:'short'});dn.textContent=dt.getDate();b.append(dy,dn);b.onclick=function(){book.day=dt;book.t=null;renderAvailability();};row.appendChild(b);});s1.append(head,row);var s2=document.createElement('div'),l2=document.createElement('p'),tz=document.createElement('p'),grid=document.createElement('div');s2.className='hm-bk-sec';l2.className='hm-bk-label';l2.textContent=book.day.toLocaleDateString('en-US',{weekday:'long'})+' Openings';tz.className='hm-bk-sub';var tzName='your local time zone';try{tzName=new Intl.DateTimeFormat('en-US',{timeZoneName:'long'}).formatToParts(new Date()).filter(function(x){return x.type==='timeZoneName';})[0].value;}catch(e){}tz.textContent='All times are shown in '+tzName;grid.className='hm-bk-times';BK_TIMES[book.day.getDate()%3].forEach(function(t){var b=document.createElement('button');b.type='button';b.className='hm-bk-time'+(book.t===t?' selected':'');b.textContent=t;b.onclick=function(){book.t=t;renderAvailability();};grid.appendChild(b);});s2.append(l2,tz,grid);wrap.append(pr,s1,s2);var confirm=document.createElement('button');confirm.className='hm-mx-choose hm-bk-confirm';confirm.type='button';confirm.textContent='Confirm Booking';confirm.disabled=!book.t;confirm.onclick=function(){if(!book.t)return;book.d=book.day.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});confirmBooking();};bookingScroll.append(wrap,confirm);}
    function openBookingFlow(){book.step=0;book.a=[];book.p=null;book.wk=0;book.day=null;book.t=null;renderQuestion();booking.classList.remove('closing');booking.classList.add('open');}
    function restoreHomeBlob(){if(window.TAvatar){try{window.TAvatar.mount(blobCanvas);}catch(e){}}}
    function closeBooking(){booking.classList.remove('open');restoreHomeBlob();}
    function renderBookedCard(p){therapistCard.removeEventListener('click',openBookingFlow);therapistCard.innerHTML='';therapistCard.className='hm-booked-card';therapistCard.setAttribute('aria-live','polite');var row=document.createElement('div'),av=document.createElement('img'),col=document.createElement('div'),top=document.createElement('div'),ttl=document.createElement('p'),edit=document.createElement('img'),meta=document.createElement('div'),note=document.createElement('p');row.className='hm-booked-row';av.className='hm-booked-avatar';av.src=providerImage(p);av.alt='';col.className='hm-booked-col';top.className='hm-booked-top';ttl.className='hm-booked-title';ttl.textContent='Appointment with '+p.n.split(' ')[0];edit.className='hm-booked-edit';edit.src='https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=Edit.svg';edit.alt='';top.append(ttl);meta.className='hm-booked-meta';[['https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=Calendar.svg',book.d+' at '+book.t],['https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg','45 mins']].forEach(function(m){var l=document.createElement('div'),ic=document.createElement('img'),tx=document.createElement('span');l.className='hm-booked-label';ic.src=m[0];ic.alt='';tx.textContent=m[1];l.append(ic,tx);meta.appendChild(l);});var join=document.createElement('button');join.className='hm-booked-join';join.type='button';join.textContent='Join Appointment';join.addEventListener('click',function(e){e.stopPropagation();if(window.launchAppointment)window.launchAppointment(p);});col.append(top,meta,join);row.append(av,col);therapistCard.appendChild(row);}
    var toastTimer=null;
    function showToast(){toast.innerHTML='';var bar=document.createElement('div'),body=document.createElement('div'),icw=document.createElement('div'),ic=document.createElement('span'),txt=document.createElement('div'),t=document.createElement('strong'),m=document.createElement('span');bar.className='hm-toast-bar';body.className='hm-toast-body';icw.className='hm-toast-icon';ic.className='hm-toast-check';icw.appendChild(ic);txt.className='hm-toast-text';t.textContent='Appointment confirmed';m.textContent='Check your email to join, reschedule, or cancel your session';txt.append(t,m);body.append(icw,txt);toast.append(bar,body);toast.setAttribute('role','status');clearTimeout(toastTimer);toast.classList.remove('show');void toast.offsetWidth;toast.classList.add('show');toastTimer=setTimeout(function(){toast.classList.remove('show');},3500);}
    function confirmBooking(){var p=book.p;renderBookedCard(p);session.appointment={provider:p,status:'booked',d:book.d,t:book.t};sections.insertBefore(therapistSec,sections.firstChild);tabEls.forEach(function(el,k){el.classList.toggle('active',k===0);});page.scrollTop=0;restoreHomeBlob();booking.classList.add('closing');setTimeout(function(){booking.classList.remove('open','closing');setTimeout(showToast,120);},400);}

    function openModal() { modalOverlay.classList.add('open'); }
    function closeModal() { modalOverlay.classList.remove('open'); }
    demoTag.addEventListener('click', openModal);
    mClose.addEventListener('click', closeModal);
    mCta.addEventListener('click', function() {
      closeModal();
      launchChat();
    });
    modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });

    var tabBar = document.createElement('div');
    tabBar.className = 'hm-tab-bar';
    var tabDefs = [
      { src: 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=home.svg', label: 'Home' },
      { src: 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=person.svg', label: 'Patterns' },
      { src: 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=Therapy.svg', label: 'Growth Areas' },
      { src: 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=Help.svg', label: 'Your Therapist' }
    ];
    var tabEls = [];
    tabDefs.forEach(function(t, i) {
      var tab = document.createElement('button');
      tab.className = 'hm-tab' + (i === 0 ? ' active' : '');
      var img = document.createElement('img');
      img.src = t.src;
      tab.appendChild(img);
      tab.addEventListener('click', function() {
        tabEls.forEach(function(el, j) { el.classList.toggle('active', j === i); });
        if (i === 0) { showHome(); } else { showStaticPage(t.label, i); }
      });
      tabBar.appendChild(tab);
      tabEls.push(tab);
    });
    screen.appendChild(tabBar);

    var switching = false;
    function fadeSwitch(swap) {
      if (switching) { swap(); return; }
      switching = true;
      contentWrap.style.opacity = '0';
      setTimeout(function() {
        swap();
        void contentWrap.offsetHeight;
        contentWrap.style.opacity = '1';
        setTimeout(function() { switching = false; }, 220);
      }, 220);
    }

    function showHome() {
      tabLabel.style.display = 'none';
      blobPersist.style.opacity = '1';
      imagePersist.style.opacity = '0';
      imagePersist.classList.remove('hm-image-persist--therapist');
      fadeSwitch(function() {
        hero.style.display = '';
        sections.style.display = '';
        placeholder.classList.remove('active');
        placeholder.innerHTML = '';
        page.scrollTop = 0;
        title.style.opacity = '1';
        sub.style.opacity = '1';
        card.style.opacity = '1';
        sections.style.opacity = '1';
      });
    }

    function resetToHome() {
      tabEls.forEach(function(el, j) { el.classList.toggle('active', j === 0); });
      switching = false;
      tabLabel.style.display = 'none';
      blobPersist.style.opacity = '1';
      imagePersist.style.opacity = '0';
      imagePersist.classList.remove('hm-image-persist--therapist');
      contentWrap.style.opacity = '1';
      hero.style.display = '';
      sections.style.display = '';
      placeholder.classList.remove('active');
      placeholder.innerHTML = '';
      page.scrollTop = 0;
      title.style.opacity = '1';
      sub.style.opacity = '1';
      card.style.opacity = '1';
      sections.style.opacity = '1';
    }

    function showStaticPage(label, tabIndex) {
      tabLabel.textContent = label;
      tabLabel.style.display = 'block';
      blobPersist.style.opacity = (tabIndex === 3) ? '0' : '1';
      imagePersist.style.opacity = (tabIndex === 3) ? '1' : '0';
      imagePersist.classList.toggle('hm-image-persist--therapist', tabIndex === 3);
      fadeSwitch(function() {
        hero.style.display = 'none';
        sections.style.display = 'none';
        placeholder.innerHTML = '';
        placeholder.classList.add('active');
        page.scrollTop = 0;

        var sp = document.createElement('div');
        sp.className = 'hm-static-page';

        if (tabIndex === 1) {
          var ptTitle = document.createElement('h2');
          ptTitle.className = 'hm-static-title';
          ptTitle.textContent = 'Discover your patterns';
          var ptCopy = document.createElement('p');
          ptCopy.className = 'hm-static-copy';
          ptCopy.textContent = 'These are the themes coming through in your conversations and sessions';
          sp.appendChild(ptTitle); sp.appendChild(ptCopy);

          var patSec = document.createElement('div');
          patSec.className = 'hm-pattern-section';
          var patList = document.createElement('div');
          patList.className = 'hm-pattern-list';
          var patterns = [
            { label: 'Loyalty', diamonds: 3, title: "When you're in, you're all in", body: "The people in your life know they can count on you — because reliability meant something where you came from. You saw what it looked like when people showed up for each other and you decided early on that you'd be that person." },
            { label: 'Conflict Avoidance', diamonds: 4, title: 'You go quiet when things get tense', body: 'It was probably safer that way once. Keeping the peace, not making things worse, staying small until it blew over. That worked then. Now it shows up as swallowed words and conversations you never quite have.' },
            { label: 'Self-criticism', diamonds: 5, title: "You're harder on yourself than you'd ever be on anyone else", body: "The standard was high early on — or maybe it was inconsistent, which is its own kind of hard. Either way you internalized a voice that's still there, still watching, still finding what's not quite good enough." }
          ];
          patterns.forEach(function(pat) {
            var pc = document.createElement('div');
            pc.className = 'hm-pattern-card';
            var plabel = document.createElement('span'); plabel.className = 'hm-pattern-label'; plabel.textContent = pat.label;
            var pdiamonds = document.createElement('div'); pdiamonds.className = 'hm-pattern-diamonds';
            for (var d = 0; d < pat.diamonds; d++) {
              var diamond = document.createElement('div'); diamond.className = 'hm-pattern-diamond';
              pdiamonds.appendChild(diamond);
            }
            var ptit = document.createElement('p'); ptit.className = 'hm-pattern-title'; ptit.textContent = pat.title;
            var pbod = document.createElement('p'); pbod.className = 'hm-pattern-body'; pbod.textContent = pat.body;
            var parr = document.createElement('button'); parr.className = 'hm-pattern-arrow';
            parr.addEventListener('click', openModal);
            var parrImg = document.createElement('img');
            parrImg.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
            parr.appendChild(parrImg);
            pc.appendChild(plabel); pc.appendChild(pdiamonds); pc.appendChild(ptit); pc.appendChild(pbod); pc.appendChild(parr);
            patList.appendChild(pc);
          });
          patSec.appendChild(patList);
          var patAll = document.createElement('button'); patAll.className = 'hm-pattern-all'; patAll.textContent = 'View all patterns';
          patAll.addEventListener('click', openModal);
          patSec.appendChild(patAll);
          sp.appendChild(patSec);

          var portraitSec = document.createElement('section');
          portraitSec.className = 'hm-portrait-section';
          var portraitTitle = document.createElement('h3');
          portraitTitle.className = 'hm-portrait-title';
          portraitTitle.textContent = 'Build your portrait';
          var portraitCopy = document.createElement('p');
          portraitCopy.className = 'hm-portrait-copy';
          portraitCopy.textContent = 'Dive in and create a better picture of you';
          var portraitCarousel = document.createElement('div');
          portraitCarousel.className = 'hm-portrait-carousel';
          [
            'What kind of work do you do, and what does stress feel like for you?',
            'Who do you feel most yourself around, and what makes it feel easy?',
            'What helps you feel grounded when life gets busy?'
          ].forEach(function(questionText) {
            var portraitCard = document.createElement('div');
            portraitCard.className = 'hm-portrait-card';
            var question = document.createElement('p');
            question.className = 'hm-portrait-question';
            question.textContent = questionText;
            var answer = document.createElement('button');
            answer.className = 'hm-portrait-answer';
            answer.addEventListener('click', openModal);
            var answerText = document.createElement('span');
            answerText.textContent = 'Answer this';
            var answerArrow = document.createElement('img');
            answerArrow.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
            answer.appendChild(answerText); answer.appendChild(answerArrow);
            portraitCard.appendChild(question); portraitCard.appendChild(answer);
            portraitCarousel.appendChild(portraitCard);
          });
          portraitSec.appendChild(portraitTitle); portraitSec.appendChild(portraitCopy); portraitSec.appendChild(portraitCarousel);
          sp.appendChild(portraitSec);

        } else if (tabIndex === 2) {
          var gaTitle = document.createElement('h2');
          gaTitle.className = 'hm-static-title';
          gaTitle.textContent = 'Own your personal growth';
          var gaCopy = document.createElement('p');
          gaCopy.className = 'hm-static-copy';
          gaCopy.textContent = "These are the areas you're committed to grow stronger in";
          sp.appendChild(gaTitle); sp.appendChild(gaCopy);

          var growthSec = document.createElement('div');
          growthSec.className = 'hm-growth-section';
          var growthList = document.createElement('div');
          growthList.className = 'hm-growth-list';
          var growthAreas = [
            { title: 'Setting Boundaries', step: 4, stage: '4. Action', body: "You're getting better at knowing where your limits are — and saying so out loud. This is about closing the gap between what you tolerate and what you actually want.", cta: 'Talk about this' },
            { title: 'Being Present', step: 3, stage: '3. Preparation', body: "You're working on being in the room you're actually in — not the next meeting, the last conversation, or the thing you said three days ago. More here, less everywhere else.", cta: 'Talk about this' },
            { title: 'Asking for Help', step: 2, stage: '2. Contemplation', body: "You're good at handling things. You're working on letting others handle some of them with you. This is about letting people in without it feeling like a failure.", cta: 'Talk about this' }
          ];
          growthAreas.forEach(function(ga) {
            var gc = document.createElement('div');
            gc.className = 'hm-growth-card';
            var gtit = document.createElement('h3'); gtit.className = 'hm-growth-title'; gtit.textContent = ga.title;
            var tracker = document.createElement('div'); tracker.className = 'hm-growth-tracker';
            for (var d = 0; d < 5; d++) {
              var dot = document.createElement('div');
              dot.className = 'hm-growth-dot' + (d === ga.step - 1 ? ' active' : '');
              tracker.appendChild(dot);
            }
            var stage = document.createElement('p'); stage.className = 'hm-growth-stage'; stage.textContent = ga.stage;
            var gbod = document.createElement('p'); gbod.className = 'hm-growth-body'; gbod.textContent = ga.body;
            var gcta = document.createElement('button'); gcta.className = 'hm-growth-cta'; gcta.textContent = ga.cta;
            gcta.addEventListener('click', openModal);
            var gctaArrow = document.createElement('img');
            gctaArrow.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=arrow%20up.svg';
            gcta.appendChild(gctaArrow);
            gc.appendChild(gtit); gc.appendChild(tracker); gc.appendChild(stage); gc.appendChild(gbod); gc.appendChild(gcta);
            growthList.appendChild(gc);
          });
          growthSec.appendChild(growthList);
          var gaAdd = document.createElement('button'); gaAdd.className = 'hm-growth-add'; gaAdd.textContent = 'Add a growth area';
          gaAdd.addEventListener('click', openModal);
          growthSec.appendChild(gaAdd);
          sp.appendChild(growthSec);

          var recommendationSec = document.createElement('section');
          recommendationSec.className = 'hm-provider-section';
          var recommendationTitle = document.createElement('h3');
          recommendationTitle.className = 'hm-provider-section-title';
          recommendationTitle.textContent = 'Recommendations';
          var recommendationCopy = document.createElement('p');
          recommendationCopy.className = 'hm-provider-section-copy';
          recommendationCopy.textContent = 'Kristina recommended exercises for you';
          var recommendationList = document.createElement('div');
          recommendationList.className = 'hm-recommendations';
          [
            { title: 'Setting Limits at Work', face: 'Set Boundaries' },
            { title: 'Perfectionism Check-In', face: 'Give Yourself Grace' },
            { title: 'Evening Wind-Down', face: 'Settle for Sleep' }
          ].forEach(function(item) {
            var recommendation = document.createElement('div');
            recommendation.className = 'hm-recommendation';
            var thumb = document.createElement('img');
            thumb.className = 'hm-recommendation-thumb';
            thumb.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/faces/Type=' + encodeURIComponent(item.face) + '.svg';
            thumb.alt = '';
            var info = document.createElement('div');
            var name = document.createElement('p');
            name.className = 'hm-recommendation-name';
            name.textContent = item.title;
            var time = document.createElement('p');
            time.className = 'hm-recommendation-time';
            time.textContent = '◷ 5 min';
            info.appendChild(name); info.appendChild(time);
            recommendation.appendChild(thumb); recommendation.appendChild(info);
            recommendationList.appendChild(recommendation);
          });
          recommendationSec.appendChild(recommendationTitle); recommendationSec.appendChild(recommendationCopy); recommendationSec.appendChild(recommendationList);
          sp.appendChild(recommendationSec);

        } else if (tabIndex === 3) {
          sp.classList.add('hm-therapist-page');
          var therapistName = document.createElement('h2');
          therapistName.className = 'hm-therapist-name';
          therapistName.textContent = 'Kristina R.';
          var therapistBio = document.createElement('p');
          therapistBio.className = 'hm-therapist-bio';
          therapistBio.textContent = 'Kristina is an LCSW with 11 years specializing in anxiety and CBT. She takes a practical approach to help you understand what is going on and build real tools to manage it.';
          var therapistActions = document.createElement('div');
          therapistActions.className = 'hm-therapist-actions';
          ['Schedule Session', 'Switch Therapist'].forEach(function(label) {
            var action = document.createElement('button');
            action.className = 'hm-therapist-action';
            action.textContent = label;
            action.addEventListener('click', openModal);
            therapistActions.appendChild(action);
          });
          sp.appendChild(therapistName); sp.appendChild(therapistBio); sp.appendChild(therapistActions);

          var appointmentSec = document.createElement('section');
          appointmentSec.className = 'hm-provider-section';
          var appointmentTitle = document.createElement('h3');
          appointmentTitle.className = 'hm-provider-section-title';
          appointmentTitle.textContent = 'Appointments';
          var appointmentCopy = document.createElement('p');
          appointmentCopy.className = 'hm-provider-section-copy';
          appointmentCopy.textContent = 'You have an upcoming session';
          var appointmentCard = document.createElement('div');
          appointmentCard.className = 'hm-appointment-card';
          var appointmentMain = document.createElement('div');
          appointmentMain.className = 'hm-appointment-main';
          var appointmentAvatar = document.createElement('img');
          appointmentAvatar.className = 'hm-appointment-avatar';
          appointmentAvatar.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/therapists/Therapist-7.png';
          appointmentAvatar.alt = '';
          var appointmentInfo = document.createElement('div');
          var appointmentName = document.createElement('p');
          appointmentName.className = 'hm-appointment-name';
          appointmentName.textContent = 'Your session with Kristina';
          var appointmentTime = document.createElement('p');
          appointmentTime.className = 'hm-appointment-time';
          appointmentTime.textContent = 'Wed, Jun 4 at 10:00 am';
          appointmentInfo.appendChild(appointmentName); appointmentInfo.appendChild(appointmentTime);
          appointmentMain.appendChild(appointmentAvatar); appointmentMain.appendChild(appointmentInfo);
          var appointmentBtn = document.createElement('button');
          appointmentBtn.className = 'hm-appointment-btn';
          appointmentBtn.textContent = 'Edit Appointment';
          appointmentBtn.addEventListener('click', openModal);
          appointmentCard.appendChild(appointmentMain); appointmentCard.appendChild(appointmentBtn);
          appointmentSec.appendChild(appointmentTitle); appointmentSec.appendChild(appointmentCopy); appointmentSec.appendChild(appointmentCard);
          sp.appendChild(appointmentSec);

          var previousSec = document.createElement('section');
          previousSec.className = 'hm-provider-section';
          var previousTitle = document.createElement('h3');
          previousTitle.className = 'hm-provider-section-title';
          previousTitle.textContent = 'Previous Sessions';
          var previousCopy = document.createElement('p');
          previousCopy.className = 'hm-provider-section-copy';
          previousCopy.textContent = "Here's where you left off";
          var previousCard = document.createElement('div');
          previousCard.className = 'hm-previous-card';
          var previousDate = document.createElement('p');
          previousDate.className = 'hm-previous-date';
          previousDate.textContent = 'Thurs, Oct 20 1:15pm';
          var previousSession = document.createElement('div');
          previousSession.className = 'hm-previous-session';
          var previousAvatar = document.createElement('img');
          previousAvatar.className = 'hm-previous-avatar';
          previousAvatar.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/therapists/Therapist-7.png';
          previousAvatar.alt = '';
          var previousSessionTitle = document.createElement('p');
          previousSessionTitle.className = 'hm-previous-title';
          previousSessionTitle.textContent = 'Finding steadiness at work';
          previousSession.appendChild(previousAvatar); previousSession.appendChild(previousSessionTitle);
          var previousSummary = document.createElement('p');
          previousSummary.className = 'hm-previous-summary';
          previousSummary.textContent = 'You explored the pressure you feel at work and practiced slowing down before anxiety takes over. You left with a small plan for noticing what you need in the moment.'
          var previousTime = document.createElement('p');
          previousTime.className = 'hm-previous-time';
          var previousClock = document.createElement('img');
          previousClock.src = 'https://richardcollins-pixel.github.io/thoughtful-prototypes/icons/Name=clock.svg';
          previousClock.alt = '';
          var previousTimeText = document.createElement('span');
          previousTimeText.textContent = '45 min';
          previousTime.appendChild(previousClock); previousTime.appendChild(previousTimeText);
          previousCard.appendChild(previousDate); previousCard.appendChild(previousSession); previousCard.appendChild(previousSummary); previousCard.appendChild(previousTime);
          var sessionsAll = document.createElement('button');
          sessionsAll.className = 'hm-sessions-all';
          sessionsAll.textContent = 'See all sessions';
          sessionsAll.addEventListener('click', openModal);
          previousSec.appendChild(previousTitle); previousSec.appendChild(previousCopy); previousSec.appendChild(previousCard); previousSec.appendChild(sessionsAll);
          sp.appendChild(previousSec);

        }

        placeholder.appendChild(sp);
      });
    }

    function revealHomeContent() {
      tabBar.style.display = '';
      intro.style.display = 'none';
      hero.style.display = '';
      sections.style.display = '';
      setTimeout(function() {
        title.style.opacity = '1';
        sub.style.opacity = '1';
        card.style.opacity = '1';
        sections.style.opacity = '1';
      }, 40);
    }

    function finishIntro() {
      var enteredName = introName.value.trim();
      var enteredEmail = introEmail.value.trim();
      if (!enteredName) { introName.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail)) {
        introEmail.setCustomValidity('Enter a valid email address.');
        introEmail.reportValidity();
        introEmail.focus();
        return;
      }
      introEmail.setCustomValidity('');
      name = enteredName.charAt(0).toUpperCase() + enteredName.slice(1);
      session.name = name;
      session.email = enteredEmail;
      var leadCaptureEndpoint = 'https://eoihyzfjlqh391d.m.pipedream.net';
      if (leadCaptureEndpoint) {
        fetch(leadCaptureEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submitted_at: new Date().toISOString(),
            name: name,
            email: session.email
          })
        }).catch(function() {});
      }
      sub.textContent = "Welcome, " + name + "! Share what's on your mind. We'll make sense of it together.";
      intro.classList.add('out');
      setTimeout(revealHomeContent, 380);
    }

    introBtn.addEventListener('click', finishIntro);
    introName.addEventListener('keydown', function(e) { if (e.key === 'Enter') introEmail.focus(); });
    introEmail.addEventListener('input', function() { introEmail.setCustomValidity(''); });
    introEmail.addEventListener('keydown', function(e) { if (e.key === 'Enter') finishIntro(); });

    function mountHome() {
      if (!name) {
        tabBar.style.display = 'none';
        hero.style.display = 'none';
        sections.style.display = 'none';
        intro.style.display = 'flex';
        requestAnimationFrame(function() { intro.classList.add('active'); });
        return;
      }
      revealHomeContent();
    }

    var chatOpen = false;
    function launchChat(biteSession) {
      if (chatOpen) return;
      var isBiteSession = biteSession && typeof biteSession === 'object' &&
        typeof biteSession.title === 'string' && biteSession.title.trim().length > 0;
      if (isBiteSession) session.pendingBiteSession = biteSession;
      else delete session.pendingBiteSession;
      chatOpen = true;
      var chatComp = window.Components && window.Components['chat'];
      var chatStep = allSteps['chat'];
      if (!chatComp || !chatStep) { chatOpen = false; return; }
      chatComp.render(container, chatStep, config, allSteps, function(stepName, options) {
        chatOpen = false;
        renderRecentTopics();
        resetToHome();
        if (options && options.anchor === 'topics') {
          requestAnimationFrame(function() {
            page.scrollTop = Math.max(0, topicSec.offsetTop - 20);
          });
        }
        setTimeout(mountHome, 0);
      });
    }
    card.addEventListener('click', launchChat);

    /* ── Appointment state: booked = Join card at the top; completed = Book next session at the bottom ── */
    function renderNextCard(p) {
      therapistCard.innerHTML = '';
      therapistCard.className = 'hm-next-card';
      therapistCard.addEventListener('click', openModal);
      var row = document.createElement('div'); row.className = 'hm-next-row';
      var av = document.createElement('img'); av.className = 'hm-next-avatar'; av.src = providerImage(p); av.alt = '';
      var col = document.createElement('div'); col.className = 'hm-next-col';
      var nm = document.createElement('p'); nm.className = 'hm-next-name'; nm.textContent = p.n;
      var sb = document.createElement('p'); sb.className = 'hm-next-sub'; sb.textContent = 'Ready to book your next session?';
      col.appendChild(nm); col.appendChild(sb); row.appendChild(av); row.appendChild(col);
      var cta = document.createElement('button'); cta.className = 'hm-next-cta'; cta.type = 'button'; cta.textContent = 'Book next session';
      therapistCard.appendChild(row); therapistCard.appendChild(cta);
    }

    function restoreTherapistState() {
      var appt = session.appointment;
      if (!appt) return;
      if (appt.status === 'booked') {
        book.d = appt.d; book.t = appt.t;
        renderBookedCard(appt.provider);
        sections.insertBefore(therapistSec, sections.firstChild);
      } else if (appt.status === 'completed') {
        renderNextCard(appt.provider);
      }
    }

    restoreTherapistState();

    window.demoConfig = config;

    // Called by the summary when it closes: a new recent topic is now in session.recentTopics.
    window.onAppointmentSummaryClosed = function () {
      renderRecentTopics();
      requestAnimationFrame(function () {
        page.scrollTop = Math.max(0, topicSec.offsetTop - 20);
      });
    };

    // Starts the Appointment Thoughts chat from the summary.
    window.launchPat = function () {
      launchChat({ title: 'Appointment Thoughts', type: 'PAT' });
    };

    window.onAppointmentEnded = function (p) {
      session.appointment = { provider: p, status: 'completed' };
      sections.appendChild(therapistSec);
      renderNextCard(p);
    };

    container.appendChild(screen);
    blobPersist.style.transition = 'none';
    imagePersist.style.transition = 'none';
    if (window.TAvatar) {
      window.TAvatar.mountAmbient(glowCanvas);
      window.TAvatar.mount(blobCanvas);
    }
    setTimeout(function() {
      blobPersist.style.transition = 'opacity 0.22s ease';
      imagePersist.style.transition = 'opacity 0.22s ease';
      mountHome();
    }, 0);
  }
};
