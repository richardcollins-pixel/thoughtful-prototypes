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

  // Design-system definitions, inlined so the summary does not depend on a fetch (generated from design-system/).
  var META_SOURCE = {"screens/summary":{"name":"Summary","tier":"screens","category":"screens","stateful":false,"uses":["organisms/header-card","molecules/text-section","patterns/suggestions-section","patterns/therapist-section","patterns/resources-section","organisms/loading-state"],"figma":"https://www.figma.com/design/pdq8KcTCIJAtXwcgReiwlC/Thoughtful-Design-System?node-id=4197-43941","align":"top","states":[{"id":"t","name":"T","template":"<main class=\"summary\"><div class=\"summary__header\" data-slot=\"header\">{{item:header}}</div><div class=\"summary__sections\" data-slot=\"sections\">{{item:thoughts}}{{item:topic}}{{item:reframe}}{{item:plan}}{{item:suggestions}}{{item:therapist}}{{item:resources}}</div></main>","slots":[{"id":"header","label":"Header slot","items":["header"]},{"id":"sections","label":"Sections slot","items":["thoughts","topic","reframe","plan","suggestions","therapist","resources"]}],"personas":["provider"],"overrides":{"header":{"props":{"state":"default"}}}},{"id":"provider","name":"Provider","template":"<main class=\"summary\"><div class=\"glow summary__glow\" data-theme=\"cool\" data-placement=\"bottom\" aria-hidden=\"true\"><canvas></canvas></div><div class=\"summary__header\" data-slot=\"header\">{{item:header}}</div><div class=\"summary__sections\" data-slot=\"sections\">{{item:thoughts}}{{item:topic}}{{item:reframe}}{{item:plan}}{{item:suggestions}}{{item:therapist}}{{item:resources}}</div></main>","slots":[{"id":"header","label":"Header slot","items":["header"]},{"id":"sections","label":"Sections slot","items":["thoughts","topic","reframe","plan","suggestions","therapist","resources"]}],"personas":["provider"],"overrides":{"header":{"props":{"state":"provider","headline":"Appointment with Kristina","duration.text":"45 min"}}}},{"id":"provider-follow-up","name":"Provider, follow-up prompt","template":"<main class=\"summary\"><div class=\"glow summary__glow\" data-theme=\"cool\" data-placement=\"bottom\" aria-hidden=\"true\"><canvas></canvas></div><div class=\"summary__header\" data-slot=\"header\">{{item:header}}</div><div class=\"summary__sections\" data-slot=\"sections\">{{item:thoughts}}{{item:topic}}{{item:reframe}}{{item:plan}}{{item:suggestions}}{{item:therapist}}{{item:resources}}</div></main>","slots":[{"id":"header","label":"Header slot","items":["header"]},{"id":"sections","label":"Sections slot","items":["thoughts","topic","reframe","plan","suggestions","therapist","resources"]}],"personas":["provider"],"overrides":{"header":{"props":{"state":"prompt","headline":"Appointment with Kristina","duration.text":"45 min"}}}},{"id":"provider-thoughts-loading","name":"Provider, your thoughts loading","template":"<main class=\"summary\"><div class=\"glow summary__glow\" data-theme=\"cool\" data-placement=\"bottom\" aria-hidden=\"true\"><canvas></canvas></div><div class=\"summary__header\" data-slot=\"header\">{{item:header}}</div><div class=\"summary__sections\" data-slot=\"sections\">{{item:thoughts}}{{item:topic}}{{item:reframe}}{{item:plan}}{{item:suggestions}}{{item:therapist}}{{item:resources}}</div></main>","slots":[{"id":"header","label":"Header slot","items":["header"]},{"id":"sections","label":"Sections slot","items":["thoughts","topic","reframe","plan","suggestions","therapist","resources"]}],"personas":["provider"],"overrides":{"header":{"props":{"state":"provider","headline":"Appointment with Kristina","duration.text":"45 min"}},"thoughts":{"props":{"show":"on","loading":"yes","tag":""}}}},{"id":"provider-thoughts","name":"Provider, your thoughts added","template":"<main class=\"summary\"><div class=\"glow summary__glow\" data-theme=\"cool\" data-placement=\"bottom\" aria-hidden=\"true\"><canvas></canvas></div><div class=\"summary__header\" data-slot=\"header\">{{item:header}}</div><div class=\"summary__sections\" data-slot=\"sections\">{{item:thoughts}}{{item:topic}}{{item:reframe}}{{item:plan}}{{item:suggestions}}{{item:therapist}}{{item:resources}}</div></main>","slots":[{"id":"header","label":"Header slot","items":["header"]},{"id":"sections","label":"Sections slot","items":["thoughts","topic","reframe","plan","suggestions","therapist","resources"]}],"personas":["provider"],"overrides":{"header":{"props":{"state":"provider","headline":"Appointment with Kristina","duration.text":"45 min"}},"thoughts":{"props":{"show":"on","loading":"no","tag":""}}}},{"id":"loading","name":"Loading","template":"<section class=\"summary-loading\"><div class=\"summary-loading__body\" data-slot=\"loader\">{{item:loader}}</div></section>","slots":[{"id":"loader","label":"Loader slot","items":["loader"]}],"personas":[]}],"variables":{},"styles":[],"selector":".summary","description":"What T writes up after a session. A header (the date, the title, a line and how long it took) over sections you can show or hide in the Sections slot: Today\u2019s Topic, The Reframe and The Plan (T can leave one out if it does not fit the session), Suggestions (only for LIWT conversations), and, for higher acuity, Your therapist and Support Resources. Off the record shows a label in the header when the person chose it, in any conversation. T is the version T writes; Provider is the version a provider reads, with their photo in a flat header. The provider\u2019s summary has the post-appointment thoughts flow as states: T\u2019s follow-up prompt in place of the summary, then Your Thoughts loading, then added by you.","items":{"header":{"type":"component","component":"organisms/header-card","label":"Header","props":{"state":"default","overline":"Thurs, Oct 20 at 12:38pm","headline":"Managing Financial Stress","body":"You mentioned feeling anxious at work. We could slow this down together and look at what might help you feel more steady.","duration.text":"10 min"},"expose":["overline","headline","body"]},"topic":{"type":"component","component":"molecules/text-section","label":"Today\u2019s Topic","props":{"heading":"Today\u2019s Topic","body":"You came in feeling overwhelmed by low-grade depression and anxiety primarily driven by the financial uncertainty of your work situation.","show":"on"},"expose":["heading","body"]},"reframe":{"type":"component","component":"molecules/text-section","label":"The Reframe","props":{"heading":"The Reframe","body":"We reframed your challenge of paralyzing anxiety to a matter of reclaiming your power by focusing on what you can control","show":"on"},"expose":["heading","body"]},"plan":{"type":"component","component":"molecules/text-section","label":"The Plan","props":{"heading":"The Plan","body":"Immediate Self-Care: Try meditating today (after this session or at 3 PM) to create a clear moment of peace.\n\nSkill Use: Use the 4-4-6 breathing technique when anxiety spikes to reclaim calm.\n\nRoutine Fix: Introduce a \u201ctech reward\u201d system for your children to ease the stressful bedtime routine and lower your evening tension.","show":"on"},"expose":["heading","body"]},"suggestions":{"type":"component","component":"patterns/suggestions-section","label":"Suggestions","props":{"state":"default","show":"off"},"expose":["heading","copy"]},"therapist":{"type":"component","component":"patterns/therapist-section","label":"Want to talk to someone?","props":{"state":"summary-find","show":"off"},"expose":["state","heading"]},"resources":{"type":"component","component":"patterns/resources-section","label":"Support Resources","props":{"state":"default","show":"off"},"expose":["heading","copy"]},"thoughts":{"type":"component","component":"molecules/text-section","label":"Your Thoughts","props":{"heading":"Your Thoughts","body":"You came in feeling overwhelmed by low-grade depression and anxiety primarily driven by the financial uncertainty of your work situation.","show":"off"},"expose":["heading","body","tag","loading"]},"loader":{"type":"component","component":"organisms/loading-state","label":"Loading state","props":{"state":"default"},"expose":["msg1","msg2","msg3"]}},"personas":["provider"],"properties":[],"prompts":[],"inputs":[{"id":"session","label":"Session","type":"select","options":[{"value":"5 min","set":[["header","duration.text","5 min"]]},{"value":"10 min","set":[["header","duration.text","10 min"]]},{"value":"30 min","set":[["header","duration.text","30 min"]]},{"value":"1 hr","set":[["header","duration.text","1 hr"]]}]},{"id":"label","label":"Label","type":"select","options":[{"value":"none","label":"None","set":[["header","label2.show","off"],["header","duration.show","on"]]},{"value":"otr","label":"Off the record","set":[["header","label2.show","on"],["header","label2.icon","person-x"],["header","label2.text","Off the Record"],["header","duration.show","on"]]},{"value":"saved","label":"Leave it with T","set":[["header","label2.show","on"],["header","label2.icon","bookmark"],["header","label2.text","Leave it with T"],["header","duration.show","off"]]}]},{"id":"back","label":"Header","type":"select","options":[{"value":"close","label":"Close","set":[["header","header.variant","close"]]},{"value":"history","label":"Back (from history)","set":[["header","header.variant","sub-section"],["header","header.title","History"]]}]},{"id":"follow","label":"Top of the summary","type":"select","options":[{"value":"summary","label":"Summary","set":[["header","state","provider"]]},{"value":"prompt","label":"T\u2019s follow-up prompt","set":[["header","state","prompt"]]}]},{"id":"thoughts","label":"Your Thoughts","type":"select","options":[{"value":"off","label":"Off","set":[["thoughts","show","off"]]},{"value":"loading","label":"Loading","set":[["thoughts","show","on"],["thoughts","loading","yes"],["thoughts","tag",""]]},{"value":"added","label":"Added by you","set":[["thoughts","show","on"],["thoughts","loading","no"],["thoughts","tag","Added by you"]]}]}]},"organisms/header-card":{"name":"Header card","tier":"organisms","category":"cards","stateful":false,"uses":["atoms/card","atoms/avatar","molecules/icon-label","molecules/skeleton-text","molecules/header","molecules/avatar-text","molecules/chat-input"],"figma":"https://www.figma.com/design/pdq8KcTCIJAtXwcgReiwlC/Thoughtful-Design-System?node-id=41-3988","states":[{"id":"default","name":"Default","template":"<article class=\"card header-card\" data-variant=\"default\"><div class=\"header-card__top\" data-slot=\"top\">{{item:header}}</div><div class=\"header-card__content\" data-slot=\"content\"><div class=\"header-card__titles\">{{item:overline}}{{item:headline}}</div>{{item:body}}<div class=\"header-card__labels\" data-slot=\"labels\">{{item:duration}}{{item:label2}}</div></div></article>","slots":[{"id":"top","label":"Top slot","items":["header"]},{"id":"content","label":"Content slot","items":["overline","headline","body","duration"],"skeleton":true},{"id":"labels","label":"Labels slot","items":["duration","label2"]}],"personas":[]},{"id":"provider","name":"Provider","template":"<article class=\"card header-card\" data-variant=\"provider\"><div class=\"header-card__top\" data-slot=\"top\">{{item:header}}</div><div class=\"header-card__content\" data-slot=\"content\">{{item:photo}}<div class=\"header-card__titles\">{{item:overline}}{{item:headline}}</div>{{item:body}}<div class=\"header-card__labels\" data-slot=\"labels\">{{item:duration}}{{item:label2}}</div></div></article>","slots":[{"id":"top","label":"Top slot","items":["header"]},{"id":"content","label":"Content slot","items":["photo","overline","headline","body","duration"],"skeleton":true},{"id":"labels","label":"Labels slot","items":["duration","label2"]}],"personas":["provider"],"overrides":{"duration":{"props":{"text":"1 hr"}}}},{"id":"prompt","name":"Follow-up prompt","template":"<article class=\"card header-card\" data-variant=\"prompt\"><span class=\"header-card__light\" data-glow-layer aria-hidden=\"true\"></span><div class=\"header-card__top\" data-slot=\"top\">{{item:header}}</div><div class=\"header-card__content\" data-slot=\"content\">{{item:photo}}<div class=\"header-card__titles\">{{item:overline}}{{item:headline}}</div><div class=\"header-card__chat\" data-slot=\"chat\">{{item:chat}}{{item:prompt}}</div></div></article>","slots":[{"id":"top","label":"Top slot","items":["header"]},{"id":"content","label":"Content slot","items":["photo","overline","headline","chat","prompt"],"skeleton":true}],"personas":["provider"],"overrides":{"headline":{"value":"Appointment with Kristina"}}},{"id":"hero","name":"Hero, warm","template":"<article class=\"card header-card\" data-variant=\"hero\"><div class=\"header-card__top\" data-slot=\"top\">{{item:header}}</div><div class=\"header-card__content\" data-slot=\"content\"><div class=\"header-card__titles\">{{item:headline}}</div></div></article>","slots":[{"id":"top","label":"Top slot","items":["header"]},{"id":"content","label":"Content slot","items":["headline"]}],"personas":[],"overrides":{"header":{"props":{"variant":"sub-section","title":"Support"}},"headline":{"value":"How can we help?"}}},{"id":"hero-cool","name":"Hero, cool","template":"<article class=\"card header-card\" data-variant=\"hero-cool\"><div class=\"header-card__top\" data-slot=\"top\">{{item:header}}</div><div class=\"header-card__content\" data-slot=\"content\"><div class=\"header-card__titles\">{{item:headline}}</div></div></article>","slots":[{"id":"top","label":"Top slot","items":["header"]},{"id":"content","label":"Content slot","items":["headline"]}],"personas":[],"overrides":{"header":{"props":{"variant":"sub-section","title":"Support"}},"headline":{"value":"How can we help?"}}}],"variables":{"--card-fill":"fill","--card-radius":"radius"},"styles":[],"selector":".header-card","description":"The card that opens a screen, with the header (status bar and close button) on top: it runs to the screen edges and its bottom corners are rounded. Default is the colorful one with an overline, headline, a line of copy and a duration. Provider is the quiet one with the provider's photo on top. Hero is the title page version: the back button and page title on top and one big centered headline, in the warm gradient (Support) or the cool one (About).","items":{"photo":{"type":"component","component":"atoms/avatar","label":"Photo","props":{"size":"lg"},"bind":{"person":"provider"},"expose":["person"]},"overline":{"type":"text","tag":"p","class":"header-card__overline","label":"Overline","value":"Overline","skeleton":{"lines":1}},"headline":{"type":"text","tag":"h2","class":"header-card__headline","label":"Headline","value":"Headline goes here","skeleton":{"lines":1}},"body":{"type":"text","tag":"p","class":"header-card__body","label":"Body Copy","value":"Body copy goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.","skeleton":{"lines":2}},"duration":{"type":"component","component":"molecules/icon-label","label":"Duration","props":{"icon":"clock","text":"5 min","emphasis":"primary","size":"md"},"expose":["text","icon"]},"header":{"type":"component","component":"molecules/header","label":"Header","props":{"variant":"close"},"expose":["variant","title","action","step"]},"label2":{"type":"component","component":"molecules/icon-label","label":"Label 2","props":{"icon":"person-x","text":"Off the Record","emphasis":"primary","size":"md","show":"off"},"expose":["text","icon"]},"chat":{"type":"component","component":"molecules/avatar-text","label":"T line","props":{"avatar":"t","size":"24","style":"chat","title":"I\u2019m here to chat"},"expose":["title"]},"prompt":{"type":"component","component":"molecules/chat-input","label":"Follow-up prompt","props":{"variant":"large","text":"Want to follow up on [three to four generated words]?"},"expose":["text"]}},"personas":[],"properties":[{"id":"background","label":"Background Color","type":"gradients","var":"--card-fill","default":"var(--gradient-dark-rose-to-orange)","flatStates":["provider"]},{"id":"radius","label":"Corner Radius","type":"scale","scale":"radius","vars":["--header-radius"],"default":"calc(var(--radius-lg) * 2)","edit":true}],"prompts":[{"id":"header-copy","label":"Header copy","instruction":"Write a short overline, a headline and one sentence of body copy that introduce this screen. Calm and warm.","inputs":["state"],"outputs":["overline","headline","body"],"note":"Placeholder prompt to show the structure; nothing runs it yet."}],"align":"top","inputs":[{"id":"session","label":"Session","type":"select","item":"duration","prop":"text","options":[{"value":"5 min"},{"value":"10 min"},{"value":"30 min"},{"value":"1 hr"}]},{"id":"label","label":"Label","type":"select","options":[{"value":"none","label":"None","set":[["label2","show","off"],["duration","show","on"]]},{"value":"otr","label":"Off the record","set":[["label2","show","on"],["label2","icon","person-x"],["label2","text","Off the Record"],["duration","show","on"]]},{"value":"saved","label":"Leave it with T","set":[["label2","show","on"],["label2","icon","bookmark"],["label2","text","Leave it with T"],["duration","show","off"]]}]}]},"molecules/text-section":{"name":"Text section","tier":"molecules","category":"content","stateful":false,"uses":["atoms/skeleton"],"figma":"https://www.figma.com/design/pdq8KcTCIJAtXwcgReiwlC/Thoughtful-Design-System?node-id=4197-43941","attributes":{},"states":[],"variables":{},"styles":[],"description":"A section of plain text: a serif subhead and a few lines under it (Today\u2019s Topic, The Reframe, The Plan). Line breaks in the text are kept.","content":[{"label":"Subhead","selector":".text-section__title"},{"label":"Body Copy","selector":".text-section__body"}],"props":{"heading":{"type":"text","label":"Subhead","default":"Today\u2019s Topic"},"body":{"type":"text","label":"Body Copy","default":"You came in feeling overwhelmed by low-grade depression and anxiety primarily driven by the financial uncertainty of your work situation."},"loading":{"type":"enum","label":"Loading","ui":"steps","values":["no","yes"],"default":"no"},"tag":{"type":"text","label":"Tag","default":""}},"template":"<section class=\"text-section\" data-loading=\"{{loading}}\"><div class=\"text-section__head\"><h2 class=\"text-section__title\">{{heading}}</h2>{{?tag}}<span class=\"text-section__tag\">{{tag}}</span>{{/tag}}</div><p class=\"text-section__body\">{{body}}</p><span class=\"text-section__skeleton\"><span class=\"skeleton\" data-shape=\"line\"></span><span class=\"skeleton\" data-shape=\"line\"></span><span class=\"skeleton\" data-shape=\"line\"></span></span></section>","markup":"<section class=\"text-section\" data-loading=\"no\"><div class=\"text-section__head\"><h2 class=\"text-section__title\">Today\u2019s Topic</h2><span class=\"text-section__tag\"></span></div><p class=\"text-section__body\">You came in feeling overwhelmed.</p><span class=\"text-section__skeleton\"><span class=\"skeleton\" data-shape=\"line\"></span><span class=\"skeleton\" data-shape=\"line\"></span><span class=\"skeleton\" data-shape=\"line\"></span></span></section>"},"molecules/header":{"name":"Header","tier":"molecules","category":"navigation","stateful":false,"uses":["device/status-bar","atoms/icon-button","atoms/icon","atoms/button","atoms/dots"],"figma":"https://www.figma.com/design/pdq8KcTCIJAtXwcgReiwlC/Thoughtful-Design-System?node-id=198-30050","markup":"<header class=\"header\" data-variant=\"back-button\"><div class=\"header__status\"><div class=\"status-bar\"><span>9:41</span><svg viewBox=\"0 0 18 12\" width=\"18\" height=\"12\" fill=\"currentColor\" aria-hidden=\"true\"><rect x=\"0\" y=\"8\" width=\"3\" height=\"4\" rx=\"1\"/><rect x=\"5\" y=\"5.5\" width=\"3\" height=\"6.5\" rx=\"1\"/><rect x=\"10\" y=\"3\" width=\"3\" height=\"9\" rx=\"1\"/><rect x=\"15\" y=\"0\" width=\"3\" height=\"12\" rx=\"1\"/></svg><svg viewBox=\"0 0 17 12\" width=\"17\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M1.2 4.2a10.4 10.4 0 0 1 14.6 0\"/><path d=\"M3.9 7a6.5 6.5 0 0 1 9.2 0\"/><circle cx=\"8.5\" cy=\"10.2\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg><svg viewBox=\"0 0 27 13\" width=\"27\" height=\"13\" fill=\"none\" aria-hidden=\"true\"><rect x=\"0.5\" y=\"0.5\" width=\"22\" height=\"12\" rx=\"3.8\" stroke=\"currentColor\" opacity=\"0.4\"/><rect x=\"2\" y=\"2\" width=\"19\" height=\"9\" rx=\"2.5\" fill=\"currentColor\"/><path d=\"M24.5 4.5v4c.9-.3 1.5-1.2 1.5-2s-.6-1.7-1.5-2Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg></div></div><div class=\"header__bar\"><button class=\"icon-button header__back\" data-elevation=\"20\" data-size=\"sm\" aria-label=\"Back\"><i class=\"icon icon-chevron-left\"></i></button><span class=\"header__title\">Title</span><span class=\"dots\" data-current=\"1\"><i></i><i></i><i></i><i></i><i></i><i></i></span><button class=\"button header__action\" data-variant=\"glass\" data-size=\"sm\">Support</button><button class=\"icon-button header__close\" data-elevation=\"20\" data-size=\"sm\" aria-label=\"Close\"><i class=\"icon icon-x\"></i></button></div></header>","attributes":{"data-variant":{"type":"enum","values":["close","steps-close","sub-section","back-button","back-progress","section-root","home"],"default":"close"}},"states":[],"variables":{"--header-padding-x":"padding"},"styles":[],"description":"The top of a screen: the status bar, then a back or close button with a title, step dots or an action. Close and Steps and close are for modal flows, Back and button and Back and progress for steps, Sub-section for a page under another, and Section root for a top-level screen, and Home for the home screen (just an action on the right).","content":[{"label":"Title","selector":".header__title"},{"label":"Action","selector":".header__action"}],"props":{"variant":{"type":"enum","label":"Variant","values":["close","steps-close","sub-section","back-button","back-progress","section-root","home"],"default":"close"},"title":{"type":"text","label":"Title","default":"Title"},"action":{"type":"text","label":"Action","default":"Support"},"step":{"type":"enum","label":"Step","ui":"steps","values":["1","2","3","4","5","6"],"default":"1"},"time":{"type":"text","label":"Time","default":"9:41"},"count":{"type":"enum","label":"Steps","ui":"steps","values":["2","3","4","5","6"],"default":"6"}},"template":"<header class=\"header\" data-variant=\"{{variant}}\"><div class=\"header__status\"><div class=\"status-bar\"><span>{{time}}</span><svg viewBox=\"0 0 18 12\" width=\"18\" height=\"12\" fill=\"currentColor\" aria-hidden=\"true\"><rect x=\"0\" y=\"8\" width=\"3\" height=\"4\" rx=\"1\"/><rect x=\"5\" y=\"5.5\" width=\"3\" height=\"6.5\" rx=\"1\"/><rect x=\"10\" y=\"3\" width=\"3\" height=\"9\" rx=\"1\"/><rect x=\"15\" y=\"0\" width=\"3\" height=\"12\" rx=\"1\"/></svg><svg viewBox=\"0 0 17 12\" width=\"17\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M1.2 4.2a10.4 10.4 0 0 1 14.6 0\"/><path d=\"M3.9 7a6.5 6.5 0 0 1 9.2 0\"/><circle cx=\"8.5\" cy=\"10.2\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg><svg viewBox=\"0 0 27 13\" width=\"27\" height=\"13\" fill=\"none\" aria-hidden=\"true\"><rect x=\"0.5\" y=\"0.5\" width=\"22\" height=\"12\" rx=\"3.8\" stroke=\"currentColor\" opacity=\"0.4\"/><rect x=\"2\" y=\"2\" width=\"19\" height=\"9\" rx=\"2.5\" fill=\"currentColor\"/><path d=\"M24.5 4.5v4c.9-.3 1.5-1.2 1.5-2s-.6-1.7-1.5-2Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg></div></div><div class=\"header__bar\"><button class=\"icon-button header__back\" data-elevation=\"20\" data-size=\"sm\" aria-label=\"Back\"><i class=\"icon icon-chevron-left\"></i></button><span class=\"header__title\">{{title}}</span><span class=\"dots\" data-current=\"{{step}}\" data-count=\"{{count}}\"><i></i><i></i><i></i><i></i><i></i><i></i></span><button class=\"button header__action\" data-variant=\"glass\" data-size=\"sm\">{{action}}</button><button class=\"icon-button header__close\" data-elevation=\"20\" data-size=\"sm\" aria-label=\"Close\"><i class=\"icon icon-x\"></i></button></div></header>"},"molecules/icon-label":{"name":"Icon label","tier":"molecules","category":"content","stateful":false,"uses":["atoms/icon","atoms/skeleton"],"markup":"<div class=\"icon-label\"><i class=\"icon icon-calendar\" data-size=\"sm\"></i><span>Next available Tue, Oct 13 \u00b7 2:30 PM</span></div>","attributes":{"data-emphasis":{"type":"enum","values":["secondary","primary"],"default":"secondary"},"data-size":{"type":"enum","values":["sm","md"],"default":"sm"}},"states":[],"variables":{"--icon-label-text":"color","--icon-label-icon":"color","--icon-label-gap":"padding"},"styles":[],"description":"An icon with a line of text. Use it for short facts such as a date, a duration or a location. Primary emphasis for key details, secondary for supporting ones.","content":[{"label":"Text","selector":":scope > span"}],"props":{"text":{"type":"text","label":"Label","default":"Label","vars":true},"icon":{"type":"icon","label":"Icon","default":"calendar"},"emphasis":{"type":"enum","label":"Emphasis","values":["secondary","primary"],"default":"secondary"},"size":{"type":"enum","label":"Size","values":["sm","md"],"default":"sm"}},"template":"<div class=\"icon-label\" data-emphasis=\"{{emphasis}}\" data-size=\"{{size}}\"><i class=\"icon icon-{{icon}}\" data-size=\"sm\"></i><span>{{text}}</span></div>","skeleton":"<div class=\"icon-label\" data-size=\"{{size}}\"><span class=\"skeleton\" data-shape=\"dot\"></span><span class=\"skeleton\" data-shape=\"line\" style=\"width:calc({{text.length}} * 1ch)\"></span></div>"},"molecules/avatar-text":{"name":"Avatar with text","tier":"molecules","category":"avatars","stateful":false,"uses":["atoms/blob","atoms/avatar","atoms/icon"],"figma":"https://www.figma.com/design/pdq8KcTCIJAtXwcgReiwlC/Thoughtful-Design-System?node-id=4359-55294","attributes":{"data-style":{"type":"enum","values":["small","medium","large","subhead"],"default":"large"},"data-close":{"type":"enum","values":["off","on"],"default":"off"}},"states":[],"variables":{},"styles":[],"description":"A T avatar (or none) beside a title and an optional line under it, with an optional close button. Pick the type style for the title: small, medium or large semibold, or the serif subhead. It is the top of a coachmark and of the session sharing sheet.","content":[{"label":"Title","selector":".avatar-text__title"},{"label":"Subline","selector":".avatar-text__subline"}],"props":{"avatar":{"type":"enum","label":"Avatar","values":["none","t","t-provider","icon","provider"],"default":"t"},"size":{"type":"enum","label":"Avatar size","values":["24","28","32","48"],"default":"28","ui":"steps"},"icon":{"type":"icon","label":"Icon","default":"person"},"person":{"type":"person","label":"Provider","default":"kristina"},"style":{"type":"enum","label":"Title style","values":["small","medium","large","subhead","chat"],"default":"large","ui":"steps"},"title":{"type":"text","label":"Title","default":"Headline goes here"},"subline":{"type":"text","label":"Subline","default":""},"close":{"type":"enum","label":"Close","values":["off","on"],"default":"off","ui":"steps"}},"template":"<div class=\"avatar-text\" data-style=\"{{style}}\" data-close=\"{{close}}\"><span class=\"t-avatar\" data-type=\"{{avatar}}\" data-size=\"{{size}}\"><span class=\"t-avatar__t\"><span class=\"blob\" data-glow data-theme=\"rose\"><canvas aria-hidden=\"true\"></canvas></span></span><span class=\"avatar t-avatar__provider\"><img src=\"../tds/assets/{{person.photo}}\" alt=\"{{person.name}}\"></span><span class=\"t-avatar__icon\"><i class=\"icon icon-{{icon}}\"></i></span></span><span class=\"avatar-text__titles\"><span class=\"avatar-text__title\">{{title}}</span>{{?subline}}<span class=\"avatar-text__subline\">{{subline}}</span>{{/subline}}</span><button class=\"avatar-text__close\" aria-label=\"Close\"><i class=\"icon icon-x\"></i></button></div>","markup":"<div class=\"avatar-text\" data-style=\"large\" data-close=\"off\"><span class=\"t-avatar\" data-type=\"t\" data-size=\"28\"><span class=\"t-avatar__t\"><span class=\"blob\" data-glow data-theme=\"rose\"><canvas aria-hidden=\"true\"></canvas></span></span><span class=\"avatar t-avatar__provider\"><img src=\"../tds/assets/images/therapists/Therapist-7.png\" alt=\"\"></span><span class=\"t-avatar__icon\"><i class=\"icon icon-person\"></i></span></span><span class=\"avatar-text__titles\"><span class=\"avatar-text__title\">Headline goes here</span></span><button class=\"avatar-text__close\" aria-label=\"Close\"><i class=\"icon icon-x\"></i></button></div>"},"molecules/chat-input":{"name":"Chat input","tier":"molecules","category":"actions","stateful":false,"uses":["atoms/icon"],"markup":"<div class=\"chat-input\" data-variant=\"pill\"><span>Start session</span><i class=\"icon icon-arrow-up\" data-size=\"md\"></i></div>","attributes":{"data-variant":{"type":"enum","values":["pill","empty","large"],"default":"pill"}},"states":[],"variables":{"--chat-input-fill":"fill","--chat-input-border":"color","--chat-input-text":"color","--chat-input-height":"padding","--chat-input-padding-x":"padding"},"styles":[],"description":"The pill at the bottom of a session card: a prompt and an arrow to send. Use it to start a session or a new topic from a card. Empty is the pill before anything is typed (the prompt at half strength). Large is the tall box on the home screen, with the prompt at the top and the arrow at the bottom right.","content":[{"label":"Prompt","selector":":scope > span"}],"props":{"text":{"type":"text","label":"Prompt","default":"Start session"},"variant":{"type":"enum","label":"Variant","values":["pill","empty","large"],"default":"pill"}},"template":"<div class=\"chat-input\" data-variant=\"{{variant}}\"><span>{{text}}</span><i class=\"icon icon-arrow-up\" data-size=\"md\"></i></div>"},"atoms/avatar":{"name":"Avatar","tier":"atoms","category":"media","stateful":false,"uses":[],"markup":"<span class=\"avatar\"><img src=\"../tds/assets/images/therapists/Therapist-1.png\" alt=\"\"></span>","attributes":{"data-size":{"type":"enum","values":["sm","md","lg"],"default":"md"}},"states":["loading"],"variables":{"--avatar-fill":"color","--avatar-size":"padding","--avatar-radius":"radius"},"styles":[],"description":"A round photo, or initials when there's no photo. Use it beside a person's name in lists, cards and headers. Three sizes: 32, 48 and 64.","props":{"person":{"type":"person","label":"Name","default":"kristina"},"size":{"type":"enum","label":"Size","values":["xs","sm","md","lg"],"default":"md"}},"template":"<span class=\"avatar\" data-size=\"{{size}}\"><img src=\"../tds/assets/{{person.photo}}\" alt=\"{{person.name}}\"></span>","skeleton":"<span class=\"avatar\" data-state=\"loading\" data-size=\"{{size}}\"></span>"}};

  var META = META_SOURCE;
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
    return Promise.resolve();
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
    if (meta.states && meta.states.length) {
      var st = meta.states.filter(function (s) { return s.id === all.state; })[0] || meta.states[0];
      tpl = st.template;
    }

    if (!tpl) return '';

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
    }).catch(function (err) {
      console.error('Summary failed to render', err);
    });
  };
})();
