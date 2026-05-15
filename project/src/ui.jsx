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

// QRBlock — génère un vrai QR code via la lib QRCode (CDN)
const QRBlock = ({ size = 200, url }) => {
  const canvasRef = useRef();
  useEffect(() => {
    if (!canvasRef.current) return;
    if (url && window.QRCode) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        { width: size, margin: 2, color: { dark: '#1B1814', light: '#ffffff' } },
        () => {}
      );
    }
  }, [url, size]);
  if (!url) return <div style={{ width: size, height: size, background: "var(--bg-soft)", borderRadius: 8 }}/>;
  return <canvas ref={canvasRef} style={{ borderRadius: 8 }}/>;
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
            {(u.firstName || '?')[0]}{(u.lastName || '?')[0]}
          </div>

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
// • Props optionnelles : label, onPlay, onComplete (stats tracking)
// ---------------------------------------------------------------------------
const AudioPlayerCustom = ({ src, knownDuration = 0, label, onPlay, onComplete }) => {
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(knownDuration);
  const playedRef = useRef(false);

  useEffect(() => {
    setCurrentTime(0);
    setPlaying(false);
    setDuration(knownDuration);
    playedRef.current = false;
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
      if (onComplete) onComplete();
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
  }, [src, onComplete]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      a.play().then(() => {
        setPlaying(true);
        if (!playedRef.current && onPlay) { onPlay(); playedRef.current = true; }
      }).catch(() => {});
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
      <div className="row gap-12">
        <button type="button" className="audio-play" onClick={toggle} style={{ width: 44, height: 44 }}>
          {playing ? <I.Pause size={14}/> : <I.Play size={14}/>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {label && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {label}
            </div>
          )}
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
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        const mr = new MediaRecorder(stream, { mimeType });
        chunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
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
      .catch(() => {
        alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
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
// imageToWebP — convertit une image (JPEG/PNG/WebP) en Blob WebP compressé
// Qualité très haute (96%) + max 2800px pour une image super nette.
// ---------------------------------------------------------------------------
function imageToWebP(file, maxWidth = 2800, quality = 0.96) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
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
// • Pas de objectFit: cover → image rendue pixel-perfect, jamais coupée
// • Effet 3D doux (rotation légère) + animation flottante → reste net
// • box-shadow au lieu de filter:drop-shadow → meilleure netteté GPU
// ---------------------------------------------------------------------------
const ImagePreview = ({ url, width = 300, float3d = false }) => {
  if (!url) return null;
  const card = (
    <div style={{
      width, borderRadius: 10, overflow: 'hidden', background: '#fff',
      boxShadow: float3d
        ? '0 30px 60px -15px rgba(27,24,20,0.22), 0 8px 18px -6px rgba(27,24,20,0.10)'
        : '0 2px 12px rgba(27,24,20,0.10), 0 1px 3px rgba(27,24,20,0.06)',
      flexShrink: 0, lineHeight: 0,
    }}>
      <img src={url} alt="CV" style={{ width: '100%', height: 'auto', display: 'block' }}/>
    </div>
  );

  if (!float3d) return card;

  // Effet 3D léger : rotation douce + animation flottante (cf .cv-float dans styles.css)
  return (
    <div style={{ animation: 'cv-float 6s ease-in-out infinite', display: 'inline-block', perspective: '1400px' }}>
      <div style={{ transform: 'rotateX(2deg) rotateY(-4deg)', transformStyle: 'preserve-3d', transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' }}>
        {card}
      </div>
    </div>
  );
};

Object.assign(window, { Modal, Toggle, Field, ComboboxField, QRBlock, CVPreviewVisual, Toast, useToast, AudioPlayerCustom, AudioRecorder, ImagePreview, imageToWebP });
