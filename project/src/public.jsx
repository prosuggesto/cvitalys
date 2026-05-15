// Page publique CV (vue recruteur après scan) + tracking stats + NFC redirect

const SecondaryContactBtn = ({ icon, brand, label, onClick }) => {
  const Ico = icon ? I[icon] : null;
  return (
    <button onClick={onClick} className="icon-btn" style={{ width: 48, height: 48, border: "1px solid var(--border-strong)", borderRadius: "50%", flexShrink: 0, padding: 0, overflow: "hidden", background: "var(--surface)" }} title={label}>
      {brand ? <BrandLogo name={brand} size={22} /> : <Ico size={17} />}
    </button>);
};

const ExchangeModal = ({ open, onClose, cv, user, toast }) => {
  const { t } = useT();
  const [f, setF] = useState({ company: "", recruiter: "", note: "", date: "" });
  useEffect(() => {if (open) setF({ company: "", recruiter: "", note: "", date: "" });}, [open]);
  const submit = (e) => {
    e.preventDefault();
    if (cv && cv.short_code) api.incrementStat(cv.short_code, 'clic_echange');
    const dateLabel = f.date ? fmtDateTimeFr(f.date) : "—";
    const subject = encodeURIComponent(`Demande d'échange — CV de ${user.firstName} ${user.lastName}`);
    const body = encodeURIComponent(
      `Bonjour ${user.firstName},\n\nNous avons consulté votre CV digital et souhaitons échanger avec vous.\n\nEntreprise : ${f.company || "—"}\nRecruteur : ${f.recruiter || "—"}\nDate et heure souhaitées : ${dateLabel}\nCommentaire : ${f.note || "—"}\n\nCordialement.`
    );
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, "_blank");
    toast(t("public.mailOpened"));
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} width={460}>
      <div style={{ padding: 36 }}>
        <div className="eyebrow">{t("public.candidate") === "Candidat" ? "Recruteur" : "Reclutador"}</div>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "8px 0 6px" }}>{t("public.exchange.title")}</h2>
        <p className="muted" style={{ marginBottom: 22, fontSize: 14 }}>
          {t("public.exchange.sub", { name: user.firstName })}
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label={t("public.company")}><input className="input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="ex. Hôtel Lutetia" /></Field>
          <Field label={t("public.recruiter")}><input className="input" value={f.recruiter} onChange={(e) => setF({ ...f, recruiter: e.target.value })} placeholder={t("public.recruiterPh")} /></Field>
          <Field label="Date et heure de rendez-vous">
            <DateTimePicker value={f.date} onChange={(v) => setF({ ...f, date: v })}/>
          </Field>
          <Field label={t("public.comment")}><textarea className="input textarea" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder={t("public.commentPh")} /></Field>
          <button className="btn btn--primary btn--lg" type="submit"><I.Check size={14} /> {t("public.validate")}</button>
        </form>
      </div>
    </Modal>);
};

const FeedbackModal = ({ open, onClose, cv, user, toast }) => {
  const { t } = useT();
  const [f, setF] = useState({ company: "", recruiter: "", note: "" });
  useEffect(() => {if (open) setF({ company: "", recruiter: "", note: "" });}, [open]);
  const submit = (e) => {
    e.preventDefault();
    if (cv && cv.short_code) api.incrementStat(cv.short_code, 'clic_retour');
    const subject = encodeURIComponent(`Retour recruteur — CV de ${user.firstName} ${user.lastName}`);
    const body = encodeURIComponent(
      `Bonjour ${user.firstName},\n\nNous avons consulté votre CV digital et souhaitons vous faire un retour.\n\nEntreprise : ${f.company || "—"}\nRecruteur : ${f.recruiter || "—"}\nCommentaire : ${f.note || "—"}\n\nCordialement.`
    );
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, "_blank");
    toast(t("public.mailOpened"));
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} width={460}>
      <div style={{ padding: 36 }}>
        <div className="eyebrow">{t("public.candidate") === "Candidat" ? "Recruteur" : "Reclutador"}</div>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "8px 0 6px" }}>{t("public.feedback.title")}</h2>
        <p className="muted" style={{ marginBottom: 22, fontSize: 14 }}>
          {t("public.feedback.sub")}
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label={t("public.company")}><input className="input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="ex. Maison Pernod" /></Field>
          <Field label={t("public.recruiter")}><input className="input" value={f.recruiter} onChange={(e) => setF({ ...f, recruiter: e.target.value })} placeholder={t("public.recruiterPh")} /></Field>
          <Field label={t("public.feedbackLabel")}><textarea className="input textarea" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder={t("public.commentFbPh")} /></Field>
          <button className="btn btn--primary btn--lg" type="submit"><I.Check size={14} /> {t("public.sendFeedback")}</button>
        </form>
      </div>
    </Modal>);
};

// Audio player réel avec tracking stats
const PublicAudioPlayer = ({ audioUrl, shortCode }) => {
  const { t } = useT();
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setPct(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onEnded = () => {
      setPlaying(false);
      if (shortCode) {
        api.incrementStat(shortCode, 'audio_complet');
        api.incrementStat(shortCode, 'temps_audio', Math.floor(audio.duration || 0));
      }
    };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [shortCode]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
      if (!startedRef.current && shortCode) {
        api.incrementStat(shortCode, 'audio_demarre');
        startedRef.current = true;
      }
    }
  };

  const fmt = (s) => {
    const secs = Math.floor(s || 0);
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: 18, background: "var(--surface-2)", borderRadius: 18, border: "1px solid var(--border-soft)" }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" style={{ display: 'none' }}/>
      <div className="row gap-12">
        <button className="audio-play" onClick={togglePlay} style={{ width: 44, height: 44 }}>
          {playing ? <I.Pause size={14} /> : <I.Play size={14} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("public.audioLabel")}</div>
          <div className="audio-bar"><div className="audio-bar__progress" style={{ width: pct + "%" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span className="audio-time">{fmt(currentTime)}</span>
            <span className="audio-time">{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>);
};

// Audio player simulé (pour CVs sans audio_url)
const SimulatedAudioPlayer = ({ duration: durationStr = "1:08" }) => {
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPct((p) => { if (p >= 100) { setPlaying(false); return 100; } return p + 0.6; });
    }, 80);
    return () => clearInterval(id);
  }, [playing]);
  const parseTime = (str) => { const [m, s] = (str || '1:08').split(":").map(Number); return m * 60 + s; };
  const totalSec = parseTime(durationStr);
  const curSec = Math.floor(pct / 100 * totalSec);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div style={{ padding: 18, background: "var(--surface-2)", borderRadius: 18, border: "1px solid var(--border-soft)" }}>
      <div className="row gap-12">
        <button className="audio-play" onClick={() => setPlaying(!playing)} style={{ width: 44, height: 44 }}>
          {playing ? <I.Pause size={14} /> : <I.Play size={14} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("public.audioLabel")}</div>
          <div className="audio-bar"><div className="audio-bar__progress" style={{ width: pct + "%" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span className="audio-time">{fmt(curSec)}</span>
            <span className="audio-time">{durationStr}</span>
          </div>
        </div>
      </div>
    </div>);
};

const ContactRow = ({ icon, label, value }) => {
  const Ico = I[icon];
  return (
    <div className="row gap-12" style={{ padding: "10px 0", fontSize: 14 }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)" }}><Ico size={14} /></span>
      <span className="muted" style={{ width: 90, fontSize: 12, letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ flex: 1, textAlign: "right" }}>{value}</span>
    </div>);
};

// Reusable card UI used both in landing preview and full public page
const PublicCVCard = ({ cv, user, compact, onExchange, onFeedback, onViewCv, shortCode }) => {
  const { t } = useT();
  if (!cv) return null;

  // Compact = miniature pour la landing : tout dans une seule carte (ancien layout)
  if (compact) {
    return (
      <div className="public-card" style={{ padding: 20 }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <Brand size={14} />
          <span className="badge badge--green badge--dot">{t("public.scanned")}</span>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "8px 0" }}>
          {cv.cv_url
            ? <ImagePreview url={cv.cv_url} width={260} float3d={true}/>
            : <CVPreviewVisual cv={cv} scale={1.15} float3d={true} />
          }
        </div>
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <h2 className="display" style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{user.firstName} {user.lastName}</h2>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{cv.role} · {cv.sector}</div>
        </div>
      </div>
    );
  }

  // Full public page : CV flottant + bouton "Voir le CV" en dessous + carte d'infos
  return (
    <React.Fragment>
      {/* CV flottant (le header est rendu en pleine largeur par PublicPage) */}
      <div style={{ margin: '4px 0 16px', display: 'flex', justifyContent: 'center' }}>
        {cv.cv_url
          ? <ImagePreview url={cv.cv_url} width={300} float3d={true}/>
          : <CVPreviewVisual cv={cv} scale={1.35} float3d={true} />
        }
      </div>

      {/* Bouton "Voir le CV" SOUS l'image (ne cache plus le contenu) */}
      {onViewCv && (
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn--secondary btn--sm" onClick={onViewCv}>
            <I.Eye size={14} /> {t("public.viewCv")}
          </button>
        </div>
      )}

      {/* Carte blanche avec toutes les infos */}
      <div className="public-card" style={{ padding: 24 }}>
        {/* Nom + rôle */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{t("public.candidate")}</div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: 0 }}>{user.firstName} {user.lastName}</h2>
          <div className="row gap-8" style={{ marginTop: 8, justifyContent: 'center' }}>
            <span className="badge">{cv.role}</span>
            {cv.sector && <span className="muted" style={{ fontSize: 13 }}>· {cv.sector}</span>}
          </div>
        </div>

        {/* Audio — uniquement si un vocal a été uploadé */}
        {cv.audio_url && (
          <div style={{ marginTop: 18 }}>
            <AudioPlayerCustom
              src={cv.audio_url}
              label={t("public.audioLabel")}
              onPlay={() => shortCode && api.incrementStat(shortCode, 'audio_demarre')}
              onComplete={() => shortCode && api.incrementStat(shortCode, 'audio_complet')}
            />
          </div>
        )}

        {/* CTAs principaux */}
        {(cv.buttons.exchange || cv.buttons.feedback) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {cv.buttons.exchange &&
              <button className="btn btn--primary btn--lg btn--block" onClick={onExchange}>
                <I.ThumbsUp size={16} /> {t("public.exchange.title")}
              </button>
            }
            {cv.buttons.feedback &&
              <button className="btn btn--secondary btn--lg btn--block" onClick={onFeedback}>
                <I.Feedback size={16} /> {t("public.feedback.title")}
              </button>
            }
          </div>
        )}

        {/* Contacts secondaires */}
        {(cv.buttons.whatsapp || cv.buttons.email || cv.buttons.linkedin || cv.buttons.instagram || cv.buttons.website) &&
          <div style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ textAlign: "center", marginBottom: 12 }}>{t("public.otherChannels")}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {cv.buttons.whatsapp && <SecondaryContactBtn brand="whatsapp" label="WhatsApp" onClick={() => { if (shortCode) api.incrementStat(shortCode, 'clic_whatsapp'); const wa = (cv.contact.whatsapp || user.phone || '').replace(/\D/g, ''); window.open(`https://wa.me/${wa}`); }} />}
              {cv.buttons.email && <SecondaryContactBtn brand="gmail" label="Email" onClick={() => { if (shortCode) api.incrementStat(shortCode, 'clic_email'); window.open(`mailto:${cv.contact.email || user.email}`); }} />}
              {cv.buttons.linkedin && <SecondaryContactBtn brand="linkedin" label="LinkedIn" onClick={() => { if (shortCode) api.incrementStat(shortCode, 'clic_linkedin'); const url = cv.contact.linkedin; if (url) window.location.href = url; }} />}
              {cv.buttons.instagram && <SecondaryContactBtn brand="instagram" label="Instagram" onClick={() => { if (shortCode) api.incrementStat(shortCode, 'clic_instagram'); const url = cv.contact.instagram; if (url) window.location.href = url; }} />}
              {cv.buttons.website && <SecondaryContactBtn icon="Globe" label="Site web" onClick={() => { if (shortCode) api.incrementStat(shortCode, 'clic_site_web'); const url = cv.contact.website; if (url) window.location.href = url; }} />}
            </div>
          </div>
        }

        {/* Coordonnées (téléphone, email) */}
        {(user.phone || user.email) &&
          <div style={{ marginTop: 22, padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
            {user.phone && <ContactRow icon="Phone" label={t("common.phone")} value={user.phone} />}
            {user.email && <ContactRow icon="Mail" label={t("common.email")} value={user.email} />}
          </div>
        }

        <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "var(--subtle)" }}>
          <a className="link-underline" href="#/" style={{ color: "var(--subtle)" }}>{t("common.poweredBy")}</a>
        </div>
      </div>
    </React.Fragment>);
};

// Page publique chargée via shortCode depuis Supabase
const PublicPage = ({ shortCode, navigate }) => {
  const { t } = useT();
  const [cvData, setCvData] = useState(null); // { cv, profil }
  const [loading, setLoading] = useState(true);
  const [exchange, setExchange] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { Toast: T, show } = useToast();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!shortCode) { setLoading(false); return; }

    api.getCvByShortCode(shortCode)
      .then((data) => {
        setCvData(data);
        setLoading(false);
        // Incrémenter le scan
        if (data) api.incrementStat(shortCode, 'scan');
      })
      .catch(() => setLoading(false));

    // Tracker le temps passé sur la page
    const handleUnload = () => {
      const secondes = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (secondes > 2) api.incrementStat(shortCode, 'temps_page', secondes);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [shortCode]);

  if (loading) {
    return (
      <div data-no-chrome className="public-shell">
        <div className="public-card" style={{ padding: 40, textAlign: "center" }}>
          <Brand size={20}/>
          <p className="muted" style={{ marginTop: 20 }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div data-no-chrome className="public-shell">
        <div className="public-card" style={{ padding: 40, textAlign: "center" }}>
          <h2 className="display" style={{ fontSize: 28 }}>{t("public.notFound")}</h2>
          <p className="muted">{t("public.notFoundSub")}</p>
          <button className="btn btn--primary" onClick={() => navigate("/")}>{t("public.backHome")}</button>
        </div>
      </div>
    );
  }

  const { cv, profil } = cvData;
  const user = profil
    ? { firstName: profil.prenom || '', lastName: profil.nom || '', email: profil.email || cv.contact.email || '', phone: profil.telephone || cv.contact.phone || '' }
    : { firstName: '', lastName: '', email: cv.contact.email || '', phone: cv.contact.phone || '' };

  // Synchroniser MOCK.initialUser pour le preview visuel
  window.MOCK.initialUser = { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, plan: 'Pro', renewalDate: '' };

  const handleViewCv = () => {
    api.incrementStat(shortCode, 'clic_voir_cv');
    setViewerOpen(true);
  };

  return (
    <div data-no-chrome style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header — Brand + badge taille mesurée, rapprochés via max-width centré */}
      <header style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: 1100, padding: '22px 44px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          <Brand size={18}/>
          <span className="badge badge--green badge--dot" style={{ fontSize: 12, padding: '5px 13px' }}>
            {t("public.scanned")}
          </span>
        </div>
      </header>

      {/* Contenu centré */}
      <div className="public-shell" style={{ paddingTop: 0 }}>
        <PublicCVCard
          cv={cv}
          user={user}
          shortCode={shortCode}
          onExchange={() => setExchange(true)}
          onFeedback={() => setFeedback(true)}
          onViewCv={handleViewCv}
        />
      </div>

      <ExchangeModal open={exchange} onClose={() => setExchange(false)} cv={cv} user={user} toast={show} />
      <FeedbackModal open={feedback} onClose={() => setFeedback(false)} cv={cv} user={user} toast={show} />

      {/* Modal "CV complet" — taille équilibrée + zoom canvas-style */}
      <Modal open={viewerOpen} onClose={() => setViewerOpen(false)} width={1100}>
        <div style={{ padding: 30 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{cv.name}</div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>{t("public.cvComplete")}</h2>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: 13 }}>
            <kbd style={{ padding: '2px 6px', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>Ctrl</kbd> + molette pour zoomer · cliquer-glisser pour déplacer · double-clic pour réinitialiser
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {cv.cv_url
              ? <ZoomableImage src={cv.cv_url}/>
              : <CVPreviewVisual cv={cv} scale={2.1} />
            }
          </div>
        </div>
      </Modal>

      {T}
    </div>);
};

// NFC Redirect — /#/nfc/:code → résout le code court NFC → redirige vers /cv/short_code
const NfcRedirect = ({ code, navigate }) => {
  useEffect(() => {
    api.getNfcByCode(code).then((nfc) => {
      if (nfc && nfc.cvs && nfc.cvs.jeton_public) {
        navigate('/cv/' + nfc.cvs.jeton_public);
      } else {
        navigate('/');
      }
    });
  }, []);
  return (
    <div data-no-chrome style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Brand size={24}/>
    </div>
  );
};

Object.assign(window, { PublicCVCard, PublicPage, NfcRedirect });
