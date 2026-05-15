// Support NFC page

const NFCPage = ({ cvs, toast }) => {
  const { t } = useT();
  const [selected, setSelected] = useState(cvs[0]?.id || "");
  const link = `https://cvitalis.app/#/cv?c=7PESHT`;
  const steps = t("nfc.steps");

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

      <div className="card" style={{ padding: 28, marginBottom: 22 }}>
        <div className="between" style={{ marginBottom: 18 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{t("nfc.linkTitle")}</h3>
          <span className="badge badge--green badge--dot">{t("common.active")}</span>
        </div>
        <div style={{ padding: "16px 20px", background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 12, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink)", marginBottom: 18, wordBreak: "break-all" }}>
          {link}
        </div>
        <div className="row gap-12">
          <button className="btn btn--primary" onClick={() => { navigator.clipboard?.writeText(link); toast(t("common.copied")); }}><I.Copy size={14}/> {t("nfc.copyBtn")}</button>
          <button className="btn btn--secondary"><I.Open size={14}/> {t("nfc.openBtn")}</button>
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 22 }}>
        <h3 className="display" style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 500 }}>{t("nfc.showCvTitle")}</h3>
        <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {cvs.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
        </select>
        <p className="muted" style={{ margin: "12px 0 0", fontSize: 13 }}>
          {t("nfc.showCvHint")}
        </p>
      </div>

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
