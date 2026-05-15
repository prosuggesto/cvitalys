// Personnalisation: select CV + edit CV

const CustomizeSelectCard = ({ cv, onClick }) => {
  const { t } = useT();
  return (
    <div className="card" onClick={onClick} style={{ padding: 28, cursor: "pointer", display: "flex", flexDirection: "column", gap: 20, transition: "transform .2s, box-shadow .2s" }}
    onMouseEnter={(e) => {e.currentTarget.style.transform = "translateY(-2px)";e.currentTarget.style.boxShadow = "var(--shadow-lift)";}}
    onMouseLeave={(e) => {e.currentTarget.style.transform = "none";e.currentTarget.style.boxShadow = "var(--shadow-card)";}}>
    <div className="between" style={{ alignItems: "flex-start" }}>
      <div>
        <div className="display" style={{ fontSize: 24, fontStyle: "italic", fontWeight: 400 }}>{cv.name}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{cv.sector}</div>
      </div>
      <span className="badge">{cv.role}</span>
    </div>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <CVPreviewVisual cv={cv} scale={1.1} />
    </div>
    <div className="between">
      <span className="muted" style={{ fontSize: 13 }}>{t("custom.select.click")}</span>
      <span className="row gap-8" style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
        <I.Brush size={14} /> {t("custom.select.btn")} <I.Arrow size={14} />
      </span>
    </div>
  </div>);

};

const CustomizeSelect = ({ cvs, navigate }) => {
  const { t } = useT();
  return (
    <div className="page">
    <PageHeader
        eyebrow={t("custom.select.eyebrow")}
        title={t("custom.select.title")}
        subtitle={t("custom.select.sub")} />
      
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
      {cvs.map((cv) =>
        <CustomizeSelectCard key={cv.id} cv={cv} onClick={() => navigate(`/app/customize/${cv.id}`)} />
        )}
    </div>
  </div>);

};

const ButtonToggleRow = ({ label, icon, brand, on, onChange, children }) => {
  const Ico = icon ? I[icon] : null;
  return (
    <div style={{ padding: "14px 0", borderTop: "1px solid var(--border-soft)" }}>
      <div className="between">
        <div className="row gap-12">
          <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", overflow: "hidden" }}>
            {brand ? <BrandLogo name={brand} size={18} /> : Ico && <Ico size={16} />}
          </span>
          <span style={{ fontSize: 14 }}>{label}</span>
        </div>
        <Toggle on={on} onChange={onChange} label={label} />
      </div>
      {on && children && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>);

};

const CustomizeEdit = ({ cv, onSave, onPreview, onUpdate, toast, navigate }) => {
  const { t } = useT();
  const [local, setLocal] = useState(cv);
  const fileInputRef = useRef();
  const audioInputRef = useRef();

  useEffect(() => {setLocal(cv);}, [cv?.id]);
  if (!cv) return null;

  const update = (patch) => setLocal((l) => ({ ...l, ...patch }));
  const updateContact = (patch) => setLocal((l) => ({ ...l, contact: { ...l.contact, ...patch } }));
  const updateButtons = (patch) => setLocal((l) => ({ ...l, buttons: { ...l.buttons, ...patch } }));

  return (
    <div className="page" style={{ maxWidth: 1320 }}>
      <PageHeader
        eyebrow={t("custom.select.eyebrow")}
        title={local.name}
        subtitle={t("custom.edit.sub")}
        action={
        <div className="row gap-8">
            <button className="btn btn--secondary" onClick={() => navigate("/app/customize")}>← {t("common.back")}</button>
            <button className="btn btn--secondary" onClick={() => onPreview(local)}><I.Eye size={14} /> {t("common.preview")}</button>
            <button className="btn btn--primary" onClick={() => {onSave(local);toast(t("custom.saved"));}}><I.Check size={14} /> {t("common.save")}</button>
          </div>
        } />
      

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)", gap: 28, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 92 }}>
          <div className="card" style={{ padding: 32 }}>
            <div className="between" style={{ marginBottom: 18 }}>
              <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("custom.cvSection")}</h3>
              <span className="badge badge--neutral">{local.hasFile ? t("custom.cvImported") : t("custom.cvNone")}</span>
            </div>
            {local.hasFile ?
            <React.Fragment>
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 20px" }}>
                  <CVPreviewVisual cv={local} scale={1.4} float3d={true} />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
                  <button className="btn btn--secondary btn--sm" onClick={() => fileInputRef.current.click()}><I.Upload size={14} /> {t("common.replace")}</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => onPreview(local)}><I.Eye size={14} /> {t("common.fullscreen")}</button>
                  <input type="file" accept="application/pdf" ref={fileInputRef} hidden onChange={(e) => {if (e.target.files[0]) toast(t("custom.cvImported"));}} />
                </div>
              </React.Fragment> :

            <div className="card-empty" style={{ padding: 56, textAlign: "center", aspectRatio: "1/1.414", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <I.Cv size={36} stroke="var(--subtle)" />
                <div className="muted">{t("custom.cvNoneText")}</div>
                <button className="btn btn--primary btn--sm" onClick={() => {update({ hasFile: true });toast(t("custom.cvImported"));}}><I.Upload size={14} /> {t("custom.cvImportBtn")}</button>
              </div>
            }
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("custom.audioSection")}</h3>
              <I.Mic size={18} stroke="var(--muted)" />
            </div>
            {local.audio ?
            <React.Fragment>
                <div className="audio-player">
                  <button className="audio-play" data-comment-anchor="5c4734264f-button-128-19"><I.Play size={14} /></button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, marginBottom: 6, fontFamily: "var(--font-mono)" }}>{local.audio.name}</div>
                    <div className="audio-bar"><div className="audio-bar__progress" style={{ width: "0%" }} /></div>
                  </div>
                  <span className="audio-time">{local.audio.duration}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="btn btn--secondary btn--sm" onClick={() => audioInputRef.current.click()}><I.Upload size={14} /> {t("common.replace")}</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => {update({ audio: null });toast(t("custom.audioRemoved"));}}><I.Trash size={14} /> {t("common.remove")}</button>
                  <input type="file" accept="audio/*" ref={audioInputRef} hidden onChange={(e) => {if (e.target.files[0]) {update({ audio: { name: e.target.files[0].name, duration: "0:58" } });toast(t("custom.audioReplaced"));}}} />
                </div>
              </React.Fragment> :

            <div className="card-empty" style={{ padding: 24, textAlign: "center" }}>
                <p className="muted" style={{ margin: "0 0 14px" }}>{t("custom.audioNone")}</p>
                <button className="btn btn--primary btn--sm" onClick={() => audioInputRef.current.click()}><I.Mic size={14} /> {t("custom.audioImportBtn")}</button>
                <input type="file" accept="audio/*" ref={audioInputRef} hidden onChange={(e) => {if (e.target.files[0]) {update({ audio: { name: e.target.files[0].name, duration: "0:58" } });toast(t("custom.audioReplaced"));}}} />
              </div>
            }
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 28 }} data-comment-anchor="e1dd7be198-div-152-11">
            <h3 className="display" style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 500 }}>{t("custom.infoSection")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label={t("common.cvName")}><input className="input" value={local.name} onChange={(e) => update({ name: e.target.value })} /></Field>
              <Field label={t("common.role")}><input className="input" value={local.role} onChange={(e) => update({ role: e.target.value })} /></Field>
              <Field label={t("common.sector")}><input className="input" value={local.sector} onChange={(e) => update({ sector: e.target.value })} /></Field>
              <Field label={t("custom.accent")}>
                <select className="select" value={local.accent} onChange={(e) => update({ accent: e.target.value })}>
                  <option value="warm">{t("custom.accent.warm")}</option>
                  <option value="sage">{t("custom.accent.sage")}</option>
                  <option value="ink">{t("custom.accent.ink")}</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 className="display" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>{t("custom.buttonsSection")}</h3>
            <p className="muted" style={{ margin: "0 0 10px", fontSize: 13 }}>{t("custom.buttonsSub")}</p>
            <ButtonToggleRow label={t("custom.btn.exchange")} icon="ThumbsUp" on={local.buttons.exchange} onChange={(v) => updateButtons({ exchange: v })} />
            <ButtonToggleRow label={t("custom.btn.feedback")} icon="Feedback" on={local.buttons.feedback} onChange={(v) => updateButtons({ feedback: v })} />
            <ButtonToggleRow label="Email" brand="gmail" on={local.buttons.email} onChange={(v) => updateButtons({ email: v })}>
              <input className="input" value={local.contact.email} onChange={(e) => updateContact({ email: e.target.value })} placeholder="email@exemple.fr" />
            </ButtonToggleRow>
            <ButtonToggleRow label="WhatsApp" brand="whatsapp" on={local.buttons.whatsapp} onChange={(v) => updateButtons({ whatsapp: v })}>
              <input className="input" value={local.contact.whatsapp} onChange={(e) => updateContact({ whatsapp: e.target.value })} placeholder="+33 6 ..." />
            </ButtonToggleRow>
            <ButtonToggleRow label="LinkedIn" brand="linkedin" on={local.buttons.linkedin} onChange={(v) => updateButtons({ linkedin: v })}>
              <input className="input" value={local.contact.linkedin} onChange={(e) => updateContact({ linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
            </ButtonToggleRow>
            <ButtonToggleRow label="Instagram" brand="instagram" on={local.buttons.instagram} onChange={(v) => updateButtons({ instagram: v })}>
              <input className="input" value={local.contact.instagram} onChange={(e) => updateContact({ instagram: e.target.value })} placeholder="@pseudo" />
            </ButtonToggleRow>
            <ButtonToggleRow label="Site web" icon="Globe" on={local.buttons.website} onChange={(v) => updateButtons({ website: v })}>
              <input className="input" value={local.contact.website} onChange={(e) => updateContact({ website: e.target.value })} placeholder="https://..." />
            </ButtonToggleRow>
          </div>

          <div className="card card--soft" style={{ padding: 22, display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500 }}>{t("custom.previewBox.title")}</div>
              <div className="muted" style={{ fontSize: 13 }}>{t("custom.previewBox.sub")}</div>
            </div>
            <div className="row gap-8">
              <button className="btn btn--secondary" onClick={() => onPreview(local)}><I.Eye size={14} /> {t("common.preview")}</button>
              <button className="btn btn--primary" onClick={() => {onSave(local);toast(t("custom.saved"));}}>{t("common.save")}</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 1000px) { .page > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; } .page > div > div:first-child { position: static !important; } }`}</style>
    </div>);

};

Object.assign(window, { CustomizeSelect, CustomizeEdit });