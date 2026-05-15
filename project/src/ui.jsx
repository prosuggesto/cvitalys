// Shared UI primitives

const { useState, useEffect, useRef, useMemo } = React;

const Modal = ({ open, onClose, children, width, padding }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <div className={"modal-backdrop" + (open ? " is-open" : "")} onClick={onClose}>
      <div className="modal" style={{ maxWidth: width || 920, padding: padding ?? 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Fermer">
          <I.Close size={16}/>
        </button>
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

// Decorative QR — non-functional but looks legit
const QRBlock = ({ size = 200 }) => {
  // generate a deterministic pattern
  const cells = useMemo(() => {
    const n = 23;
    const out = [];
    const seed = (i, j) => ((i*31 + j*17 + (i^j)*7) % 7) < 3;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // corners (finder patterns)
        const inFinder = (i < 7 && j < 7) || (i < 7 && j > n-8) || (i > n-8 && j < 7);
        if (inFinder) continue;
        if (seed(i, j)) out.push({ i, j });
      }
    }
    return out;
  }, []);
  const cell = size / 23;
  const Finder = ({ x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <rect width={cell*7} height={cell*7} fill="#1B1814" rx="2"/>
      <rect x={cell} y={cell} width={cell*5} height={cell*5} fill="#fff"/>
      <rect x={cell*2} y={cell*2} width={cell*3} height={cell*3} fill="#1B1814" rx="1"/>
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="#fff"/>
      <Finder x={0} y={0}/>
      <Finder x={(23-7)*cell} y={0}/>
      <Finder x={0} y={(23-7)*cell}/>
      {cells.map((c, idx) => (
        <rect key={idx} x={c.j*cell} y={c.i*cell} width={cell*0.95} height={cell*0.95} fill="#1B1814"/>
      ))}
    </svg>
  );
};

// Realistic A4 CV preview (PDF-style, two-column). Uses transform: scale() so
// typography stays crisp at any size.
const CV_CONTENT = {
  hotellerie: {
    fr: {
      title: "Réceptionniste",
      about: "Profil orienté service avec 5 ans en hôtellerie haut de gamme. Anglais courant, gestion VIP, sens du détail.",
      exp: [
        { role: "Réceptionniste de nuit", company: "Hôtel Saint-Régis · Paris", dates: "2023 — 2025", bullets: ["Accueil VIP et conciergerie 24/7", "Gestion des arrivées tardives et plaintes", "Coordination avec les équipes housekeeping"] },
        { role: "Réceptionniste", company: "Maison Bréguet · Lyon", dates: "2021 — 2023", bullets: ["Check-in / check-out, +60 chambres", "Anglais, espagnol au quotidien"] },
        { role: "Stagiaire accueil", company: "Hôtel Le Marquis · Annecy", dates: "2019 — 2021", bullets: ["Première expérience terrain"] },
      ],
      edu: [{ title: "BTS Hôtellerie-Restauration", school: "Lycée Jehan-Ango · Dieppe", dates: "2019 — 2021" }],
      skills: ["Accueil VIP", "Opera PMS", "Conciergerie", "Gestion conflit", "Anglais C1", "Espagnol B2"],
      langs: [["Français", "C2", 1.0], ["Anglais", "C1", 0.8], ["Espagnol", "B2", 0.65]],
      labels: { about: "À propos", contact: "Contact", exp: "Expérience", edu: "Formation", skills: "Compétences", langs: "Langues" },
    },
    es: {
      title: "Recepcionista",
      about: "Perfil orientado al servicio con 5 años en hotelería de gama alta. Inglés fluido, gestión VIP, sentido del detalle.",
      exp: [
        { role: "Recepcionista de noche", company: "Hôtel Saint-Régis · París", dates: "2023 — 2025", bullets: ["Acogida VIP y conserjería 24/7", "Gestión de llegadas tardías y reclamaciones", "Coordinación con el equipo de housekeeping"] },
        { role: "Recepcionista", company: "Maison Bréguet · Lyon", dates: "2021 — 2023", bullets: ["Check-in / check-out, +60 habitaciones", "Inglés y español a diario"] },
        { role: "Prácticas en recepción", company: "Hôtel Le Marquis · Annecy", dates: "2019 — 2021", bullets: ["Primera experiencia sobre el terreno"] },
      ],
      edu: [{ title: "BTS Hostelería y Restauración", school: "Lycée Jehan-Ango · Dieppe", dates: "2019 — 2021" }],
      skills: ["Acogida VIP", "Opera PMS", "Conserjería", "Gestión de conflictos", "Inglés C1", "Español B2"],
      langs: [["Francés", "C2", 1.0], ["Inglés", "C1", 0.8], ["Español", "B2", 0.65]],
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
          {/* Avatar */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", border: `2px solid ${p.accent}`, margin: "2px auto 4px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: p.accent }}>
            {u.firstName[0]}{u.lastName[0]}
          </div>

          <div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: p.accent, fontWeight: 600, marginBottom: 4 }}>{c.labels.about}</div>
            <div style={{ fontSize: 7, lineHeight: 1.4, color: "#3A3530" }}>{c.about}</div>
          </div>

          <div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: p.accent, fontWeight: 600, marginBottom: 5 }}>{c.labels.contact}</div>
            <div style={{ fontSize: 6.8, lineHeight: 1.45, color: "#1B1814", wordBreak: "break-word" }}>
              <div>{u.email}</div>
              <div>+33 {u.phone.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}</div>
              <div>Paris, France</div>
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
              {u.firstName}<br/>{u.lastName}
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

Object.assign(window, { Modal, Toggle, Field, QRBlock, CVPreviewVisual, Toast, useToast });
