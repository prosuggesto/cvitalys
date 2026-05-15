// Public CV page (recruiter view after scan) + exchange/feedback modals

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
    const subject = encodeURIComponent(`Demande d'échange — CV de ${user.firstName} ${user.lastName}`);
    const body = encodeURIComponent(
      `Bonjour ${user.firstName},

Nous avons consulté votre CV digital et souhaitons échanger avec vous.

Entreprise : ${f.company || "—"}
Recruteur : ${f.recruiter || "—"}
Date souhaitée : ${f.date || "—"}
Commentaire : ${f.note || "—"}

Cordialement.`
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
          <Field label={t("public.date")}><input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
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
    const subject = encodeURIComponent(`Retour recruteur — CV de ${user.firstName} ${user.lastName}`);
    const body = encodeURIComponent(
      `Bonjour ${user.firstName},

Nous avons consulté votre CV digital et souhaitons vous faire un retour.

Entreprise : ${f.company || "—"}
Recruteur : ${f.recruiter || "—"}
Commentaire : ${f.note || "—"}

Cordialement.`
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

// Audio player with simulated playback
const PublicAudioPlayer = ({ duration = "1:08" }) => {
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {setPlaying(false);return 100;}
        return p + 0.6;
      });
    }, 80);
    return () => clearInterval(id);
  }, [playing]);
  const parseTime = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };
  const totalSec = parseTime(duration);
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
            <span className="audio-time">{duration}</span>
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
const PublicCVCard = ({ cv, user, compact, onExchange, onFeedback, onViewCv }) => {
  const { t } = useT();
  if (!cv) return null;
  return (
    <div className="public-card" style={{ padding: compact ? 20 : 24 }}>
      <div className="between" style={{ marginBottom: 14 }}>
        <Brand size={14} />
        <span className="badge badge--green badge--dot">{t("public.scanned")}</span>
      </div>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: compact ? "8px 0" : "16px 4px" }}>
        <CVPreviewVisual cv={cv} scale={compact ? 1.15 : 1.35} float3d={true} />
        {onViewCv &&
        <button className="btn btn--secondary btn--sm" style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.95)", boxShadow: "var(--shadow-card)", zIndex: 2 }} onClick={onViewCv}>
            <I.Eye size={14} /> {t("public.viewCv")}
          </button>
        }
      </div>
      <div style={{ marginTop: 16 }}>
        <PublicAudioPlayer duration={cv.audio?.duration || "1:08"} />
      </div>
      <div style={{ marginTop: 18, padding: "16px 4px", borderTop: "1px solid var(--border-soft)" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{t("public.candidate")}</div>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: 0 }}>{user.firstName} {user.lastName}</h2>
        <div className="row gap-8" style={{ marginTop: 6 }}>
          <span className="badge">{cv.role}</span>
          <span className="muted" style={{ fontSize: 13 }}>· {cv.sector}</span>
        </div>
      </div>

      {/* Primary CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
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

      {/* Secondary contacts */}
      {(cv.buttons.whatsapp || cv.buttons.email || cv.buttons.linkedin || cv.buttons.instagram || cv.buttons.website) &&
      <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ textAlign: "center", marginBottom: 12 }}>{t("public.otherChannels")}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {cv.buttons.whatsapp && <SecondaryContactBtn brand="whatsapp" label="WhatsApp" onClick={() => window.open(`https://wa.me/${cv.contact.whatsapp.replace(/\D/g, '')}`)} />}
            {cv.buttons.email && <SecondaryContactBtn brand="gmail" label="Email" onClick={() => window.open(`mailto:${cv.contact.email}`)} />}
            {cv.buttons.linkedin && <SecondaryContactBtn brand="linkedin" label="LinkedIn" onClick={() => window.open("https://" + cv.contact.linkedin)} />}
            {cv.buttons.instagram && <SecondaryContactBtn brand="instagram" label="Instagram" />}
            {cv.buttons.website && <SecondaryContactBtn icon="Globe" label="Site web" />}
          </div>
        </div>
      }

      {/* Contact details */}
      {!compact &&
      <div style={{ marginTop: 22, padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
          <ContactRow icon="Phone" label={t("common.phone")} value={cv.contact.phone} />
          <ContactRow icon="Mail" label={t("common.email")} value={cv.contact.email} />
        </div>
      }

      <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "var(--subtle)" }} data-comment-anchor="05fec32307-div-214-7">
        <a className="link-underline" href="#/" style={{ color: "var(--subtle)" }}>{t("common.poweredBy")}</a>
      </div>
    </div>);

};

const PublicPage = ({ cv, user, navigate }) => {
  const { t } = useT();
  const [exchange, setExchange] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { Toast: T, show } = useToast();
  if (!cv) return (
    <div data-no-chrome className="public-shell">
      <div className="public-card" style={{ padding: 40, textAlign: "center" }}>
        <h2 className="display" style={{ fontSize: 28 }}>{t("public.notFound")}</h2>
        <p className="muted">{t("public.notFoundSub")}</p>
        <button className="btn btn--primary" onClick={() => navigate("/")}>{t("public.backHome")}</button>
      </div>
    </div>);

  return (
    <div data-no-chrome className="public-shell">
      <PublicCVCard
        cv={cv}
        user={user}
        onExchange={() => setExchange(true)}
        onFeedback={() => setFeedback(true)}
        onViewCv={() => setViewerOpen(true)} />
      

      <ExchangeModal open={exchange} onClose={() => setExchange(false)} cv={cv} user={user} toast={show} />
      <FeedbackModal open={feedback} onClose={() => setFeedback(false)} cv={cv} user={user} toast={show} />

      <Modal open={viewerOpen} onClose={() => setViewerOpen(false)} width={720}>
        <div style={{ padding: 30 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{cv.name}</div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 16px" }}>{t("public.cvComplete")}</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CVPreviewVisual cv={cv} scale={2.1} />
          </div>
        </div>
      </Modal>

      {T}
    </div>);

};

Object.assign(window, { PublicCVCard, PublicPage });