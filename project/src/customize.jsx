// Personnalisation: select CV + edit CV — connecté à Supabase

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

const CustomizeEdit = ({ cv, session, profile, onSave, onPreview, toast, navigate }) => {
  const { t } = useT();
  const [local, setLocal] = useState(cv);
  const [saving, setSaving] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [postes, setPostes] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [roleItem, setRoleItem] = useState({ id: cv?.poste_id || null, nom: cv?.role || '' });
  const [secteurItem, setSecteurItem] = useState({ id: cv?.secteur_id || null, nom: cv?.sector || '' });
  const fileInputRef = useRef();

  useEffect(() => {
    setLocal(cv);
    setAudioBlob(null);
    setPendingFile(null);
    setPdfPreviewUrl(null);
    setRoleItem({ id: cv?.poste_id || null, nom: cv?.role || '' });
    setSecteurItem({ id: cv?.secteur_id || null, nom: cv?.sector || '' });
    if (session) {
      api.getPostes(session.user.id).then(setPostes).catch(() => {});
      api.getSecteurs(session.user.id).then(setSecteurs).catch(() => {});
    }
  }, [cv?.id]);

  // Créer une URL objet pour prévisualiser le PDF sélectionné localement
  useEffect(() => {
    if (!pendingFile) { setPdfPreviewUrl(null); return; }
    const url = URL.createObjectURL(pendingFile);
    setPdfPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  if (!cv) return null;

  const update = (patch) => setLocal((l) => ({ ...l, ...patch }));
  const updateContact = (patch) => setLocal((l) => ({ ...l, contact: { ...l.contact, ...patch } }));
  const updateButtons = (patch) => setLocal((l) => ({ ...l, buttons: { ...l.buttons, ...patch } }));

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

  const handleSave = () => {
    return new Promise((resolve, reject) => {
      if (!session) { toast("Vous devez être connecté."); reject(new Error("no session")); return; }
      setSaving(true);

      const userId = session.user.id;
      const cvId = local.dbId;

      // Email et téléphone viennent du profil (pas de saisie manuelle)
      const dbUpdates = {
        nom_cv: local.name,
        email_contact: profile?.email || local.contact.email || null,
        telephone_contact: profile?.telephone || local.contact.phone || null,
        numero_whatsapp: profile?.telephone || local.contact.whatsapp || null,
        linkedin_url: local.contact.linkedin || null,
        instagram_url: local.contact.instagram || null,
        site_web_url: local.contact.website || null,
        afficher_bouton_echange: local.buttons.exchange,
        afficher_bouton_retour: local.buttons.feedback,
        afficher_bouton_email: local.buttons.email,
        afficher_bouton_whatsapp: local.buttons.whatsapp,
        afficher_bouton_linkedin: local.buttons.linkedin,
        afficher_bouton_instagram: local.buttons.instagram,
        afficher_bouton_site_web: local.buttons.website,
      };

      // Résoudre poste / secteur
      const resolvePoste = roleItem.id
        ? Promise.resolve(roleItem.id)
        : roleItem.nom.trim() ? api.getOrCreatePoste(userId, roleItem.nom) : Promise.resolve(null);
      const resolveSecteur = secteurItem.id
        ? Promise.resolve(secteurItem.id)
        : secteurItem.nom.trim() ? api.getOrCreateSecteur(userId, secteurItem.nom) : Promise.resolve(null);

      Promise.all([resolvePoste, resolveSecteur])
        .then(([posteId, secteurId]) => {
          dbUpdates.poste_id = posteId;
          dbUpdates.secteur_id = secteurId;
          return api.updateCv(cvId, dbUpdates);
        })
        .then(() => {
          const uploads = [];
          if (pendingFile) {
            uploads.push(
              api.uploadCvFile(userId, cvId, pendingFile).then((url) => {
                update({ cv_url: url, hasFile: true });
              })
            );
          }
          if (audioBlob) {
            uploads.push(
              api.uploadAudio(userId, cvId, audioBlob).then((url) => {
                update({ audio_url: url, audio: { url } });
              })
            );
          }
          return Promise.all(uploads);
        })
        .then(() => {
          setSaving(false);
          onSave({ ...local, role: roleItem.nom, sector: secteurItem.nom });
          toast(t("custom.saved"));
          resolve();
        })
        .catch((err) => {
          setSaving(false);
          toast("Erreur : " + (err.message || "sauvegarde échouée"));
          reject(err);
        });
    });
  };

  // URL du PDF à afficher : fichier en attente d'upload > URL déjà stockée
  const displayPdfUrl = pdfPreviewUrl || local.cv_url || null;

  return (
    <div className="page" style={{ maxWidth: 1320 }}>
      <PageHeader
        eyebrow={t("custom.select.eyebrow")}
        title={local.name}
        subtitle={t("custom.edit.sub")}
        action={
        <div className="row gap-8">
            <button className="btn btn--secondary" onClick={() => navigate("/app/customize")}>← {t("common.back")}</button>
            <button className="btn btn--secondary" disabled={saving} onClick={() => handleSave().then(() => onPreview(local)).catch(() => {})}>
              <I.Eye size={14} /> {t("common.preview")}
            </button>
            <button className="btn btn--primary" onClick={() => handleSave()} disabled={saving}>
              <I.Check size={14} /> {saving ? "Sauvegarde…" : t("common.save")}
            </button>
          </div>
        } />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)", gap: 28, alignItems: "flex-start" }}>
        {/* Colonne gauche : PDF + Audio */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 92 }}>

          {/* Section CV */}
          <div className="card" style={{ padding: 32 }}>
            <div className="between" style={{ marginBottom: 18 }}>
              <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("custom.cvSection")}</h3>
              <span className="badge badge--neutral">{local.hasFile ? t("custom.cvImported") : t("custom.cvNone")}</span>
            </div>

            {displayPdfUrl ? (
              <React.Fragment>
                {/* Iframe PDF réel */}
                <div style={{ width: '100%', height: 480, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 16 }}>
                  <iframe src={displayPdfUrl} width="100%" height="100%" style={{ border: 'none', display: 'block' }} title="Aperçu CV" />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button className="btn btn--secondary btn--sm" onClick={() => fileInputRef.current.click()}>
                    <I.Upload size={14} /> {t("common.replace")}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => window.open(displayPdfUrl, '_blank')}>
                    <I.Eye size={14} /> {t("common.fullscreen")}
                  </button>
                  <input type="file" accept="application/pdf" ref={fileInputRef} hidden onChange={(e) => {
                    if (e.target.files[0]) { setPendingFile(e.target.files[0]); update({ hasFile: true }); toast(t("custom.cvImported")); }
                  }} />
                </div>
              </React.Fragment>
            ) : (
              <div className="card-empty" style={{ padding: 56, textAlign: "center", aspectRatio: "1/1.414", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <I.Cv size={36} stroke="var(--subtle)" />
                <div className="muted">{t("custom.cvNoneText")}</div>
                <button className="btn btn--primary btn--sm" onClick={() => fileInputRef.current.click()}>
                  <I.Upload size={14} /> {t("custom.cvImportBtn")}
                </button>
                <input type="file" accept="application/pdf" ref={fileInputRef} hidden onChange={(e) => {
                  if (e.target.files[0]) { setPendingFile(e.target.files[0]); update({ hasFile: true }); toast(t("custom.cvImported")); }
                }} />
              </div>
            )}
          </div>

          {/* Section Audio */}
          <div className="card" style={{ padding: 24 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("custom.audioSection")}</h3>
              <I.Mic size={18} stroke="var(--muted)" />
            </div>
            <AudioRecorder
              existingUrl={local.audio_url || null}
              onBlob={(blob) => setAudioBlob(blob)}
              onRemove={() => { setAudioBlob(null); update({ audio: null, audio_url: null }); }}
            />
          </div>
        </div>

        {/* Colonne droite : Infos + Boutons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Infos générales */}
          <div className="card" style={{ padding: 28 }}>
            <h3 className="display" style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 500 }}>{t("custom.infoSection")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label={t("common.cvName")}>
                <input className="input" value={local.name} onChange={(e) => update({ name: e.target.value })} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <ComboboxField
                  label={t("common.role")}
                  value={roleItem}
                  onChange={setRoleItem}
                  items={postes}
                  onCreate={handleCreatePoste}
                  placeholder="Réceptionniste"
                />
                <ComboboxField
                  label={t("common.sector")}
                  value={secteurItem}
                  onChange={setSecteurItem}
                  items={secteurs}
                  onCreate={handleCreateSecteur}
                  placeholder="Hôtellerie"
                />
              </div>
              <Field label={t("custom.accent")}>
                <select className="select" value={local.accent} onChange={(e) => update({ accent: e.target.value })}>
                  <option value="warm">{t("custom.accent.warm")}</option>
                  <option value="sage">{t("custom.accent.sage")}</option>
                  <option value="ink">{t("custom.accent.ink")}</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Boutons visibles */}
          <div className="card" style={{ padding: 28 }}>
            <h3 className="display" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>{t("custom.buttonsSection")}</h3>
            <p className="muted" style={{ margin: "0 0 10px", fontSize: 13 }}>{t("custom.buttonsSub")}</p>

            <ButtonToggleRow label={t("custom.btn.exchange")} icon="ThumbsUp" on={local.buttons.exchange} onChange={(v) => updateButtons({ exchange: v })} />
            <ButtonToggleRow label={t("custom.btn.feedback")} icon="Feedback" on={local.buttons.feedback} onChange={(v) => updateButtons({ feedback: v })} />

            {/* Email : depuis le profil, pas de saisie */}
            <ButtonToggleRow label="Email" brand="gmail" on={local.buttons.email} onChange={(v) => updateButtons({ email: v })}>
              <div style={{ fontSize: 12, color: "var(--muted)", padding: "2px 0" }}>
                Depuis votre profil : <strong>{profile?.email || local.contact.email || '—'}</strong>
              </div>
            </ButtonToggleRow>

            {/* WhatsApp : depuis le profil, pas de saisie */}
            <ButtonToggleRow label="WhatsApp" brand="whatsapp" on={local.buttons.whatsapp} onChange={(v) => updateButtons({ whatsapp: v })}>
              <div style={{ fontSize: 12, color: "var(--muted)", padding: "2px 0" }}>
                Depuis votre profil : <strong>{profile?.telephone || local.contact.whatsapp || '—'}</strong>
              </div>
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

          {/* Boîte prévisualisation / sauvegarde */}
          <div className="card card--soft" style={{ padding: 22, display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500 }}>{t("custom.previewBox.title")}</div>
              <div className="muted" style={{ fontSize: 13 }}>{t("custom.previewBox.sub")}</div>
            </div>
            <div className="row gap-8">
              <button className="btn btn--secondary" disabled={saving} onClick={() => handleSave().then(() => onPreview(local)).catch(() => {})}>
                <I.Eye size={14} /> {t("common.preview")}
              </button>
              <button className="btn btn--primary" onClick={() => handleSave()} disabled={saving}>
                {saving ? "Sauvegarde…" : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 1000px) { .page > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; } .page > div > div:first-child { position: static !important; } }`}</style>
    </div>);
};

Object.assign(window, { CustomizeSelect, CustomizeEdit });
