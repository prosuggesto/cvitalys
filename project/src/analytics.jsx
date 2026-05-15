// Analytics page

const StatTile = ({ label, value, trend }) =>
<div className="stat">
    <div className="stat__label">{label}</div>
    <div className="stat__value">{value}</div>
    {trend && <div className="stat__trend">↑ {trend}</div>}
  </div>;


const MiniBar = ({ label, value, max, icon, brand }) => {
  const pct = value / max * 100;
  const Ico = icon ? I[icon] : null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 40px", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--border-soft)" }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", overflow: "hidden" }}>
        {brand ? <BrandLogo name={brand} size={18} /> : Ico && <Ico size={15} />}
      </span>
      <div>
        <div style={{ fontSize: 13, marginBottom: 6 }}>{label}</div>
        <div style={{ height: 4, background: "var(--bg-soft)", borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, width: pct + "%", background: "var(--gold-deep)", borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{value}</div>
    </div>);
};

const SparkLine = () => {
  const pts = [4, 6, 5, 8, 7, 9, 8, 12, 10, 14, 13, 16, 18, 16, 19, 22, 20, 24];
  const max = Math.max(...pts);
  const w = 600, h = 90, pad = 4;
  const path = pts.map((p, i) => {
    const x = pad + i / (pts.length - 1) * (w - pad * 2);
    const y = h - pad - p / max * (h - pad * 2);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  const area = path + ` L${w - pad},${h} L${pad},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 140 }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B69768" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#B69768" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grad)" />
      <path d={path} fill="none" stroke="#B69768" strokeWidth="1.5" />
    </svg>);
};

const Analytics = ({ cvs }) => {
  const { t, lang } = useT();
  const s = MOCK.mockStats;
  const totals = [
    { label: t("analytics.totalScans"),    value: "127",  trend: "+18 " + t("analytics.thisMonth") },
    { label: t("analytics.avgTime"),       value: "1:42", trend: "+8s" },
    { label: t("analytics.feedbackRate"),  value: "7,1%", trend: lang === "es" ? "5 comentarios" : "5 retours" },
  ];
  const engagement = [
    { label: t("analytics.engagement.launched"), value: 42 },
    { label: t("analytics.engagement.complete"), value: 31 },
    { label: t("analytics.engagement.rate"),     value: "73,8%" },
  ];
  const clicks = [
    { label: "WhatsApp",  value: 11, brand: "whatsapp" },
    { label: "Gmail",     value: 8,  brand: "gmail" },
    { label: "LinkedIn",  value: 7,  brand: "linkedin" },
    { label: "Instagram", value: 3,  brand: "instagram" },
    { label: lang === "es" ? "Sitio web" : "Site web", value: 2, icon: "Globe" },
  ];

  return (
    <div className="page" style={{ maxWidth: 1320 }}>
      <PageHeader
        eyebrow={t("analytics.eyebrow")}
        title={t("analytics.title")}
        subtitle={t("analytics.sub")} />

      <div className="card" style={{ padding: 18, marginBottom: 28, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <select className="select" style={{ flex: "1 1 160px", maxWidth: 200 }} defaultValue="30j">
          <option value="7j">{t("analytics.period7")}</option>
          <option value="30j">{t("analytics.period30")}</option>
          <option value="3m">{t("analytics.period3m")}</option>
        </select>
        <select className="select" style={{ flex: "1 1 160px", maxWidth: 220 }} defaultValue="">
          <option value="">{t("analytics.allSectors")}</option>
          <option value="hotel">Hôtellerie / Tourisme</option>
          <option value="commerce">Vente / Relation client</option>
        </select>
        <select className="select" style={{ flex: "1 1 160px", maxWidth: 220 }} defaultValue="">
          <option value="">{t("analytics.allCvs")}</option>
          {cvs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn--primary" style={{ marginLeft: "auto" }}>{t("analytics.filter")}</button>
      </div>

      {/* KPI tiles - now 3 cards */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 28 }}>
        {totals.map((tt) => <StatTile key={tt.label} {...tt} />)}
      </div>

      {/* Scans over time - cleaner, more breathing room */}
      <div className="card" style={{ padding: 32, marginBottom: 28 }}>
        <div className="between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">{t("analytics.scansEyebrow")}</div>
            <h3 className="display" style={{ margin: "10px 0 4px", fontSize: 36, fontWeight: 500, lineHeight: 1.05 }}>+18</h3>
            <div className="muted" style={{ fontSize: 13 }}>{t("analytics.scansLabel")}</div>
          </div>
          <div className="tabs">
            <button className="tab is-active">{t("analytics.tabScans")}</button>
            <button className="tab">{t("analytics.tabAudio")}</button>
            <button className="tab">{t("analytics.tabFeedback")}</button>
          </div>
        </div>
        <SparkLine />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 10, padding: "0 4px", letterSpacing: "0.08em" }}>
          <span>1 {lang === "es" ? "abr" : "avr"}</span>
          <span>15 {lang === "es" ? "abr" : "avr"}</span>
          <span>1 {lang === "es" ? "may" : "mai"}</span>
          <span>15 {lang === "es" ? "may" : "mai"}</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 28 }}>
          <h3 className="display" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>{t("analytics.clicksTitle")}</h3>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>{t("analytics.clicksSub")}</p>
          {clicks.map((c) => <MiniBar key={c.label} {...c} max={Math.max(...clicks.map((x) => x.value))} />)}
        </div>

        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("analytics.championsTitle")}</h3>

          <div style={{ padding: 18, background: "var(--bg-soft)", borderRadius: 14 }}>
            <div className="row gap-8" style={{ marginBottom: 6 }}>
              <I.Crown size={16} stroke="var(--gold-deep)" />
              <div className="eyebrow" style={{ color: "var(--gold-deep)" }}>{t("analytics.topCv")}</div>
            </div>
            <div className="display" style={{ fontSize: 26, fontWeight: 500, fontStyle: "italic", lineHeight: 1.1 }}>{s.topCv.name}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{s.topCv.scans} scans · {s.topCv.share} {t("analytics.topShare")}</div>
          </div>

          <div style={{ padding: 18, background: "var(--surface-2)", borderRadius: 14, border: "1px solid var(--border-soft)" }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{t("analytics.topSector")}</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.15 }}>{s.topSector.name}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{s.topSector.scans} scans · {s.topSector.share} {t("analytics.topShare")}</div>
          </div>

          <div style={{ padding: 18, background: "#1B1814", color: "#F7F3EC", borderRadius: 14 }}>
            <div className="eyebrow" style={{ color: "rgba(247,243,236,0.5)", marginBottom: 6 }}>{t("analytics.audioEngagement")}</div>
            <div className="row gap-24" style={{ alignItems: "flex-end", marginTop: 4 }}>
              <div>
                <div className="display" style={{ fontSize: 36, fontWeight: 500, color: "#F7F3EC" }}>73,8%</div>
                <div style={{ fontSize: 12, color: "rgba(247,243,236,0.6)" }}>{t("analytics.fullListens")}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--gold-soft)" }}>{t("analytics.listensOf", { a: 31, b: 42 })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 28 }}>
        {engagement.map((e) => <StatTile key={e.label} label={e.label} value={e.value} />)}
      </div>

      {/* Latest interactions — now with Recruteur column */}
      <div className="card" style={{ padding: 28 }}>
        <div className="between" style={{ marginBottom: 16 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("analytics.interactions")}</h3>
          <a style={{ fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>{t("analytics.viewAll")}</a>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1.2fr 1.4fr 1.3fr 1.3fr 1.8fr", gap: 14, padding: "0 8px 12px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            <span>{t("analytics.col.date")}</span>
            <span>{t("analytics.col.cv")}</span>
            <span>{t("analytics.col.action")}</span>
            <span>{t("analytics.col.company")}</span>
            <span>{t("analytics.col.recruiter")}</span>
            <span>{t("analytics.col.comment")}</span>
          </div>
          {s.interactions.map((it, i) =>
            <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1.2fr 1.4fr 1.3fr 1.3fr 1.8fr", gap: 14, padding: "16px 8px", borderBottom: "1px solid var(--border-soft)", alignItems: "center", fontSize: 14 }}>
              <span className="muted" style={{ fontSize: 13 }}>{it.date}</span>
              <span>{it.cv}</span>
              <span className="row gap-8">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: it.action.includes("Retour") ? "var(--green)" : it.action.includes("échanger") ? "var(--gold-deep)" : "var(--subtle)" }} />
                {it.action}
              </span>
              <span className="muted">{it.company}</span>
              <span>{it.recruiter || "—"}</span>
              <span className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>{it.note}</span>
            </div>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .page > .card[style*="grid-template-columns"], .page > .grid[style*="grid-template-columns: 1.2fr"] { grid-template-columns: 1fr !important; } .page .card > div[style*="grid-template-columns: 70px"] { grid-template-columns: 1fr !important; gap: 4px !important; padding: 12px 8px !important; } }`}</style>
    </div>);

};

window.Analytics = Analytics;
