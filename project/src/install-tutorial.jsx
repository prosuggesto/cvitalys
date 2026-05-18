// InstallTutorial — popup expliquant aux users iOS comment ajouter
// CVitalis à leur écran d'accueil (PWA install via Safari Share Sheet).
//
// Comportement :
//  - Détecte iOS Safari (la seule combinaison qui permet "Sur l'écran d'accueil")
//  - Ne s'affiche QUE si l'app n'est pas déjà installée (display-mode standalone)
//  - Première ouverture après login → popup pleine taille 3 étapes
//  - Après fermeture par l'X de la popup → bulle widget en bas à droite
//  - X sur la bulle → fermeture définitive (flag localStorage)

const TUTORIAL_KEY_DISMISSED  = "cvitalys.install.dismissed";
const TUTORIAL_KEY_MINIMIZED  = "cvitalys.install.minimized";

// Détection iOS (iPhone/iPad/iPod). On accepte iPadOS qui se déclare Mac mais
// qui a Touch — sinon les iPads modernes seraient exclus.
const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ se présente comme Mac mais a Touch
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
};

// L'app tourne déjà en mode standalone (déjà installée comme PWA) ?
const isStandalone = () => {
  try {
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.navigator && window.navigator.standalone === true) return true;
  } catch (_) {}
  return false;
};

// Force-show via URL hash : permet à un user de réouvrir le tutorial même
// après l'avoir dismissed définitivement (utile pour le bouton manuel)
const isForceShow = () => {
  try {
    return /(\?|#)install-help/i.test(window.location.href || "");
  } catch (_) { return false; }
};

// Doit-on afficher le tutorial à cet user ?
const shouldShowTutorial = () => {
  if (isForceShow()) return true;            // override : always show
  if (isStandalone()) return false;          // déjà installé en PWA
  try {
    if (localStorage.getItem(TUTORIAL_KEY_DISMISSED) === "1") return false;
  } catch (_) {
    // localStorage non dispo (private mode?) → on continue, on montre
  }
  if (!isIOS()) return false;                // pour l'instant : iOS uniquement
  return true;
};

// Reset complet des flags (utilisé par le bouton manuel)
window.resetInstallTutorial = () => {
  try {
    localStorage.removeItem("cvitalys.install.dismissed");
    localStorage.removeItem("cvitalys.install.minimized");
    window.location.hash = "#install-help";
    setTimeout(() => window.location.reload(), 50);
  } catch (_) {}
};

const TUTORIAL_STEPS = [
  {
    title: "Étape 1 — Bouton Partager",
    body: "Dans Safari, appuyez sur l'icône Partager en haut à droite de la barre d'adresse (le carré avec la flèche vers le haut).",
    img: "assets/install-tutorial/step1.png",
    alt: "Safari ouvert sur CVitalis avec le bouton Partager en haut à droite",
  },
  {
    title: "Étape 2 — Toutes les actions",
    body: "Appuyez sur les trois petits points « Plus » pour afficher toutes les actions disponibles.",
    img: "assets/install-tutorial/step2.png",
    alt: "Menu Partager de Safari avec le bouton Plus",
  },
  {
    title: "Étape 3 — Ajouter CVitalis",
    body: "Appuyez sur « Sur l'écran d'accueil », puis validez en haut à droite. CVitalis apparaît alors sur votre écran d'accueil comme une vraie app.",
    img: "assets/install-tutorial/step3.png",
    alt: "Option Sur l'écran d'accueil",
  },
];

const InstallTutorialBubble = ({ onOpen, onDismiss }) => (
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
      <I.Download size={14}/> Installer l'app
    </button>
    <button onClick={onDismiss} aria-label="Fermer définitivement" style={{
      background: "rgba(255,255,255,0.12)", border: "none",
      width: 22, height: 22, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "inherit", cursor: "pointer", padding: 0,
    }}>
      <I.Close size={11}/>
    </button>
  </div>
);

const InstallTutorial = () => {
  const [open, setOpen] = useState(false);          // popup pleine taille visible ?
  const [step, setStep] = useState(0);
  const [bubble, setBubble] = useState(false);      // bulle widget visible ?
  const [dismissed, setDismissed] = useState(false); // fermé définitivement

  // Au mount : décider si on affiche
  useEffect(() => {
    if (!shouldShowTutorial()) {
      setDismissed(true);
      return;
    }
    // Si l'user a déjà minimisé une fois → on affiche directement la bulle
    try {
      if (localStorage.getItem(TUTORIAL_KEY_MINIMIZED) === "1") {
        setBubble(true);
      } else {
        setOpen(true);
      }
    } catch (_) {
      setOpen(true);
    }
  }, []);

  const handleMinimize = () => {
    setOpen(false);
    setBubble(true);
    try { localStorage.setItem(TUTORIAL_KEY_MINIMIZED, "1"); } catch (_) {}
  };
  const handleReopen = () => { setOpen(true); setBubble(false); };
  const handleDismissForever = () => {
    setOpen(false); setBubble(false); setDismissed(true);
    try {
      localStorage.setItem(TUTORIAL_KEY_DISMISSED, "1");
      localStorage.removeItem(TUTORIAL_KEY_MINIMIZED);
    } catch (_) {}
  };
  const next = () => setStep((s) => Math.min(s + 1, TUTORIAL_STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (dismissed) return null;

  // Mode bulle uniquement
  if (bubble && !open) {
    return <InstallTutorialBubble onOpen={handleReopen} onDismiss={handleDismissForever}/>;
  }

  if (!open) return null;

  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div className="install-tuto__backdrop" onClick={handleMinimize}>
      <div className="install-tuto__sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="install-tuto__header">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold-deep)" }}>Installation</div>
            <div className="install-tuto__title">Ajouter CVitalis à votre écran d'accueil</div>
          </div>
          <button className="install-tuto__close" onClick={handleMinimize} aria-label="Réduire">
            <I.Close size={14}/>
          </button>
        </div>

        {/* Visuel : image + cadre lumineux positionné en % de l'image */}
        <div className="install-tuto__img-wrap">
          <div className="install-tuto__img-frame">
            <img src={s.img} alt={s.alt} className="install-tuto__img"/>
          </div>
        </div>

        {/* Texte de l'étape */}
        <div className="install-tuto__body">
          <div className="install-tuto__step-title">{s.title}</div>
          <p className="install-tuto__step-body">{s.body}</p>
        </div>

        {/* Indicateur de progression (dots) */}
        <div className="install-tuto__dots">
          {TUTORIAL_STEPS.map((_, i) => (
            <span key={i} className={"install-tuto__dot" + (i === step ? " is-active" : "")}/>
          ))}
        </div>

        {/* Navigation */}
        <div className="install-tuto__nav">
          {step > 0 ? (
            <button className="btn btn--secondary btn--sm" onClick={prev}>← Précédent</button>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={handleMinimize}>Plus tard</button>
          )}
          {isLast ? (
            <button className="btn btn--primary btn--sm" onClick={handleDismissForever}>
              <I.Check size={14}/> Terminé
            </button>
          ) : (
            <button className="btn btn--primary btn--sm" onClick={next}>
              Continuer <I.Arrow size={14}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { InstallTutorial });
