// Shared UI primitives

const { useState, useEffect, useRef, useMemo } = React;

// ---------------------------------------------------------------------------
// Security helpers — exposés sur window pour usage cross-file (customize, public)
// ---------------------------------------------------------------------------
// Refuse tout scheme ≠ http/https (anti javascript:/data:/vbscript:/file:)
// Préfixe https:// si l'utilisateur a tapé un domaine nu.
function safeExternalUrl(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch (_) { return null; }
}
// Validation email anti-injection pour mailto:
function safeMailtoTarget(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(s)) return null;
  return s;
}
// Whitelist par domaine + auto-build URL depuis un handle nu
const LINKEDIN_DOMAINS  = ["linkedin.com", "linkd.in", "linked.in"];
const INSTAGRAM_DOMAINS = ["instagram.com", "ig.me", "instagr.am"];
function matchesDomain(hostname, allowed) {
  const h = String(hostname || "").toLowerCase();
  return allowed.some((d) => h === d || h.endsWith("." + d));
}
function safeDomainUrl(raw, allowed, defaultDomain) {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  if (!/[\/.]/.test(s)) {
    const handle = s.replace(/^@/, "").replace(/[^A-Za-z0-9._\-]/g, "");
    if (!handle) return null;
    return `https://${defaultDomain}/${encodeURIComponent(handle)}`;
  }
  const safe = safeExternalUrl(s);
  if (!safe) return null;
  try {
    const u = new URL(safe);
    if (!matchesDomain(u.hostname, allowed)) return null;
    return safe;
  } catch (_) { return null; }
}
// Logger silencieux en prod (évite fuite d'info via console)
const _isDev = (() => {
  try {
    const h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local");
  } catch (_) { return false; }
})();
function logErr(...args) { if (_isDev) console.error(...args); }
function logWarn(...args) { if (_isDev) console.warn(...args); }

Object.assign(window, {
  safeExternalUrl, safeMailtoTarget, safeDomainUrl,
  LINKEDIN_DOMAINS, INSTAGRAM_DOMAINS,
  logErr, logWarn,
});

// Hook responsive : retourne true si la largeur viewport < breakpoint (mobile)
function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(() => {
    try { return window.innerWidth < breakpoint; } catch (_) { return false; }
  });
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}
window.useIsMobile = useIsMobile;

const Modal = ({ open, onClose, children, width, padding, zIndex }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <div className={"modal-backdrop" + (open ? " is-open" : "")} onClick={onClose} style={zIndex ? { zIndex } : undefined}>
      <div className="modal" style={{ maxWidth: width || 920, padding: padding ?? 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Fermer">
          <I.Close size={16}/>
        </button>
        {children}
      </div>
    </div>
  );
};

// FullPage — alternative à Modal pour les vues plein écran sur mobile
// (PresentModal, AddCVModal). Pas de backdrop semi-transparent, pas de
// problème de zoom iOS — c'est juste une page qui couvre tout le viewport.
const FullPage = ({ open, onClose, children, zIndex }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fullpage" style={zIndex ? { zIndex } : undefined}>
      <button className="fullpage__close" onClick={onClose} aria-label="Fermer">
        <I.Close size={16}/>
      </button>
      <div className="fullpage__content">
        {children}
      </div>
    </div>
  );
};

const Toggle = ({ on, onChange, label }) => (
  <button className={"toggle" + (on ? " toggle--on" : "")} onClick={() => onChange && onChange(!on)} role="switch" aria-checked={on} aria-label={label}/>
);

const Field = ({ label, children, hint }) => (
  <div className="field">
    <label className="label">{label}</label>
    {children}
    {hint ? <div style={{ fontSize: 12, color: "var(--muted)" }}>{hint}</div> : null}
  </div>
);

// ensureQRCode — garantit que window.QRCode est chargé en injectant le script local
// si besoin. Pas de fallback CDN tiers : tout reste sur le même domaine (privacy/sécurité).
let _qrLoadPromise = null;
function ensureQRCode(timeoutMs = 4000) {
  if (window.QRCode) return Promise.resolve(true);
  if (_qrLoadPromise) return _qrLoadPromise;
  _qrLoadPromise = new Promise((resolve) => {
    let done = false;
    const settle = (ok) => { if (!done) { done = true; resolve(ok); } };
    setTimeout(() => settle(!!window.QRCode), timeoutMs);
    const script = document.createElement("script");
    script.src = "assets/qrcode.min.js";
    script.async = true;
    script.onload = () => settle(!!window.QRCode);
    script.onerror = () => settle(false);
    document.head.appendChild(script);
  });
  return _qrLoadPromise;
}
window.ensureQRCode = ensureQRCode;

// generateQR — génère un QR code et retourne une data URL (Promise)
// Utilisé à la fois par QRBlock et pour la pré-génération en arrière-plan
function generateQR(url, size) {
  return new Promise((resolve) => {
    const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=2`;
    if (!window.QRCode) { resolve(fallback); return; }
    const canvas = document.createElement('canvas');
    try {
      QRCode.toCanvas(canvas, url, { width: size, margin: 2, color: { dark: '#1B1814', light: '#ffffff' } }, (err) => {
        resolve(err ? fallback : canvas.toDataURL('image/png'));
      });
    } catch { resolve(fallback); }
  });
}

// QRBlock — affiche un QR code. cachedSrc permet un affichage instantané (pré-généré).
const QRBlock = ({ size = 200, url, cachedSrc }) => {
  // Initialiser avec le cache si disponible → zéro délai
  const [imgSrc, setImgSrc] = useState(cachedSrc || '');

  useEffect(() => {
    if (cachedSrc) { setImgSrc(cachedSrc); return; }
    if (!url) { setImgSrc(''); return; }
    // Fallback : générer à la demande si le cache n'est pas encore prêt
    const run = () => generateQR(url, size).then(setImgSrc);
    window.QRCode ? run() : setTimeout(run, 400);
  }, [url, size, cachedSrc]);

  if (!url) return <div style={{ width: size, height: size, background: "var(--bg-soft)", borderRadius: 8 }}/>;
  if (!imgSrc) return <div style={{ width: size, height: size, background: "var(--bg-soft)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--gold-deep)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/></div>;
  return <img src={imgSrc} width={size} height={size} alt="QR Code" style={{ display: "block", borderRadius: 8 }}/>;
};

// Exposé pour pré-génération depuis MesCV
window.generateQR = generateQR;

// Realistic A4 CV preview (PDF-style, two-column). Uses transform: scale() so
// typography stays crisp at any size.
const CV_CONTENT = {
  hotellerie: {
    fr: {
      title: "Chef de réception · 5★",
      about: "8 ans en hôtellerie de luxe et palaces. Trilingue, sens aigu du service VIP. Reconnue pour transformer chaque arrivée en moment d'exception.",
      exp: [
        { role: "Chef de réception", company: "Le Bristol Paris · Palace", dates: "2023 — 2025", bullets: ["Management d'une équipe de 6 réceptionnistes 24/7", "Accueil VIP : célébrités, chefs d'État, familles royales", "Satisfaction client maintenue à 4,9/5 sur 18 mois"] },
        { role: "Réceptionniste de nuit", company: "Hôtel Saint-Régis · Paris", dates: "2021 — 2023", bullets: ["Conciergerie premium 24/7", "Gestion des arrivées tardives et plaintes VIP"] },
        { role: "Réceptionniste", company: "Maison Bréguet · Lyon", dates: "2019 — 2021", bullets: ["Check-in/out, +60 chambres", "Vente additionnelle : +18% RevPAR"] },
      ],
      edu: [{ title: "Licence Pro Hôtellerie Internationale", school: "Université Paris Dauphine", dates: "2018 — 2019" }],
      skills: ["Accueil VIP", "Opera PMS", "Conciergerie luxe", "Management équipe", "Vente additionnelle", "Anglais C2"],
      langs: [["Français", "C2", 1.0], ["Anglais", "C2", 1.0], ["Espagnol", "C1", 0.85]],
      labels: { about: "À propos", contact: "Contact", exp: "Expérience", edu: "Formation", skills: "Compétences", langs: "Langues" },
    },
    es: {
      title: "Jefa de recepción · 5★",
      about: "8 años en hotelería de lujo y palacios. Trilingüe, sentido agudo del servicio VIP. Reconocida por transformar cada llegada en un momento de excepción.",
      exp: [
        { role: "Jefa de recepción", company: "Le Bristol París · Palace", dates: "2023 — 2025", bullets: ["Gestión de un equipo de 6 recepcionistas 24/7", "Acogida VIP: celebridades, jefes de Estado, familias reales", "Satisfacción cliente mantenida en 4,9/5 durante 18 meses"] },
        { role: "Recepcionista de noche", company: "Hôtel Saint-Régis · París", dates: "2021 — 2023", bullets: ["Conserjería premium 24/7", "Gestión de llegadas tardías y reclamaciones VIP"] },
        { role: "Recepcionista", company: "Maison Bréguet · Lyon", dates: "2019 — 2021", bullets: ["Check-in/out, +60 habitaciones", "Venta adicional: +18% RevPAR"] },
      ],
      edu: [{ title: "Licenciatura Pro Hotelería Internacional", school: "Universidad Paris Dauphine", dates: "2018 — 2019" }],
      skills: ["Acogida VIP", "Opera PMS", "Conserjería de lujo", "Gestión de equipo", "Venta adicional", "Inglés C2"],
      langs: [["Francés", "C2", 1.0], ["Inglés", "C2", 1.0], ["Español", "C1", 0.85]],
      labels: { about: "Sobre mí", contact: "Contacto", exp: "Experiencia", edu: "Formación", skills: "Competencias", langs: "Idiomas" },
    },
  },
  commercial: {
    fr: {
      title: "Conseiller commercial",
      about: "Commercial terrain et téléphone, à l'aise sur les cycles courts comme longs. Esprit d'équipe, écoute, négociation.",
      exp: [
        { role: "Conseiller commercial B2B", company: "Maison Pernod · Bordeaux", dates: "2023 — 2025", bullets: ["Portefeuille 80 comptes, +18% CA en 1 an", "Cycle vente 2 à 4 semaines, terrain + visio"] },
        { role: "Conseiller showroom", company: "Boutique L'Atelier · Lyon", dates: "2021 — 2023", bullets: ["Vente conseil, panier moyen +12%"] },
        { role: "Vendeur, événementiel", company: "Garorock · Marmande", dates: "Été 2022", bullets: ["+300 ventes en 1 semaine"] },
      ],
      edu: [{ title: "BTS Négociation Relation Client", school: "Lycée Pré-de-Cordy · Sarlat", dates: "2019 — 2021" }],
      skills: ["Prospection B2B", "Closing", "CRM HubSpot", "Argumentation", "Anglais B2", "Excel"],
      langs: [["Français", "C2", 1.0], ["Espagnol", "C1", 0.85], ["Anglais", "B2", 0.6]],
      labels: { about: "À propos", contact: "Contact", exp: "Expérience", edu: "Formation", skills: "Compétences", langs: "Langues" },
    },
    es: {
      title: "Asesor comercial",
      about: "Comercial sobre el terreno y por teléfono, cómodo en ciclos cortos y largos. Espíritu de equipo, escucha, negociación.",
      exp: [
        { role: "Asesor comercial B2B", company: "Maison Pernod · Burdeos", dates: "2023 — 2025", bullets: ["Cartera 80 cuentas, +18% facturación en 1 año", "Ciclo de venta 2 a 4 semanas, terreno + video"] },
        { role: "Asesor showroom", company: "Boutique L'Atelier · Lyon", dates: "2021 — 2023", bullets: ["Venta consultiva, cesta media +12%"] },
        { role: "Vendedor, eventos", company: "Garorock · Marmande", dates: "Verano 2022", bullets: ["+300 ventas en 1 semana"] },
      ],
      edu: [{ title: "BTS Negociación y Relación Cliente", school: "Lycée Pré-de-Cordy · Sarlat", dates: "2019 — 2021" }],
      skills: ["Prospección B2B", "Closing", "CRM HubSpot", "Argumentación", "Inglés B2", "Excel"],
      langs: [["Francés", "C2", 1.0], ["Español", "C1", 0.85], ["Inglés", "B2", 0.6]],
      labels: { about: "Sobre mí", contact: "Contacto", exp: "Experiencia", edu: "Formación", skills: "Competencias", langs: "Idiomas" },
    },
  },
};

const CVPreviewVisual = ({ cv, scale = 1, float3d = false }) => {
  const { lang } = useT();
  const palettes = {
    warm: { accent: "#8A6F45", soft: "#F5EBD6", sidebar: "#F7EFDC" },
    sage: { accent: "#4A6E55", soft: "#E2EBE2", sidebar: "#EAF1EA" },
    ink:  { accent: "#1B1814", soft: "#E8E2D2", sidebar: "#F0EADF" },
  };
  const p = palettes[cv?.accent || "warm"];
  // Decide content profile from role string
  const profile = (cv?.role || "").toLowerCase().match(/commerc|vendeur|conseill/) ? "commercial" : "hotellerie";
  const c = CV_CONTENT[profile][lang === "es" ? "es" : "fr"];
  const u = MOCK.initialUser;

  // Fixed page dimensions; the whole thing is scaled with transform
  const W = 300, H = Math.round(W * 1.414);
  const card = (
    <div style={{ width: W * scale, height: H * scale, position: "relative", filter: float3d ? "none" : "drop-shadow(0 2px 4px rgba(27,24,20,0.04))" }}>
      <div style={{
        width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left",
        background: "#fff", borderRadius: 8 / scale, overflow: "hidden",
        position: "absolute", top: 0, left: 0, display: "grid", gridTemplateColumns: "115px 1fr",
        fontFamily: "var(--font-body)", color: "#1B1814", boxShadow: "inset 0 0 0 1px var(--border)",
      }}>
        {/* LEFT sidebar */}
        <aside style={{ background: p.sidebar, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: p.accent, fontWeight: 600, marginBottom: 4 }}>{c.labels.about}</div>
            <div style={{ fontSize: 7, lineHeight: 1.4, color: "#3A3530" }}>{c.about}</div>
          </div>

          <div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: p.accent, fontWeight: 600, marginBottom: 5 }}>{c.labels.contact}</div>
            <div style={{ fontSize: 6.8, lineHeight: 1.45, color: "#1B1814", wordBreak: "break-word" }}>
              <div>{u.email}</div>
              <div>{u.phone ? `+33 ${u.phone.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}` : ''}</div>
              <div>France</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: p.accent, fontWeight: 600, marginBottom: 6 }}>{c.labels.langs}</div>
            {c.langs.map(([name, lvl, pct]) => (
              <div key={name} style={{ marginBottom: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 6.5, marginBottom: 2 }}>
                  <span>{name}</span><span style={{ color: p.accent, fontWeight: 600 }}>{lvl}</span>
                </div>
                <div style={{ height: 2.5, background: "rgba(0,0,0,0.06)", borderRadius: 2 }}>
                  <div style={{ width: `${pct * 100}%`, height: "100%", background: p.accent, borderRadius: 2 }}/>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: p.accent, fontWeight: 600, marginBottom: 5 }}>{c.labels.skills}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {c.skills.map((s) => (
                <div key={s} style={{ fontSize: 6.5, color: "#1B1814", display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: p.accent, flexShrink: 0 }}/>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT main column */}
        <main style={{ padding: "18px 16px 14px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
          <header>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.005em" }}>
              {u.firstName || '—'}<br/>{u.lastName || ''}
            </div>
            <div style={{ marginTop: 5, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: p.accent, fontWeight: 600 }}>
              {c.title}
            </div>
            <div style={{ width: 22, height: 1, background: p.accent, marginTop: 6 }}/>
          </header>

          <section>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 500, marginBottom: 6, color: "#1B1814" }}>{c.labels.exp}</div>
            {c.exp.map((e, i) => (
              <div key={i} style={{ marginBottom: 7, paddingLeft: 8, borderLeft: `1px solid ${p.soft}`, position: "relative" }}>
                <div style={{ position: "absolute", left: -2.5, top: 3, width: 4, height: 4, background: p.accent, borderRadius: "50%" }}/>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "baseline" }}>
                  <div style={{ fontSize: 7.5, fontWeight: 600, color: "#1B1814" }}>{e.role}</div>
                  <div style={{ fontSize: 6, color: "#8B8378", whiteSpace: "nowrap" }}>{e.dates}</div>
                </div>
                <div style={{ fontSize: 6.5, color: p.accent, marginBottom: 2, fontStyle: "italic" }}>{e.company}</div>
                {e.bullets.map((b, j) => (
                  <div key={j} style={{ fontSize: 6.3, color: "#3A3530", lineHeight: 1.35, marginTop: 1 }}>· {b}</div>
                ))}
              </div>
            ))}
          </section>

          <section>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 500, marginBottom: 5, color: "#1B1814" }}>{c.labels.edu}</div>
            {c.edu.map((e, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "baseline" }}>
                  <div style={{ fontSize: 7.5, fontWeight: 600 }}>{e.title}</div>
                  <div style={{ fontSize: 6, color: "#8B8378", whiteSpace: "nowrap" }}>{e.dates}</div>
                </div>
                <div style={{ fontSize: 6.5, color: p.accent, fontStyle: "italic" }}>{e.school}</div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
  return float3d ? <div className="cv-3d">{card}</div> : card;
};

// Toast
const Toast = ({ message, show }) => (
  <div style={{
    position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
    background: "var(--ink)", color: "#F7F3EC", padding: "12px 20px", borderRadius: 999,
    fontSize: 14, boxShadow: "var(--shadow-lift)", opacity: show ? 1 : 0,
    transition: "opacity .2s, transform .2s", pointerEvents: "none", zIndex: 200,
  }}>{message}</div>
);

function useToast() {
  const [t, setT] = useState({ show: false, msg: "" });
  const show = (msg) => {
    setT({ show: true, msg });
    setTimeout(() => setT(s => ({ ...s, show: false })), 1800);
  };
  return { Toast: <Toast message={t.msg} show={t.show}/>, show };
}

// ---------------------------------------------------------------------------
// ComboboxField — input with dropdown showing existing items + "Create" option
// ---------------------------------------------------------------------------
const ComboboxField = ({ label, value, onChange, items = [], onCreate, placeholder, hint }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value?.nom || '');
  const [creating, setCreating] = useState(false);
  const containerRef = useRef();

  useEffect(() => { setQuery(value?.nom || ''); }, [value?.id]);

  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = query.trim()
    ? items.filter((i) => i.nom.toLowerCase().includes(query.toLowerCase()))
    : items;
  const exactMatch = items.find((i) => i.nom.toLowerCase() === query.trim().toLowerCase());

  const select = (item) => { onChange(item); setQuery(item.nom); setOpen(false); };

  const handleCreate = () => {
    if (!query.trim() || creating || !onCreate) return;
    setCreating(true);
    onCreate(query.trim())
      .then((item) => { setCreating(false); select(item); })
      .catch(() => setCreating(false));
  };

  return (
    <Field label={label} hint={hint}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <input
          className="input"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); onChange({ id: null, nom: e.target.value }); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 200, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: 'var(--shadow-lift)', maxHeight: 200, overflowY: 'auto',
          }}>
            {filtered.length === 0 && !query.trim() && (
              <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--muted)' }}>Tapez pour rechercher…</div>
            )}
            {filtered.map((item) => (
              <div key={item.id} onMouseDown={() => select(item)} style={{
                padding: '9px 12px', cursor: 'pointer', fontSize: 14,
                borderBottom: '1px solid var(--border)',
              }}>{item.nom}</div>
            ))}
            {query.trim() && !exactMatch && (
              <div onMouseDown={handleCreate} style={{
                padding: '9px 12px', cursor: 'pointer', fontSize: 14,
                color: 'var(--gold-deep)', fontWeight: 500,
                borderTop: filtered.length ? '1px solid var(--border)' : 'none',
              }}>
                {creating ? 'Création…' : `+ Créer "${query.trim()}"`}
              </div>
            )}
          </div>
        )}
      </div>
    </Field>
  );
};

// ---------------------------------------------------------------------------
// AudioPlayerCustom — player unifié utilisé partout (Personnalisation, Preview, Public)
// • Style premium identique partout
// • Fix WebM/Opus duration === Infinity via seek-hack
// • Props optionnelles : label, onPlay, onStop (stats tracking)
// ---------------------------------------------------------------------------
const AudioPlayerCustom = ({ src, knownDuration = 0, label, onPlay, onStop }) => {
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(knownDuration);
  const playStartRef = useRef(null); // position audio au moment du play (pour calculer le delta)

  useEffect(() => {
    setCurrentTime(0);
    setPlaying(false);
    setDuration(knownDuration);
    playStartRef.current = null;
  }, [src, knownDuration]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !src) return;
    let durationFixed = false;

    const tryFixWebmDuration = () => {
      // Si duration est Infinity ou NaN (typique des WebM/Opus MediaRecorder),
      // on force le navigateur à scanner tout le fichier en seekant à 1e10
      if (durationFixed) return;
      if (!isFinite(a.duration)) {
        durationFixed = true;
        const onProbe = () => {
          a.removeEventListener('timeupdate', onProbe);
          try { a.currentTime = 0; } catch (e) {}
          if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
        };
        a.addEventListener('timeupdate', onProbe);
        try { a.currentTime = 1e10; } catch (e) {}
      }
    };

    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => {
      if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
      else tryFixWebmDuration();
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      // Fin naturelle : delta = durée − position de départ (évite le surcomptage)
      if (onStop) {
        const delta = Math.max(0, Math.floor((a.duration || 0) - (playStartRef.current || 0)));
        playStartRef.current = null;
        onStop(delta);
      }
    };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onMeta);
    a.addEventListener('ended', onEnded);

    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onMeta);
      a.removeEventListener('ended', onEnded);
    };
  }, [src, onStop]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      // Delta = position actuelle − position au moment du play (pas de surcomptage)
      if (onStop) {
        const delta = Math.max(0, Math.floor((a.currentTime || 0) - (playStartRef.current || 0)));
        playStartRef.current = null;
        onStop(delta);
      }
    } else {
      // Mémorise la position de départ avant de lancer la lecture
      playStartRef.current = a.currentTime;
      a.play().then(() => {
        setPlaying(true);
        if (onPlay) onPlay(); // chaque appui sur play = 1 démarrage compté
      }).catch(() => { playStartRef.current = null; });
    }
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = ((e.clientX - rect.left) / rect.width) * duration;
    a.currentTime = t;
    setCurrentTime(t);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div style={{ padding: 18, background: 'var(--surface-2)', borderRadius: 18, border: '1px solid var(--border-soft)' }}>
      <audio ref={audioRef} src={src} preload="metadata"/>
      {label && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      <div className="row gap-12" style={{ alignItems: 'center' }}>
        <button type="button" className="audio-play" onClick={toggle} style={{ width: 44, height: 44, flexShrink: 0 }}>
          {playing ? <I.Pause size={14}/> : <I.Play size={14}/>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="audio-bar" onClick={seek} style={{ cursor: 'pointer' }}>
            <div className="audio-bar__progress" style={{ width: pct + '%' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span className="audio-time">{fmt(currentTime)}</span>
            <span className="audio-time">{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// AudioRecorder
// ---------------------------------------------------------------------------
const AudioRecorder = ({ onBlob, existingUrl, onRemove }) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(existingUrl || null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const mrRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const elapsedRef = useRef(0);
  const MAX_SEC = 60;

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mrRef.current && mrRef.current.state !== 'inactive') mrRef.current.stop();
    setRecording(false);
  };

  const start = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Votre navigateur ne supporte pas l'enregistrement audio.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      alert("Votre navigateur ne supporte pas l'enregistrement audio (MediaRecorder).");
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // iOS Safari ne supporte PAS audio/webm — uniquement audio/mp4.
        // On essaie dans l'ordre du meilleur au plus compatible.
        const candidates = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4;codecs=mp4a.40.2",
          "audio/mp4",
          "audio/aac",
        ];
        let mimeType = "";
        for (const c of candidates) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
            mimeType = c;
            break;
          }
        }
        let mr;
        try {
          mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        } catch (e) {
          // Dernier recours : sans mimeType, le navigateur choisit lui-même
          try { mr = new MediaRecorder(stream); }
          catch (_) {
            stream.getTracks().forEach((t) => t.stop());
            alert("Format audio non supporté sur ce navigateur.");
            return;
          }
        }
        const effectiveMime = mr.mimeType || mimeType || "audio/webm";
        chunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: effectiveMime });
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setRecordedDuration(elapsedRef.current);
          onBlob && onBlob(blob);
          stream.getTracks().forEach((track) => track.stop());
        };
        mr.start(100);
        mrRef.current = mr;
        elapsedRef.current = 0;
        setElapsed(0);
        setRecording(true);
        timerRef.current = setInterval(() => {
          setElapsed((s) => {
            const next = s + 1;
            elapsedRef.current = next;
            if (next >= MAX_SEC) { stopRecording(); return MAX_SEC; }
            return next;
          });
        }, 1000);
      })
      .catch((err) => {
        const name = err && err.name ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          alert("Accès au microphone refusé. Autorisez-le dans les réglages de votre navigateur.");
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          alert("Aucun microphone détecté sur cet appareil.");
        } else {
          alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
        }
      });
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const remove = () => {
    setPreviewUrl(null);
    setRecordedDuration(0);
    onRemove && onRemove();
  };

  return (
    <div>
      {!previewUrl ? (
        <div className="card-empty" style={{ padding: 18, textAlign: 'center' }}>
          {recording ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red, #ef4444)', animation: 'pulse 1s infinite' }}/>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}>{fmt(elapsed)} / {fmt(MAX_SEC)}</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg-soft)', borderRadius: 2 }}>
                <div style={{ width: (elapsed / MAX_SEC * 100) + '%', height: '100%', background: 'var(--red, #ef4444)', borderRadius: 2, transition: 'width 1s linear' }}/>
              </div>
              <button className="btn btn--danger btn--sm" type="button" onClick={stopRecording}>
                <I.X size={14}/> Arrêter
              </button>
            </div>
          ) : (
            <button className="btn btn--secondary btn--sm" type="button" onClick={start}>
              <I.Mic size={14}/> Enregistrer (max 1 min)
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AudioPlayerCustom src={previewUrl} knownDuration={recordedDuration}/>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--secondary btn--sm" type="button" onClick={start}>
              <I.Mic size={14}/> Ré-enregistrer
            </button>
            <button className="btn btn--ghost btn--sm" type="button" onClick={remove}>
              <I.Trash size={14}/> Supprimer
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
};

// ---------------------------------------------------------------------------
// imageToWebP — convertit une image (JPEG/PNG/WebP) en Blob WebP qualité 4K
// Quality 97% + max 3200px + lissage HQ pour rendu ultra-net partout
// ---------------------------------------------------------------------------
function imageToWebP(file, maxWidth = 3200, quality = 0.97) {
  return new Promise((resolve, reject) => {
    // Garde-fous : type + taille AVANT de charger en mémoire (anti-DoS navigateur)
    if (!file || typeof file !== "object") return reject(new Error("Fichier invalide"));
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (file.type && !allowedTypes.includes(file.type)) {
      return reject(new Error("Format non supporté (JPEG/PNG/WebP uniquement)"));
    }
    const MAX_BYTES = 15 * 1024 * 1024; // 15 MB — largement suffisant pour un scan CV
    if (file.size > MAX_BYTES) {
      return reject(new Error("Image trop volumineuse (max 15 Mo)"));
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      // Lissage haute qualité (bicubique) pour préserver la netteté du texte
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Conversion WebP échouée'));
      }, 'image/webp', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image invalide')); };
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// ImagePreview — affiche le CV à son ratio naturel (pas de crop)
// • Pas de transform 3D → texte pixel-perfect (la rotation 3D causait le flou)
// • Juste box-shadow + animation flottante (cv-float) pour l'effet premium
// • Ratio naturel : la largeur est fixe, la hauteur s'adapte à l'image source
// ---------------------------------------------------------------------------
const ImagePreview = ({ url, width = 300, float3d = false }) => {
  if (!url) return null;
  const card = (
    <div style={{
      width, borderRadius: 10, overflow: 'hidden', background: '#fff',
      boxShadow: float3d
        ? '0 32px 64px -16px rgba(27,24,20,0.28), 0 12px 24px -8px rgba(27,24,20,0.14), 0 2px 4px rgba(27,24,20,0.06)'
        : '0 2px 12px rgba(27,24,20,0.10), 0 1px 3px rgba(27,24,20,0.06)',
      flexShrink: 0, lineHeight: 0,
    }}>
      <img src={url} alt="CV" style={{ width: '100%', height: 'auto', display: 'block' }}/>
    </div>
  );

  if (!float3d) return card;

  // Plus de rotation 3D — juste flottement vertical pour rester ultra-net
  return (
    <div style={{ animation: 'cv-float 6s ease-in-out infinite', display: 'inline-block' }}>
      {card}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ZoomableImage — zoom & pan style n8n / Voiceflow
// • Ctrl/Cmd + molette → zoom centré sur le curseur (jusqu'à 8x)
// • Clic + glisser → déplacement (pan) dans n'importe quelle direction
// • Double-clic → réinitialise zoom + position
// • Bouton "Réinitialiser" en bas-droit quand zoom > 1
// ---------------------------------------------------------------------------
const ZoomableImage = ({ src, alt = 'CV', maxHeight = '85vh' }) => {
  const containerRef = useRef();
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const reset = () => setView({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = -e.deltaY * 0.003;
      setView((v) => {
        const ns = Math.max(1, Math.min(8, v.scale * (1 + delta)));
        if (ns === v.scale) return v;
        // Zoom centré sur la position du curseur : on garde le même pixel sous la souris
        return {
          scale: ns,
          x: mx - (mx - v.x) * (ns / v.scale),
          y: my - (my - v.y) * (ns / v.scale),
        };
      });
    };
    c.addEventListener('wheel', onWheel, { passive: false });
    return () => c.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsPanning(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const onMouseUp = () => setIsPanning(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={reset}
        style={{
          overflow: 'hidden',
          borderRadius: 10,
          boxShadow: 'var(--shadow-card)',
          cursor: isPanning ? 'grabbing' : (view.scale > 1 ? 'grab' : 'default'),
          background: '#fff',
          maxWidth: '100%',
          userSelect: 'none',
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            display: 'block',
            maxWidth: '100%', maxHeight,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.12s ease-out',
            pointerEvents: 'none',
          }}
        />
      </div>
      {view.scale > 1 && (
        <button
          type="button"
          onClick={reset}
          style={{
            position: 'absolute', bottom: 14, right: 14,
            background: 'rgba(27,24,20,0.88)', color: '#F7F3EC',
            border: 'none', borderRadius: 999, padding: '8px 16px',
            fontSize: 12, cursor: 'pointer', zIndex: 5,
            fontFamily: 'inherit', fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          }}
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// DateTimePicker — input + modal calendrier moderne (style iPhone Calendar)
// Stocke la valeur en ISO string (ex: "2026-05-15T14:30:00.000Z")
// ---------------------------------------------------------------------------
const fmtDateTimeFr = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
         ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const DateTimePicker = ({ value, onChange, placeholder = 'Sélectionner une date et heure' }) => {
  const [open, setOpen] = useState(false);
  return (
    <React.Fragment>
      <div
        className="input"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 8 }}
      >
        <span style={{ color: value ? 'var(--ink)' : 'var(--subtle)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ? fmtDateTimeFr(value) : placeholder}
        </span>
        <I.Calendar size={16} stroke="var(--muted)"/>
      </div>
      {open && (
        <DateTimePickerModal
          value={value}
          onConfirm={(v) => { onChange(v); setOpen(false); }}
          onClear={() => { onChange(''); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </React.Fragment>
  );
};

// ---------------------------------------------------------------------------
// DrumScroll — tambour défilant style horloge iPhone
// ---------------------------------------------------------------------------
const DrumScroll = ({ count, value, onChange, format = (n) => String(n).padStart(2, '0') }) => {
  const ITEM_H = 52;
  const ref = useRef();

  // Init scroll au montage uniquement (évite feedback loop)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = value * ITEM_H;
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(count - 1, idx));
    onChange(clamped);
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div style={{ position: 'relative', width: 90, height: ITEM_H * 5, overflow: 'hidden', borderRadius: 16 }}>
      <style>{`.drum-si::-webkit-scrollbar{display:none}`}</style>
      {/* Lignes de sélection */}
      <div style={{ position: 'absolute', top: ITEM_H * 2, left: 6, right: 6, height: ITEM_H, borderTop: '1px solid var(--border-strong)', borderBottom: '1px solid var(--border-strong)', pointerEvents: 'none', zIndex: 2 }} />
      {/* Fondu haut */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 2 + 10, background: 'linear-gradient(to bottom, var(--surface) 35%, transparent)', pointerEvents: 'none', zIndex: 3 }} />
      {/* Fondu bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 2 + 10, background: 'linear-gradient(to top, var(--surface) 35%, transparent)', pointerEvents: 'none', zIndex: 3 }} />
      <div
        ref={ref}
        className="drum-si"
        onScroll={handleScroll}
        style={{ height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((i) => (
          <div key={i} style={{ height: ITEM_H, scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 500, fontFamily: 'var(--font-mono, monospace)', color: 'var(--ink)', userSelect: 'none', flexShrink: 0 }}>
            {format(i)}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// DateTimePickerModal — 2 étapes : calendrier → heure tambour
// ---------------------------------------------------------------------------
const DateTimePickerModal = ({ value, onConfirm, onClear, onClose }) => {
  const initial = value ? new Date(value) : new Date();
  const safeInitial = isNaN(initial) ? new Date() : initial;
  const [step, setStep] = useState('calendar');
  const [month, setMonth] = useState(new Date(safeInitial.getFullYear(), safeInitial.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [hour, setHour] = useState(value ? safeInitial.getHours() : 9);
  const [minute, setMinute] = useState(value ? safeInitial.getMinutes() : 0);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const prevLast = new Date(month.getFullYear(), month.getMonth(), 0).getDate();

  const cells = [];
  // Cellules vides avant le 1er du mois
  for (let i = 0; i < startDow; i++)
    cells.push(null);
  // Jours du mois uniquement
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true, date: new Date(month.getFullYear(), month.getMonth(), d) });

  const today = new Date();
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const navMonth = (delta) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  const goToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setHours(hour, minute, 0, 0);
    onConfirm(d.toISOString());
  };

  return (
    <Modal open={true} onClose={onClose} width={420} zIndex={200}>
      <div style={{ padding: 28 }}>

        {/* ── ÉTAPE 1 : Calendrier ── */}
        {step === 'calendar' && (
          <React.Fragment>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 500, margin: '0 0 22px', textAlign: 'center' }}>
              Choisir la date
            </h3>

            {/* Navigation mois — ← gauche = précédent, → droite = suivant */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <button type="button" onClick={() => navMonth(-1)} className="icon-btn" aria-label="Mois précédent" style={{ transform: 'rotate(180deg)' }}>
                <I.Arrow size={16} stroke="var(--ink-2)" sw={1.8} viewBox="0 0 24 24" />
              </button>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 19, letterSpacing: '-0.005em' }}>
                {monthNames[month.getMonth()]} {month.getFullYear()}
              </span>
              <button type="button" onClick={() => navMonth(1)} className="icon-btn" aria-label="Mois suivant">
                <I.Arrow size={16} stroke="var(--ink-2)" sw={1.8} viewBox="0 0 24 24" />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
              {dayNames.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Grille des jours */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 22 }}>
              {cells.map((c, i) => {
                if (!c) return <div key={i} />;
                const isToday = sameDay(c.date, today);
                const isSelected = sameDay(c.date, selectedDate);
                return (
                  <button
                    key={i} type="button"
                    onClick={() => setSelectedDate(c.date)}
                    style={{
                      height: 40, border: isToday && !isSelected ? '1px solid var(--gold-deep)' : 'none',
                      borderRadius: 999, cursor: 'pointer',
                      background: isSelected ? 'var(--ink)' : 'transparent',
                      color: isSelected ? '#F7F3EC' : isToday ? 'var(--gold-deep)' : 'var(--ink)',
                      fontWeight: isSelected || isToday ? 600 : 400, fontSize: 14,
                      transition: 'background .15s, color .15s', fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={goToday} style={{ flex: 1 }}>
                Aujourd'hui
              </button>
              <button type="button" className="btn btn--primary" disabled={!selectedDate} onClick={() => setStep('time')} style={{ flex: 2 }}>
                Continuer →
              </button>
            </div>
          </React.Fragment>
        )}

        {/* ── ÉTAPE 2 : Heure (tambour iPhone) ── */}
        {step === 'time' && (
          <React.Fragment>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 500, margin: '0 0 4px', textAlign: 'center' }}>
              Choisir l'heure
            </h3>
            <p className="muted" style={{ textAlign: 'center', margin: '0 0 24px', fontSize: 13 }}>
              {selectedDate && selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            {/* Tambours heure + minute */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
              <DrumScroll count={24} value={hour} onChange={setHour} />
              <span style={{ fontSize: 34, fontWeight: 700, color: 'var(--border-strong)', padding: '0 6px', marginTop: -4 }}>:</span>
              <DrumScroll count={60} value={minute} onChange={setMinute} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep('calendar')} style={{ flex: 1 }}>
                ← Retour
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onClear} style={{ flex: 1 }}>
                Effacer
              </button>
              <button type="button" className="btn btn--primary" onClick={handleConfirm} style={{ flex: 1.5 }}>
                Confirmer
              </button>
            </div>
          </React.Fragment>
        )}

      </div>
    </Modal>
  );
};

Object.assign(window, { Modal, Toggle, Field, ComboboxField, QRBlock, CVPreviewVisual, Toast, useToast, AudioPlayerCustom, AudioRecorder, ImagePreview, ZoomableImage, DateTimePicker, fmtDateTimeFr, imageToWebP });
