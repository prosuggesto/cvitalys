// Mes CV page + Présenter modal + Ajouter modal

const CVCard = ({ cv, onPresent, onCustomize, onPreview, onDelete }) => {
  const { t } = useT();
  return (
  <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
    <div className="between" style={{ alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-12" style={{ alignItems: "center" }}>
          <span className="display" style={{ fontSize: 24, fontStyle: "italic", fontWeight: 400 }}>{cv.name}</span>
          <span className="badge">{cv.role}</span>
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{cv.sector}</div>
      </div>
      <div className="row gap-8">
        <button className="icon-btn" onClick={onCustomize} title={t("nav.customize")}><I.Brush size={16}/></button>
        <button className="icon-btn" onClick={onPreview} title={t("common.preview")}><I.Grid size={16}/></button>
        <button className="icon-btn icon-btn--danger" onClick={onDelete} title={t("common.delete")} style={{ color: "var(--red)" }}><I.X size={16}/></button>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
      <CVPreviewVisual cv={cv} scale={1}/>
    </div>
    <button className="btn btn--primary btn--block" onClick={onPresent}>
      <I.QR size={16}/> {t("cvs.present")}
    </button>
  </div>
  );
};

const EmptyCVCard = ({ onClick }) => {
  const { t } = useT();
  return (
  <div className="card-empty" onClick={onClick} style={{ padding: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", minHeight: 540, gap: 14 }}>
    <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px dashed var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
      <I.Plus size={22}/>
    </div>
    <div>
      <div className="display" style={{ fontSize: 22, fontWeight: 500 }}>{t("cvs.addTitle")}</div>
      <p className="muted" style={{ margin: "6px 24px 0", fontSize: 14, maxWidth: 280 }}>{t("cvs.addSub")}</p>
    </div>
  </div>
  );
};

const PresentModal = ({ cv, open, onClose, onCopy }) => {
  const { t } = useT();
  if (!cv) return null;
  const link = `cvitalis.app/${cv.id}-${MOCK.initialUser.lastName.toLowerCase()}`;
  return (
    <Modal open={open} onClose={onClose} width={920}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ padding: 48, background: "var(--bg-soft)", borderRadius: "22px 0 0 22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CVPreviewVisual cv={cv} scale={1.05}/>
        </div>
        <div style={{ padding: "56px 48px 48px" }}>
          <div className="eyebrow">{t("cvs.modal.present.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 500, margin: "10px 0 14px", fontStyle: "italic" }}>{cv.name}</h2>
          <p className="muted" style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.55 }}>
            {t("cvs.modal.present.body")}
          </p>
          <div style={{ padding: 18, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, display: "flex", justifyContent: "center" }}>
            <QRBlock size={180}/>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", textAlign: "center", fontFamily: "var(--font-mono)" }}>{link}</div>
          <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 20 }} onClick={onCopy}>
            <I.Share size={16}/> {t("common.share")}
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .modal > div { grid-template-columns: 1fr !important; } .modal > div > div:first-child { border-radius: 22px 22px 0 0 !important; padding: 32px !important; } }`}</style>
    </Modal>
  );
};

const AddCVModal = ({ open, onClose, onCreate }) => {
  const { t } = useT();
  const [f, setF] = useState({ name: "", role: "", sector: "", file: null, audio: null });
  useEffect(() => { if (open) setF({ name: "", role: "", sector: "", file: null, audio: null }); }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div style={{ padding: 40 }}>
        <div className="eyebrow">{t("cvs.modal.add.eyebrow")}</div>
        <h2 className="display" style={{ fontSize: 32, margin: "8px 0 6px", fontWeight: 500 }}>{t("cvs.modal.add.title")}</h2>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>{t("cvs.modal.add.sub")}</p>
        <form onSubmit={(e) => { e.preventDefault(); onCreate(f); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label={t("common.cvName")}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="ex. CV Hôtellerie"/></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label={t("common.role")}><input className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="Réceptionniste"/></Field>
            <Field label={t("common.sector")}><input className="input" value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })} placeholder="Hôtellerie"/></Field>
          </div>
          <Field label={t("cvs.modal.add.cvFile")}>
            <label className="card-empty" style={{ padding: 18, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", justifyContent: "center" }}>
              <I.Upload size={18} stroke="var(--muted)"/>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{f.file?.name || t("cvs.modal.add.cvHint")}</span>
              <input type="file" accept="application/pdf" hidden onChange={(e) => setF({ ...f, file: e.target.files[0] })}/>
            </label>
          </Field>
          <Field label={t("cvs.modal.add.audio")}>
            <label className="card-empty" style={{ padding: 18, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", justifyContent: "center" }}>
              <I.Mic size={18} stroke="var(--muted)"/>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{f.audio?.name || t("cvs.modal.add.audioHint")}</span>
              <input type="file" accept="audio/*" hidden onChange={(e) => setF({ ...f, audio: e.target.files[0] })}/>
            </label>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn btn--secondary" onClick={onClose} style={{ flex: 1 }}>{t("common.cancel")}</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 2 }}>{t("cvs.modal.add.submit")}</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const MesCV = ({ cvs, setCvs, navigate, toast }) => {
  const { t } = useT();
  const [presentCv, setPresentCv] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="page">
      <PageHeader
        eyebrow={t("cvs.eyebrow")}
        title={t("cvs.title")}
        subtitle={t("cvs.sub")}
      />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
        {cvs.map((cv) => (
          <CVCard
            key={cv.id}
            cv={cv}
            onPresent={() => setPresentCv(cv)}
            onCustomize={() => navigate(`/app/customize/${cv.id}`)}
            onPreview={() => navigate(`/cv/${cv.id}`)}
            onDelete={() => {
              if (confirm(t("cvs.deleteConfirm", { name: cv.name }))) {
                setCvs(cvs.filter((c) => c.id !== cv.id));
                toast(t("cvs.deleted"));
              }
            }}
          />
        ))}
        <EmptyCVCard onClick={() => setAddOpen(true)}/>
      </div>
      <PresentModal cv={presentCv} open={!!presentCv} onClose={() => setPresentCv(null)} onCopy={() => { toast(t("common.copied")); }}/>
      <AddCVModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={(f) => {
        const id = "cv" + Date.now();
        setCvs([...cvs, {
          id,
          name: f.name || "Nouveau CV",
          role: f.role || "—",
          sector: f.sector || "—",
          audio: f.audio ? { name: f.audio.name, duration: "1:00" } : null,
          hasFile: !!f.file,
          buttons: { exchange: true, feedback: true, email: true, whatsapp: false, linkedin: false, instagram: false, website: false },
          contact: { email: MOCK.initialUser.email, phone: MOCK.initialUser.phone, whatsapp: "", linkedin: "", instagram: "", website: "" },
          accent: "warm",
        }]);
        setAddOpen(false);
        toast(t("cvs.created"));
      }}/>
    </div>
  );
};

window.MesCV = MesCV;
