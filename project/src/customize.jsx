// Personnalisation: select CV + edit CV — connecté à Supabase

const CustomizeSelectCard = ({ cv, onClick }) => {
  const { t } = useT();
  const isMobile = useIsMobile();
  return (
    <div className="card" onClick={onClick} style={{
      padding: isMobile ? 18 : 28,
      cursor: "pointer", display: "flex", flexDirection: "column",
      gap: isMobile ? 14 : 20,
      transition: "transform .2s, box-shadow .2s",
      maxWidth: isMobile ? 340 : "none",
      margin: isMobile ? "0 auto" : undefined,
      width: isMobile ? "100%" : undefined,
    }}
    onMouseEnter={(e) => {e.currentTarget.style.transform = "translateY(-2px)";e.currentTarget.style.boxShadow = "var(--shadow-lift)";}}
    onMouseLeave={(e) => {e.currentTarget.style.transform = "none";e.currentTarget.style.boxShadow = "var(--shadow-card)";}}>
    <div className="between" style={{ alignItems: "flex-start" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="display" style={{ fontSize: isMobile ? 20 : 24, fontStyle: "italic", fontWeight: 400 }}>{cv.name}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{cv.sector}</div>
      </div>
      <span className="badge">{cv.role}</span>
    </div>
    <div style={{ display: "flex", justifyContent: "center", padding: isMobile ? "6px 0 10px" : "8px 0 14px" }}>
      {cv.cv_url ? (
        <ImagePreview url={cv.cv_url} width={isMobile ? 200 : 260} float3d={true}/>
      ) : (
        <div style={{
          width: isMobile ? 200 : 260,
          aspectRatio: "1 / 1.414",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          border: "2px dashed var(--border-strong)",
          borderRadius: 12,
          color: "var(--muted)",
          background: "var(--surface-2)"
        }}>
          <I.Cv size={32} stroke="var(--subtle)"/>
          <div style={{ fontSize: 13 }}>Aucun CV importé</div>
        </div>
      )}
    </div>
    <div className="between" style={{ flexWrap: "wrap", gap: 8 }}>
      <span className="muted" style={{ fontSize: 13 }}>{t("custom.select.click")}</span>
      <span className="row gap-8" style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
        <I.Brush size={14} /> {t("custom.select.btn")} <I.Arrow size={14} />
      </span>
    </div>
  </div>);
};

const CustomizeSelect = ({ cvs, navigate }) => {
  const { t } = useT();
  const isMobile = useIsMobile();
  return (
    <div className="page">
    <PageHeader
        eyebrow={t("custom.select.eyebrow")}
        title={t("custom.select.title")}
        subtitle={t("custom.select.sub")} />
    <div className="grid" style={{
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, 360px)",
      justifyContent: isMobile ? undefined : "start",
      gap: isMobile ? 16 : 20
    }}>
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
  const isMobile = useIsMobile();
  const [local, setLocal] = useState(cv);
  const [saving, setSaving] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [postes, setPostes] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [roleItem, setRoleItem] = useState({ id: cv?.poste_id || null, nom: cv?.role || '' });
  const [secteurItem, setSecteurItem] = useState({ id: cv?.secteur_id || null, nom: cv?.sector || '' });
  const [viewerOpen, setViewerOpen] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    setLocal(cv);
    setAudioBlob(null);
    setPendingFile(null);
    setLocalPreviewUrl(null);
    setRoleItem({ id: cv?.poste_id || null, nom: cv?.role || '' });
    setSecteurItem({ id: cv?.secteur_id || null, nom: cv?.sector || '' });
    if (session) {
      api.getPostes(session.user.id).then(setPostes).catch(() => {});
      api.getSecteurs(session.user.id).then(setSecteurs).catch(() => {});
    }
  }, [cv?.id]);

  // Créer une URL objet pour prévisualiser l'image sélectionnée localement (avant upload)
  useEffect(() => {
    if (!pendingFile) { setLocalPreviewUrl(null); return; }
    const url = URL.createObjectURL(pendingFile);
    setLocalPreviewUrl(url);
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

      // Validation/normalisation des URLs au save (defense-in-depth, en plus du
      // filtre au render). Si l'utilisateur a tapé n'importe quoi, on stocke null
      // au lieu d'une URL dangereuse. Le toast prévient si une valeur a été ignorée.
      const linkedinClean = local.contact.linkedin
        ? safeDomainUrl(local.contact.linkedin, LINKEDIN_DOMAINS, "www.linkedin.com/in")
        : null;
      const instagramClean = local.contact.instagram
        ? safeDomainUrl(local.contact.instagram, INSTAGRAM_DOMAINS, "www.instagram.com")
        : null;
      const websiteClean = local.contact.website
        ? safeExternalUrl(local.contact.website)
        : null;

      // Notifier l'utilisateur si une URL a été rejetée (sans bloquer le save)
      const rejected = [];
      if (local.contact.linkedin && !linkedinClean) rejected.push("LinkedIn");
      if (local.contact.instagram && !instagramClean) rejected.push("Instagram");
      if (local.contact.website && !websiteClean) rejected.push("Site web");
      if (rejected.length > 0) {
        toast(`URL(s) ignorée(s) : ${rejected.join(", ")} (format invalide)`);
      }

      // Email/téléphone/WhatsApp lus depuis profils à l'affichage — pas stockés dans cvs
      const dbUpdates = {
        nom_cv: local.name,
        linkedin_url: linkedinClean,
        instagram_url: instagramClean,
        site_web_url: websiteClean,
        afficher_bouton_echange: local.buttons.exchange,
        afficher_bouton_retour: local.buttons.feedback,
        afficher_bouton_email: local.buttons.email,
        afficher_bouton_whatsapp: local.buttons.whatsapp,
        afficher_bouton_linkedin: local.buttons.linkedin,
        afficher_bouton_instagram: local.buttons.instagram,
        afficher_bouton_site_web: local.buttons.website,
        langue: local.langue === 'es' ? 'es' : 'fr',
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
              imageToWebP(pendingFile)
                .then((webp) => api.uploadCvFile(userId, cvId, webp))
                .then((url) => { update({ cv_url: url, hasFile: true }); })
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

  // URL de l'image à afficher : fichier en attente d'upload > URL déjà stockée
  const displayImageUrl = localPreviewUrl || local.cv_url || null;

  return (
    <div className="page" style={{ maxWidth: 1320 }}>
      <PageHeader
        eyebrow={t("custom.select.eyebrow")}
        title={local.name}
        subtitle={t("custom.edit.sub")}
        action={
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--secondary" onClick={() => navigate("/app/customize")}>← {t("common.back")}</button>
            <button className="btn btn--secondary" disabled={saving} onClick={() => handleSave().then(() => onPreview(local)).catch(() => {})}>
              <I.Eye size={14} /> {t("common.preview")}
            </button>
            <button className="btn btn--primary" onClick={() => handleSave()} disabled={saving}>
              <I.Check size={14} /> {saving ? "Sauvegarde…" : t("common.save")}
            </button>
          </div>
        } />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.05fr) minmax(0, 1fr)", gap: isMobile ? 16 : 28, alignItems: "flex-start" }}>
        {/* Colonne gauche : PDF + Audio. Pas de sticky — alignItems flex-start
            sur la grille suffit pour que CV/audio démarrent à la même hauteur
            que "Información del CV" à droite, et les deux colonnes scrollent
            normalement ensemble. */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 20 }}>

          {/* Section CV */}
          <div className="card" style={{ padding: isMobile ? 18 : 32 }}>
            <div className="between" style={{ marginBottom: 18 }}>
              <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("custom.cvSection")}</h3>
              <span className="badge badge--neutral">{local.hasFile ? t("custom.cvImported") : t("custom.cvNone")}</span>
            </div>

            {displayImageUrl ? (
              <React.Fragment>
                {/* Image CV avec effet 3D flottant */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <ImagePreview url={displayImageUrl} width={280} float3d/>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  <button className="btn btn--secondary btn--sm" onClick={() => fileInputRef.current.click()}>
                    <I.Upload size={14} /> {t("common.replace")}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setViewerOpen(true)}>
                    <I.Eye size={14} /> {t("common.fullscreen")}
                  </button>
                  <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} hidden onChange={(e) => {
                    if (e.target.files[0]) { setPendingFile(e.target.files[0]); update({ hasFile: true }); toast(t("custom.cvImported")); }
                  }} />
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                  JPEG — une seule page recto
                </div>
              </React.Fragment>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                <div className="card-empty" style={{
                  width: 280,
                  aspectRatio: "1 / 1.414",
                  padding: 20,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  background: "var(--surface-2)"
                }}>
                  <I.Cv size={36} stroke="var(--subtle)" />
                  <div className="muted" style={{ fontSize: 14 }}>{t("custom.cvNoneText")}</div>
                  <button className="btn btn--primary btn--sm" onClick={() => fileInputRef.current.click()}>
                    <I.Upload size={14} /> Importer mon CV (JPEG)
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    JPEG — une seule page recto
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} hidden onChange={(e) => {
                    if (e.target.files[0]) { setPendingFile(e.target.files[0]); update({ hasFile: true }); toast(t("custom.cvImported")); }
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Section Audio */}
          <div className="card" style={{ padding: isMobile ? 16 : 24 }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 20 }}>

          {/* Infos générales */}
          <div className="card" style={{ padding: isMobile ? 18 : 28 }}>
            <h3 className="display" style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 500 }}>{t("custom.infoSection")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label={t("common.cvName")}>
                <input className="input" value={local.name} onChange={(e) => update({ name: e.target.value })} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
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
              <Field label="Langue de la page publique" hint="Langue affichée aux recruteurs qui scannent ce CV">
                <select
                  className="select"
                  value={local.langue || 'fr'}
                  onChange={(e) => update({ langue: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Boutons visibles */}
          <div className="card" style={{ padding: isMobile ? 18 : 28 }}>
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
          <div className="card card--soft" style={{
            padding: isMobile ? 16 : 22,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 14,
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontWeight: 500 }}>{t("custom.previewBox.title")}</div>
              <div className="muted" style={{ fontSize: 13 }}>{t("custom.previewBox.sub")}</div>
            </div>
            <div className="row gap-8" style={{ flexShrink: 0 }}>
              <button className="btn btn--secondary" disabled={saving} onClick={() => handleSave().then(() => onPreview(local)).catch(() => {})} style={isMobile ? { flex: 1 } : undefined}>
                <I.Eye size={14} /> {t("common.preview")}
              </button>
              <button className="btn btn--primary" onClick={() => handleSave()} disabled={saving} style={isMobile ? { flex: 1 } : undefined}>
                {saving ? "Sauvegarde…" : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal "CV complet" — identique à la page publique (Voir le CV) */}
      <Modal open={viewerOpen} onClose={() => setViewerOpen(false)} width={1100}>
        <div style={{ padding: 30 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{local.name}</div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>{t("public.cvComplete")}</h2>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: 13 }}>
            <kbd style={{ padding: '2px 6px', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>Ctrl</kbd> + molette pour zoomer · cliquer-glisser pour déplacer · double-clic pour réinitialiser
          </p>
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            {displayImageUrl ? (
              <ZoomableImage src={displayImageUrl}/>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--muted)" }}>
                <I.Cv size={40} stroke="var(--subtle)"/>
                <div style={{ fontSize: 14 }}>Aucun CV importé pour ce profil</div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>);
};

// Fallback quand on arrive sur /app/customize/:id mais que le CV n'est pas
// (encore) dans le state local. Refetch depuis le serveur puis met à jour cvs.
const CustomizeMissing = ({ id, session, navigate, setCvs, cvs }) => {
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!session || tried) return;
    setTried(true);
    api.getCvs(session.user.id)
      .then((freshCvs) => {
        setCvs(freshCvs);
        // Si toujours pas trouvé après refetch → retour à la liste
        if (!freshCvs.find((c) => c.id === id)) {
          setTimeout(() => navigate("/app/customize"), 600);
        }
      })
      .catch(() => {
        setTimeout(() => navigate("/app/customize"), 600);
      });
  }, [session, id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 14, padding: 24 }}>
      <div style={{ width: 32, height: 32, border: "2px solid var(--border)", borderTopColor: "var(--gold-deep)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <div className="muted" style={{ fontSize: 14 }}>Chargement du CV…</div>
    </div>
  );
};

Object.assign(window, { CustomizeSelect, CustomizeEdit, CustomizeMissing });
