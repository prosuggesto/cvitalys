// Mes CV page + Présenter modal + Ajouter modal — connecté à Supabase

const CVCard = ({ cv, onPresent, onCustomize, onPreview, onDelete, onDownloadQR }) => {
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
    <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 18px" }}>
      {cv.cv_url
        ? <ImagePreview url={cv.cv_url} width={300} float3d={true}/>
        : <CVPreviewVisual cv={cv} scale={1} float3d={true}/>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
      <button className="btn btn--primary" onClick={onPresent}>
        <I.QR size={16}/> {t("cvs.present")}
      </button>
      <button className="btn btn--secondary" onClick={onDownloadQR} title="Télécharger QR" style={{ padding: "0 16px" }}>
        <I.Download size={16}/>
      </button>
    </div>
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

const PresentModal = ({ cv, open, onClose, onCopy, qrSrc }) => {
  const { t } = useT();
  if (!cv) return null;
  const base = window.APP_URL || (window.location.origin + window.location.pathname);
  const publicUrl = cv.short_code ? `${base}#/cv/${cv.short_code}` : null;

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
          {cv.cv_url ? <ImagePreview url={cv.cv_url} width={300} float3d={true}/> : <CVPreviewVisual cv={cv} scale={1.05}/>}
        </div>
        <div style={{ padding: "56px 48px 48px" }}>
          <div className="eyebrow">{t("cvs.modal.present.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 500, margin: "10px 0 14px", fontStyle: "italic" }}>{cv.name}</h2>
          <p className="muted" style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.55 }}>
            {t("cvs.modal.present.body")}
          </p>
          <div style={{ padding: 18, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, display: "flex", justifyContent: "center" }}>
            <QRBlock size={180} url={publicUrl} cachedSrc={qrSrc}/>
          </div>
          <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 20 }} onClick={handleCopy}>
            <I.Share size={16}/> {t("common.share")}
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .modal > div { grid-template-columns: 1fr !important; } .modal > div > div:first-child { border-radius: 22px 22px 0 0 !important; padding: 32px !important; } }`}</style>
    </Modal>
  );
};

const QR_PALETTES = [
  { key: "classic",  label: "Classique",   dark: "#1B1814", light: "#FFFFFF", preview: ["#1B1814", "#FFFFFF"] },
  { key: "gold",     label: "Doré",        dark: "#B69768", light: "#1B1814", preview: ["#B69768", "#1B1814"] },
  { key: "red",      label: "Rouge",       dark: "#DC2626", light: "#FFFFFF", preview: ["#DC2626", "#FFFFFF"] },
  { key: "blue",     label: "Bleu",        dark: "#1D4ED8", light: "#FFFFFF", preview: ["#1D4ED8", "#FFFFFF"] },
  { key: "green",    label: "Vert",        dark: "#15803D", light: "#FFFFFF", preview: ["#15803D", "#FFFFFF"] },
];

// Validation stricte du short_code : alphanumeric uniquement, 4-32 chars
// → empêche toute injection dans l'URL (caractères de contrôle, fragments, etc.)
const SHORT_CODE_RE = /^[A-Za-z0-9]{4,32}$/;

// Sanitisation du nom pour usage dans un nom de fichier :
// - retire caractères Unicode "non-fichier" : /, \, :, *, ?, ", <, >, |, contrôles, ..
// - limite à 40 chars
// - fallback "cv" si vide après nettoyage
const sanitizeFilename = (raw) => {
  const cleaned = String(raw || "")
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "")   // caractères interdits FS + contrôles
    .replace(/\.{2,}/g, "")                   // empêche path traversal
    .replace(/\s+/g, "_")
    .replace(/^[._]+|[._]+$/g, "")            // pas de leading/trailing . ou _
    .slice(0, 40)
    .trim();
  return cleaned || "cv";
};

const QRDownloadModal = ({ cv, open, onClose, onError }) => {
  const { t } = useT();
  const [selected, setSelected] = useState("classic");
  const [downloading, setDownloading] = useState(false);

  if (!cv) return null;

  // Validation stricte du short_code avant construction d'URL
  const shortCode = cv.short_code && SHORT_CODE_RE.test(cv.short_code) ? cv.short_code : null;
  const base = window.APP_URL || (window.location.origin + window.location.pathname);
  // encodeURIComponent en bonus (même si shortCode est déjà validé alphanumeric)
  const url = shortCode ? `${base}#/cv/${encodeURIComponent(shortCode)}` : null;

  const triggerBlobDownload = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = blobUrl;
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try { document.body.removeChild(link); } catch (_) {}
      URL.revokeObjectURL(blobUrl);
    }, 200);
  };

  const reportError = (userMsg) => {
    // Affiche un message générique à l'utilisateur, sans révéler de détails techniques
    if (typeof onError === "function") onError(userMsg);
    else alert(userMsg);
  };

  const handleDownload = async () => {
    if (!url) { reportError("Lien du CV indisponible."); return; }
    // Garde-fou DoS : URL trop longue pourrait faire planter QRCode
    if (url.length > 512) { reportError("Lien du CV invalide."); return; }
    if (!window.QRCode) { reportError("Composant indisponible. Veuillez recharger la page."); return; }

    const palette = QR_PALETTES.find((p) => p.key === selected) || QR_PALETTES[0];
    const safeName = sanitizeFilename(cv.name);
    const filename = `QR_CVitalis_${safeName}.png`;
    setDownloading(true);

    try {
      // 1) Génère QR en SVG vectoriel (qualité 4K garantie quel que soit le scale)
      const svgString = await new Promise((resolve, reject) => {
        QRCode.toString(url, {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "H",
          color: { dark: palette.dark, light: "#ffffff" },
        }, (err, svg) => err ? reject(err) : resolve(svg));
      });

      // 2) Charge le SVG dans une <img> (sandboxé : pas d'exécution de script SVG)
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      let img;
      try {
        img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = () => reject(new Error("SVG load failed"));
          i.src = svgUrl;
        });
      } finally {
        URL.revokeObjectURL(svgUrl); // libère mémoire même en cas d'erreur
      }

      // 3) Dessine sur un canvas 2048×2048 (4K) — fond transparent
      const SIZE = 2048;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      // 4) Élimine tout pixel blanc résiduel → transparence parfaite
      const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 240 && d[i+1] > 240 && d[i+2] > 240) d[i+3] = 0;
      }
      ctx.putImageData(imgData, 0, 0);

      // 5) Convertit en Blob PNG (préserve l'alpha)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob returned null")), "image/png");
      });

      // 6) Trigger download
      triggerBlobDownload(blob, filename);
    } catch (e) {
      // Log technique en console (dev only), message générique à l'utilisateur
      if (typeof console !== "undefined" && console.error) console.error("[QR] download failed");
      reportError("Téléchargement impossible. Veuillez réessayer.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} width={440}>
      <div style={{ padding: 40 }}>
        <div className="eyebrow">QR Code</div>
        <h2 className="display" style={{ fontSize: 28, margin: "8px 0 6px", fontWeight: 500 }}>Télécharger le QR</h2>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>Choisissez un style de couleur pour votre QR code.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 28 }}>
          {QR_PALETTES.map((pal) => (
            <button
              key={pal.key}
              onClick={() => setSelected(pal.key)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "12px 6px", borderRadius: 12, cursor: "pointer", border: "none",
                background: selected === pal.key ? "var(--surface-2)" : "transparent",
                outline: selected === pal.key ? "2px solid var(--ink)" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border-soft)" }}>
                <div style={{ width: "100%", height: "50%", background: pal.preview[0] }}/>
                <div style={{ width: "100%", height: "50%", background: pal.preview[1] }}/>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-2)", textAlign: "center", lineHeight: 1.2 }}>{pal.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--secondary" onClick={onClose} style={{ flex: 1 }} disabled={downloading}>Annuler</button>
          <button className="btn btn--primary" onClick={handleDownload} style={{ flex: 2 }} disabled={downloading || !url}>
            <I.Download size={15}/> {downloading ? "Génération…" : "Télécharger"}
          </button>
        </div>
      </div>
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
        const final = { ...newCv };
        const uploads = [];
        if (f.file) uploads.push(
          imageToWebP(f.file)
            .then((webp) => api.uploadCvFile(userId, final.dbId, webp))
            .then((url) => { final.cv_url = url; final.hasFile = true; })
        );
        if (f.audioBlob) uploads.push(
          api.uploadAudio(userId, final.dbId, f.audioBlob)
            .then((url) => { final.audio_url = url; final.audio = { url }; })
        );
        return Promise.all(uploads).then(() => final);
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
          <Field label={t("cvs.modal.add.cvFile")} hint="JPEG — une seule page recto">
            <label className="card-empty" style={{ padding: 18, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", justifyContent: "center" }}>
              <I.Upload size={18} stroke="var(--muted)"/>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{f.file?.name || "Importer mon CV (JPEG)"}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => setF({ ...f, file: e.target.files[0] || null })}/>
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
  const [downloadCv, setDownloadCv] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Pré-générer les QR codes en arrière-plan dès que les CVs sont disponibles
  // → affichage instantané quand l'utilisateur ouvre le modal "Présenter"
  const qrCache = useRef({});
  useEffect(() => {
    if (!cvs.length) return;
    const base = window.APP_URL || (window.location.origin + window.location.pathname);
    const pregenerate = () => {
      cvs.forEach((cv) => {
        if (!cv.short_code || qrCache.current[cv.id]) return;
        const url = `${base}#/cv/${cv.short_code}`;
        generateQR(url, 180).then((dataUrl) => { qrCache.current[cv.id] = dataUrl; });
      });
    };
    // Attendre que QRCode CDN soit disponible (il l'est normalement déjà)
    window.QRCode ? pregenerate() : setTimeout(pregenerate, 500);
  }, [cvs]);

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
            onDownloadQR={() => setDownloadCv(cv)}
          />
        ))}
        <EmptyCVCard onClick={() => setAddOpen(true)}/>
      </div>
      <PresentModal
        cv={presentCv}
        qrSrc={presentCv ? qrCache.current[presentCv.id] : null}
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
          // Redirige directement vers Personnalisation avec CV + audio déjà chargés
          navigate(`/app/customize/${newCv.id}`);
        }}
      />
      <QRDownloadModal
        cv={downloadCv}
        open={!!downloadCv}
        onClose={() => setDownloadCv(null)}
        onError={(msg) => toast(msg)}
      />
    </div>
  );
};

window.MesCV = MesCV;
