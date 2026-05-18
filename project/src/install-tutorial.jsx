// InstallTutorial — iOS: plein écran 3 étapes + bulle minimisée
//                  Android: banner PWA avec bouton beforeinstallprompt

const TUTORIAL_KEY_DISMISSED = "cvitalys.install.dismissed";
const TUTORIAL_KEY_MINIMIZED = "cvitalys.install.minimized";

const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
};

const isAndroid = () => {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent || "");
};

const isStandalone = () => {
  try {
    // ?pwa=1 query param from manifest start_url
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("pwa") === "1") return true;
    // iOS: navigator.standalone is the only reliable check
    if (window.navigator && window.navigator.standalone === true) return true;
    // Non-iOS: trust matchMedia
    const ua = (window.navigator && window.navigator.userAgent) || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (!isIOS && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      return true;
    }
  } catch (_) {}
  return false;
};

// Capturer l'événement beforeinstallprompt (Android) avant qu'il soit consommé
let _deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _deferredPrompt = e;
});

const shouldShowTutorial = () => {
  if (isStandalone()) return false;
  try {
    if (localStorage.getItem(TUTORIAL_KEY_DISMISSED) === "1") return false;
  } catch (_) {}
  if (!isIOS() && !isAndroid()) return false;
  return true;
};

const TUTORIAL_STEP_IMGS = [
  { img: "assets/install-tutorial/step1.png" },
  { img: "assets/install-tutorial/step2.png" },
  { img: "assets/install-tutorial/step3.png" },
];

const InstallTutorialBubble = ({ onOpen, onDismiss }) => {
  const { t } = useT();
  return (
    <div style={{
      position: "fixed", bottom: 18, right: 18, zIndex: 90,
      display: "flex", alignItems: "center", gap: 8,
      background: "var(--ink)", color: "#F7F3EC",
      padding: "10px 12px 10px 14px", borderRadius: 999,
      boxShadow: "0 10px 30px rgba(27,24,20,0.25)",
      fontSize: 13, fontWeight: 500,
    }}>
      <button onClick={onOpen} style={{
        background: "transparent", border: "none", color: "inherit",
        cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500,
      }}>
        <I.Download size={14}/> {t("install.bubble")}
      </button>
      <button onClick={onDismiss} aria-label={t("install.done")} style={{
        background: "rgba(255,255,255,0.12)", border: "none",
        width: 22, height: 22, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "inherit", cursor: "pointer", padding: 0,
      }}>
        <I.Close size={11}/>
      </button>
    </div>
  );
};

const AndroidInstallBanner = ({ onDismiss }) => {
  const { t } = useT();
  const [installing, setInstalling] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  const handleInstall = async () => {
    if (!_deferredPrompt) return;
    setInstalling(true);
    try {
      _deferredPrompt.prompt();
      const { outcome } = await _deferredPrompt.userChoice;
      _deferredPrompt = null;
      if (outcome === "accepted") {
        setInstalled(true);
        setTimeout(onDismiss, 1800);
      }
    } catch (_) {}
    setInstalling(false);
  };

  return (
    <div className="fullpage" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <I.Download size={28} style={{ color: "var(--gold-deep)" }}/>
        </div>
        <div>
          <div className="eyebrow" style={{ color: "var(--gold-deep)", marginBottom: 8 }}>{t("install.eyebrow")}</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, margin: "0 0 12px", lineHeight: 1.25, color: "var(--ink)" }}>
            {t("install.android.title")}
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            {t("install.android.body")}
          </p>
        </div>
        {installed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontWeight: 500, fontSize: 15 }}>
            <I.Check size={18}/> {t("install.android.success")}
          </div>
        ) : (
          <button
            className="btn btn--primary"
            style={{ width: "100%" }}
            onClick={handleInstall}
            disabled={!_deferredPrompt || installing}
          >
            {installing ? t("install.android.installing") : <><I.Download size={15}/>&nbsp;{t("install.android.btn")}</>}
          </button>
        )}
        <button className="btn btn--ghost btn--sm" onClick={onDismiss}>{t("install.later")}</button>
      </div>
    </div>
  );
};

const InstallTutorial = () => {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const tutorialSteps = [
    { title: t("install.step1.title"), body: t("install.step1.body"), ...TUTORIAL_STEP_IMGS[0] },
    { title: t("install.step2.title"), body: t("install.step2.body"), ...TUTORIAL_STEP_IMGS[1] },
    { title: t("install.step3.title"), body: t("install.step3.body"), ...TUTORIAL_STEP_IMGS[2] },
  ];

  useEffect(() => {
    if (!shouldShowTutorial()) {
      setDismissed(true);
      return;
    }
    setOpen(true);
  }, []);

  // Exposer une fonction globale pour rouvrir depuis le menu burger sans reload
  useEffect(() => {
    window.openInstallTutorial = () => {
      try {
        localStorage.removeItem(TUTORIAL_KEY_DISMISSED);
        localStorage.removeItem(TUTORIAL_KEY_MINIMIZED);
      } catch (_) {}
      setDismissed(false);
      setOpen(true);
      setBubble(false);
      setStep(0);
    };
    return () => { delete window.openInstallTutorial; };
  }, []);

  const handleMinimize = () => {
    setOpen(false);
    setBubble(true);
  };
  const handleReopen = () => { setOpen(true); setBubble(false); };
  const handleDismissForever = () => {
    setOpen(false); setBubble(false); setDismissed(true);
    try {
      localStorage.setItem(TUTORIAL_KEY_DISMISSED, "1");
      localStorage.removeItem(TUTORIAL_KEY_MINIMIZED);
    } catch (_) {}
  };
  const next = () => setStep((s) => Math.min(s + 1, tutorialSteps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (dismissed) return null;

  // Android
  if (isAndroid() && !isStandalone()) {
    if (bubble && !open) {
      return <InstallTutorialBubble onOpen={handleReopen} onDismiss={handleDismissForever}/>;
    }
    if (!open) return null;
    return <AndroidInstallBanner onDismiss={handleDismissForever}/>;
  }

  // Bulle minimisée (iOS)
  if (bubble && !open) {
    return <InstallTutorialBubble onOpen={handleReopen} onDismiss={handleDismissForever}/>;
  }

  if (!open) return null;

  const s = tutorialSteps[step];
  const isLast = step === tutorialSteps.length - 1;

  return (
    <div className="fullpage">
      <button className="fullpage__close" onClick={handleMinimize} aria-label={t("install.later")}>
        <I.Close size={14}/>
      </button>
      <div className="fullpage__content" style={{
        maxWidth: 420, margin: "0 auto", padding: "64px 18px 24px",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div className="eyebrow" style={{ color: "var(--gold-deep)" }}>{t("install.eyebrow")}</div>
          <div className="install-tuto__title">{t("install.title")}</div>
        </div>

        {/* Image */}
        <div className="install-tuto__img-wrap" style={{ flex: 1 }}>
          <div className="install-tuto__img-frame">
            <img src={s.img} alt={s.title} className="install-tuto__img"/>
          </div>
        </div>

        {/* Texte */}
        <div className="install-tuto__body">
          <div className="install-tuto__step-title">{s.title}</div>
          <p className="install-tuto__step-body">{s.body}</p>
        </div>

        {/* Dots */}
        <div className="install-tuto__dots">
          {tutorialSteps.map((_, i) => (
            <span key={i} className={"install-tuto__dot" + (i === step ? " is-active" : "")}/>
          ))}
        </div>

        {/* Navigation */}
        <div className="install-tuto__nav">
          {step > 0 ? (
            <button className="btn btn--secondary btn--sm" onClick={prev}>{t("install.prev")}</button>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={handleMinimize}>{t("install.later")}</button>
          )}
          {isLast ? (
            <button className="btn btn--primary btn--sm" onClick={handleDismissForever}>
              <I.Check size={14}/> {t("install.done")}
            </button>
          ) : (
            <button className="btn btn--primary btn--sm" onClick={next}>
              {t("install.next")} <I.Arrow size={14}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { InstallTutorial });
