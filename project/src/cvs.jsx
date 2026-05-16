// Mes CV page + Présenter modal + Ajouter modal — connecté à Supabase

const CVCard = ({ cv, onPresent, onCustomize, onPreview, onDelete, onDownloadQR }) => {
  const { t } = useT();
  const isMobile = useIsMobile();
  // Dimensions adaptées : sur mobile on rétrécit le bloc entier (padding, image, fonts)
  const padding = isMobile ? 16 : 22;
  const imgWidth = isMobile ? 210 : 300;
  const titleSize = isMobile ? 20 : 24;
  const iconSize = isMobile ? 14 : 16;
  return (
  <div className="card" style={{ padding, display: "flex", flexDirection: "column", gap: isMobile ? 10 : 14, position: "relative", maxWidth: isMobile ? 340 : "none", margin: isMobile ? "0 auto" : undefined, width: isMobile ? "100%" : undefined }}>
    <div className="between" style={{ alignItems: "flex-start", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-12" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <span className="display" style={{ fontSize: titleSize, fontStyle: "italic", fontWeight: 400 }}>{cv.name}</span>
          <span className="badge">{cv.role}</span>
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{cv.sector}</div>
      </div>
      <div className="row gap-8">
        <button className="icon-btn" onClick={onCustomize} title={t("nav.customize")}><I.Brush size={iconSize}/></button>
        <button className="icon-btn" onClick={onPreview} title={t("common.preview")}><I.Grid size={iconSize}/></button>
        <button className="icon-btn icon-btn--danger" onClick={onDelete} title={t("common.delete")} style={{ color: "var(--red)" }}><I.X size={iconSize}/></button>
      </div>
    </div>
    {cv.cv_url ? (
      <div style={{ display: "flex", justifyContent: "center", padding: isMobile ? "8px 0 14px" : "12px 0 18px" }}>
        <ImagePreview url={cv.cv_url} width={imgWidth} float3d={true}/>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0", border: "1px dashed var(--border-strong)", borderRadius: 12, color: "var(--muted)" }}>
        <I.Cv size={28} stroke="var(--subtle)"/>
        <div style={{ fontSize: 13 }}>Aucun CV importé</div>
      </div>
    )}
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
      <button className="btn btn--primary" onClick={onPresent}>
        <I.QR size={iconSize}/> {t("cvs.present")}
      </button>
      <button className="btn btn--secondary" onClick={onDownloadQR} title="Télécharger QR" style={{ padding: "0 14px" }}>
        <I.Download size={iconSize}/>
      </button>
    </div>
  </div>
  );
};

const EmptyCVCard = ({ onClick }) => {
  const { t } = useT();
  const isMobile = useIsMobile();
  return (
  <div className="card-empty" onClick={onClick} style={{
    padding: isMobile ? 16 : 30,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    textAlign: "center", cursor: "pointer",
    minHeight: isMobile ? 380 : 540,
    gap: 14,
    maxWidth: isMobile ? 340 : "none",
    margin: isMobile ? "0 auto" : undefined,
    width: isMobile ? "100%" : undefined
  }}>
    <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px dashed var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
      <I.Plus size={22}/>
    </div>
    <div>
      <div className="display" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 500 }}>{t("cvs.addTitle")}</div>
      <p className="muted" style={{ margin: "6px 24px 0", fontSize: 14, maxWidth: 280 }}>{t("cvs.addSub")}</p>
    </div>
  </div>
  );
};

const PresentModal = ({ cv, open, onClose, onCopy, qrSrc }) => {
  const { t } = useT();
  const isMobile = useIsMobile();
  if (!cv) return null;
  const base = window.APP_URL || (window.location.origin + window.location.pathname);
  const publicUrl = cv.short_code ? `${base}#/cv/${cv.short_code}` : null;

  const handleCopy = () => {
    if (publicUrl) {
      navigator.clipboard && navigator.clipboard.writeText(publicUrl).catch(() => {});
    }
    onCopy && onCopy();
  };

  // QR + carré blanc plus compacts sur mobile pour ne pas dominer l'écran
  const qrSize = isMobile ? 150 : 180;
  const qrPadding = isMobile ? 10 : 18;

  if (!open) return null;

  const content = (
    <>
      {cv.cv_url && (
        <div style={{ padding: isMobile ? "60px 20px 24px" : 48, background: "var(--bg-soft)", borderRadius: isMobile ? 0 : "22px 0 0 22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImagePreview url={cv.cv_url} width={isMobile ? 220 : 300} float3d={true}/>
        </div>
      )}
      <div style={{ padding: isMobile ? "28px 24px 40px" : "56px 48px 48px" }}>
        <div className="eyebrow">{t("cvs.modal.present.eyebrow")}</div>
        <h2 className="display" style={{ fontSize: isMobile ? 28 : 36, fontWeight: 500, margin: "10px 0 14px", fontStyle: "italic" }}>{cv.name}</h2>
        <p className="muted" style={{ marginBottom: 20, fontSize: 14, lineHeight: 1.55 }}>
          {t("cvs.modal.present.body")}
        </p>
        <div style={{ padding: qrPadding, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, display: "flex", justifyContent: "center", width: "fit-content", margin: "0 auto" }}>
          <QRBlock size={qrSize} url={publicUrl} cachedSrc={qrSrc}/>
        </div>
        <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 18 }} onClick={handleCopy}>
          <I.Share size={16}/> {t("common.share")}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <FullPage open={open} onClose={onClose}>
        <div style={{ display: "block", minHeight: "100vh" }}>{content}</div>
      </FullPage>
    );
  }
  return (
    <Modal open={open} onClose={onClose} width={cv.cv_url ? 920 : 560}>
      <div style={{ display: "grid", gridTemplateColumns: cv.cv_url ? "1fr 1fr" : "1fr", gap: 0 }}>{content}</div>
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
    if (url.length > 512) { reportError("Lien du CV invalide."); return; }

    const palette = QR_PALETTES.find((p) => p.key === selected) || QR_PALETTES[0];
    const filename = `QR_CVitalis_${sanitizeFilename(cv.name)}.png`;
    setDownloading(true);

    try {
      // Assure que la lib locale est chargée
      const ok = await ensureQRCode(5000);
      if (!ok || !window.QRCode) {
        reportError("Composant indisponible. Rechargez la page.");
        return;
      }

      // 1) URL → QR sur canvas 1024×1024 (fond blanc temporaire)
      const canvas = document.createElement("canvas");
      await new Promise((resolve, reject) => {
        QRCode.toCanvas(canvas, url, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: "H",
          color: { dark: palette.dark, light: "#ffffff" },
        }, (err) => err ? reject(err) : resolve());
      });

      // 2) Rend les pixels blancs transparents → PNG transparent
      const ctx = canvas.getContext("2d");
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 240 && d[i+1] > 240 && d[i+2] > 240) d[i+3] = 0;
      }
      ctx.putImageData(imgData, 0, 0);

      // 3) Canvas → Blob PNG → download
      canvas.toBlob((blob) => {
        if (!blob) { reportError("Échec de la génération."); return; }
        triggerBlobDownload(blob, filename);
      }, "image/png");
    } catch (e) {
      if (window.logErr) window.logErr("[QR] download failed");
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
  const isMobile = useIsMobile();
  const [f, setF] = useState({ name: "", role: { id: null, nom: "" }, sector: { id: null, nom: "" }, file: null, audioBlob: null, langue: "fr" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [postes, setPostes] = useState([]);
  const [secteurs, setSecteurs] = useState([]);

  useEffect(() => {
    if (open) {
      setF({ name: "", role: { id: null, nom: "" }, sector: { id: null, nom: "" }, file: null, audioBlob: null, langue: "fr" });
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
      .then(([posteId, secteurId]) => api.createCv(userId, { nom_cv: f.name, poste_id: posteId, secteur_id: secteurId, langue: f.langue }))
      .then((newCv) => {
        const final = { ...newCv };
        // Upload image (BLOQUANT — partie structurante du CV).
        const fileUpload = f.file
          ? imageToWebP(f.file)
              .then((webp) => api.uploadCvFile(userId, final.dbId, webp))
              .then((url) => { final.cv_url = url; final.hasFile = true; })
          : Promise.resolve();
        return fileUpload.then(() => {
          // Upload audio FIRE-AND-FORGET — on ne l'attend PAS avant de naviguer.
          // Sur iOS Safari l'upload audio peut hang/être lent et bloquer la
          // redirection. L'audio termine en arrière-plan ; si fail, l'user
          // pourra ré-enregistrer depuis la page de personnalisation.
          if (f.audioBlob) {
            api.uploadAudio(userId, final.dbId, f.audioBlob)
              .catch((e) => {
                if (window.logErr) window.logErr("[CV create] audio upload failed:", e && e.message);
              });
          }
          return final;
        });
      })
      .then((newCv) => { setSaving(false); onCreate(newCv); })
      .catch((err) => { setSaving(false); setError(err.message || "Une erreur est survenue lors de la création du CV."); });
  };

  if (!open) return null;

  const formContent = (
    <div style={{ padding: isMobile ? "60px 20px 40px" : 40, maxWidth: 560, margin: "0 auto" }}>
        <div className="eyebrow">{t("cvs.modal.add.eyebrow")}</div>
        <h2 className="display" style={{ fontSize: isMobile ? 26 : 32, margin: "8px 0 6px", fontWeight: 500 }}>{t("cvs.modal.add.title")}</h2>
        <p className="muted" style={{ marginBottom: 20, fontSize: 14 }}>{t("cvs.modal.add.sub")}</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label={t("common.cvName")}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="ex. CV Hôtellerie" required/></Field>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
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
          <Field label="Langue de la page publique" hint="Langue affichée aux recruteurs qui scannent ce CV">
            <select
              className="select"
              value={f.langue}
              onChange={(e) => setF({ ...f, langue: e.target.value })}
            >
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </Field>
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
  );

  if (isMobile) {
    return <FullPage open={open} onClose={onClose}>{formContent}</FullPage>;
  }
  return <Modal open={open} onClose={onClose} width={560}>{formContent}</Modal>;
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
