// Mes CV page + Présenter modal + Ajouter modal — connecté à Supabase

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
      {cv.cv_url ? <PdfCardPreview url={cv.cv_url} width={300}/> : <CVPreviewVisual cv={cv} scale={1}/>}
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
  const publicUrl = cv.short_code
    ? `${window.location.origin}${window.location.pathname}#/cv/${cv.short_code}`
    : null;

  const handleCopy = () => {
    if (publicUrl) {
      navigator.clipboard && navigator.clipboard.writeText(publicUrl).catch(() => {});
    }
    onCopy && onCopy();
  };

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
            <QRBlock size={180} url={publicUrl}/>
          </div>
          {publicUrl && (
            <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", textAlign: "center", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>{publicUrl}</div>
          )}
          <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 20 }} onClick={handleCopy}>
            <I.Share size={16}/> {t("common.share")}
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .modal > div { grid-template-columns: 1fr !important; } .modal > div > div:first-child { border-radius: 22px 22px 0 0 !important; padding: 32px !important; } }`}</style>
    </Modal>
  );
};

const AddCVModal = ({ open, onClose, onCreate, session }) => {
  const { t } = useT();
  const [f, setF] = useState({ name: "", role: { id: null, nom: "" }, sector: { id: null, nom: "" }, file: null, audioBlob: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [postes, setPostes] = useState([]);
  const [secteurs, setSecteurs] = useState([]);

  useEffect(() => {
    if (open) {
      setF({ name: "", role: { id: null, nom: "" }, sector: { id: null, nom: "" }, file: null, audioBlob: null });
      setError("");
      if (session) {
        api.getPostes(session.user.id).then(setPostes).catch(() => {});
        api.getSecteurs(session.user.id).then(setSecteurs).catch(() => {});
      }
    }
  }, [open]);

  const handleCreatePoste = (nom) =>
    api.getOrCreatePoste(session.user.id, nom).then((id) => {
      const item = { id, nom };
      setPostes((prev) => [...prev, item]);
      return item;
    });

  const handleCreateSecteur = (nom) =>
    api.getOrCreateSecteur(session.user.id, nom).then((id) => {
      const item = { id, nom };
      setSecteurs((prev) => [...prev, item]);
      return item;
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) { setError("Le nom du CV est requis."); return; }
    if (!session) { setError("Vous devez être connecté."); return; }
    setSaving(true);
    setError("");

    const userId = session.user.id;

    const resolvePoste = f.role.id
      ? Promise.resolve(f.role.id)
      : f.role.nom.trim() ? api.getOrCreatePoste(userId, f.role.nom) : Promise.resolve(null);

    const resolveSecteur = f.sector.id
      ? Promise.resolve(f.sector.id)
      : f.sector.nom.trim() ? api.getOrCreateSecteur(userId, f.sector.nom) : Promise.resolve(null);

    Promise.all([resolvePoste, resolveSecteur])
      .then(([posteId, secteurId]) => api.createCv(userId, { nom_cv: f.name, poste_id: posteId, secteur_id: secteurId }))
      .then((newCv) => {
        const uploads = [];
        if (f.file) uploads.push(api.uploadCvFile(userId, newCv.dbId, f.file).then((url) => { newCv.cv_url = url; newCv.hasFile = true; }));
        if (f.audioBlob) uploads.push(api.uploadAudio(userId, newCv.dbId, f.audioBlob).then((url) => { newCv.audio_url = url; newCv.audio = { url }; }));
        return Promise.all(uploads).then(() => newCv);
      })
      .then((newCv) => { setSaving(false); onCreate(newCv); })
      .catch((err) => { setSaving(false); setError(err.message || "Une erreur est survenue lors de la création du CV."); });
  };

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div style={{ padding: 40 }}>
        <div className="eyebrow">{t("cvs.modal.add.eyebrow")}</div>
        <h2 className="display" style={{ fontSize: 32, margin: "8px 0 6px", fontWeight: 500 }}>{t("cvs.modal.add.title")}</h2>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>{t("cvs.modal.add.sub")}</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label={t("common.cvName")}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="ex. CV Hôtellerie" required/></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ComboboxField
              label={t("common.role")}
              value={f.role}
              onChange={(item) => setF({ ...f, role: item })}
              items={postes}
              onCreate={handleCreatePoste}
              placeholder="Réceptionniste"
            />
            <ComboboxField
              label={t("common.sector")}
              value={f.sector}
              onChange={(item) => setF({ ...f, sector: item })}
              items={secteurs}
              onCreate={handleCreateSecteur}
              placeholder="Hôtellerie"
            />
          </div>
          <Field label={t("cvs.modal.add.cvFile")}>
            <label className="card-empty" style={{ padding: 18, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", justifyContent: "center" }}>
              <I.Upload size={18} stroke="var(--muted)"/>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{f.file?.name || t("cvs.modal.add.cvHint")}</span>
              <input type="file" accept="application/pdf" hidden onChange={(e) => setF({ ...f, file: e.target.files[0] || null })}/>
            </label>
          </Field>
          <Field label={t("cvs.modal.add.audio")}>
            <AudioRecorder
              onBlob={(blob) => setF((prev) => ({ ...prev, audioBlob: blob }))}
              onRemove={() => setF((prev) => ({ ...prev, audioBlob: null }))}
            />
          </Field>
          {error && (
            <div style={{ color: "var(--red, #dc2626)", fontSize: 13, padding: "8px 12px", background: "var(--red-soft, #fef2f2)", borderRadius: 8 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn btn--secondary" onClick={onClose} style={{ flex: 1 }} disabled={saving}>{t("common.cancel")}</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? "Création…" : t("cvs.modal.add.submit")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const MesCV = ({ cvs, setCvs, session, navigate, toast }) => {
  const { t } = useT();
  const [presentCv, setPresentCv] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = (cv) => {
    if (!confirm(t("cvs.deleteConfirm", { name: cv.name }))) return;
    setDeleting(cv.id);
    api.deleteCv(cv.dbId)
      .then(() => {
        setCvs(cvs.filter((c) => c.id !== cv.id));
        toast(t("cvs.deleted"));
        setDeleting(null);
      })
      .catch((err) => {
        setDeleting(null);
        toast("Erreur : " + (err.message || "suppression échouée"));
      });
  };

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
            onPreview={() => navigate(`/cv/${cv.short_code || cv.id}`)}
            onDelete={() => handleDelete(cv)}
          />
        ))}
        <EmptyCVCard onClick={() => setAddOpen(true)}/>
      </div>
      <PresentModal
        cv={presentCv}
        open={!!presentCv}
        onClose={() => setPresentCv(null)}
        onCopy={() => { toast(t("common.copied")); }}
      />
      <AddCVModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        session={session}
        onCreate={(newCv) => {
          setCvs([...cvs, newCv]);
          setAddOpen(false);
          toast(t("cvs.created"));
        }}
      />
    </div>
  );
};

window.MesCV = MesCV;
