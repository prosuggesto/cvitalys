// Support NFC page — connecté à Supabase

const NFCPage = ({ cvs, session, toast }) => {
  const { t } = useT();
  const [nfcCards, setNfcCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState(cvs[0]?.dbId || "");

  const steps = t("nfc.steps");

  useEffect(() => {
    if (!session) return;
    api.getNfcCards(session.user.id)
      .then((cards) => {
        setNfcCards(cards);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Utiliser la première carte NFC si elle existe
  const nfcCard = nfcCards[0] || null;
  const base = window.APP_URL || (window.location.origin + window.location.pathname);
  const link = nfcCard ? `${base}#/nfc/${nfcCard.code_court}` : null;

  const handleCreate = () => {
    if (!session || !selectedCvId) return;
    setCreating(true);
    const cvDbId = typeof selectedCvId === 'string' && selectedCvId.startsWith('cv')
      ? cvs.find((c) => c.id === selectedCvId)?.dbId
      : Number(selectedCvId);
    api.createNfcCard(session.user.id, cvDbId)
      .then((card) => {
        setNfcCards([card, ...nfcCards]);
        setCreating(false);
        toast("Carte NFC créée !");
      })
      .catch((err) => {
        setCreating(false);
        toast("Erreur : " + (err.message || "création échouée"));
      });
  };

  const handleChangeCV = (newCvId) => {
    if (!nfcCard) return;
    const cvDbId = cvs.find((c) => c.id === newCvId)?.dbId || Number(newCvId);
    api.updateNfcCard(nfcCard.id, { cv_id: cvDbId })
      .then(() => {
        toast("CV associé mis à jour !");
      })
      .catch((err) => {
        toast("Erreur : " + (err.message || "mise à jour échouée"));
      });
  };

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <PageHeader
        eyebrow={t("cvs.eyebrow")}
        title={t("nfc.title")}
        subtitle={t("nfc.sub")}
      />

      <div className="card" style={{ padding: 22, background: "var(--gold-bg)", borderColor: "var(--gold-soft)", display: "flex", gap: 14, marginBottom: 22 }}>
        <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", background: "rgba(138,111,69,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-deep)" }}>
          <I.Wifi size={18}/>
        </span>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{t("nfc.alert1")}</div>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t("nfc.alert2")}</p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          Chargement…
        </div>
      ) : nfcCard ? (
        <React.Fragment>
          <div className="card" style={{ padding: 28, marginBottom: 22 }}>
            <div className="between" style={{ marginBottom: 18 }}>
              <h3 className="display" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{t("nfc.linkTitle")}</h3>
              <span className="badge badge--green badge--dot">{t("common.active")}</span>
            </div>
            <div style={{ padding: "16px 20px", background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 12, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink)", marginBottom: 18, wordBreak: "break-all" }}>
              {link}
            </div>
            <div className="row gap-12">
              <button className="btn btn--primary" onClick={() => { navigator.clipboard?.writeText(link); toast(t("common.copied")); }}>
                <I.Copy size={14}/> {t("nfc.copyBtn")}
              </button>
              <button className="btn btn--secondary" onClick={() => { if (link && /^https?:\/\//i.test(link)) window.open(link, '_blank', 'noopener,noreferrer'); }}>
                <I.Open size={14}/> {t("nfc.openBtn")}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 22 }}>
            <h3 className="display" style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 500 }}>{t("nfc.showCvTitle")}</h3>
            <select
              className="select"
              defaultValue={nfcCard.cv_id || ""}
              onChange={(e) => {
                const found = cvs.find((c) => String(c.dbId) === e.target.value);
                if (found) handleChangeCV(found.id);
              }}>
              {cvs.map((c) => <option key={c.id} value={String(c.dbId)}>{c.name} — {c.role}</option>)}
            </select>
            <p className="muted" style={{ margin: "12px 0 0", fontSize: 13 }}>
              {t("nfc.showCvHint")}
            </p>
          </div>
        </React.Fragment>
      ) : (
        <div className="card" style={{ padding: 32, marginBottom: 22, textAlign: "center" }}>
          <div className="muted" style={{ marginBottom: 20, fontSize: 14 }}>Pas encore de carte NFC. Créez-en une pour commencer.</div>
          {cvs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
              <select className="select" style={{ maxWidth: 320 }} value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)}>
                {cvs.map((c) => <option key={c.id} value={c.dbId}>{c.name} — {c.role}</option>)}
              </select>
              <button className="btn btn--primary" onClick={handleCreate} disabled={creating}>
                <I.Wifi size={14}/> {creating ? "Création…" : "Créer un support NFC"}
              </button>
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 13 }}>Créez d'abord un CV avant d'associer une carte NFC.</div>
          )}
        </div>
      )}

      <div className="card" style={{ padding: 32 }}>
        <h3 className="display" style={{ margin: "0 0 18px", fontSize: 24, fontWeight: 500 }}>{t("nfc.howTitle")}</h3>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((s, i) => (
            <li key={i} className="row gap-12" style={{ alignItems: "flex-start" }}>
              <span className="step-bubble" style={{ marginTop: 1 }}>{i + 1}</span>
              <span style={{ fontSize: 14, lineHeight: 1.55 }}>{s}</span>
            </li>
          ))}
        </ol>

        <div style={{ marginTop: 24, padding: 16, background: "var(--gold-bg)", borderRadius: 12, borderLeft: "3px solid var(--gold-deep)", fontSize: 13, color: "var(--ink-2)" }}>
          {t("nfc.tipNfcTools")}
        </div>

        <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
          {t("nfc.support")}
        </p>
      </div>
    </div>
  );
};

window.NFCPage = NFCPage;
