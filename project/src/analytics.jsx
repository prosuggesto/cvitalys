// Analytics page — données calculées depuis les CVs Supabase

const StatTile = ({ label, value, trend }) =>
<div className="stat">
    <div className="stat__label">{label}</div>
    <div className="stat__value">{value}</div>
    {trend && <div className="stat__trend">↑ {trend}</div>}
  </div>;

const MiniBar = ({ label, value, max, icon, brand }) => {
  const pct = max > 0 ? (value / max * 100) : 0;
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

  // Calculer les agrégats depuis les données réelles des CVs
  const totalScans = cvs.reduce((acc, cv) => acc + (cv.stats ? cv.stats.scans : 0), 0);
  const totalAudioDem = cvs.reduce((acc, cv) => acc + (cv.stats ? cv.stats.audioDemarrages : 0), 0);
  const totalAudioComp = cvs.reduce((acc, cv) => acc + (cv.stats ? cv.stats.audioCompletes : 0), 0);
  const avgTime = cvs.length > 0
    ? Math.round(cvs.reduce((acc, cv) => acc + (cv.stats ? cv.stats.avgTime : 0), 0) / cvs.length)
    : 0;
  const avgTimeFmt = avgTime > 0
    ? `${Math.floor(avgTime / 60)}:${String(avgTime % 60).padStart(2, '0')}`
    : '—';
  const audioRate = totalAudioDem > 0
    ? ((totalAudioComp / totalAudioDem) * 100).toFixed(1) + '%'
    : '—';

  // Top CV
  const topCv = cvs.length > 0
    ? cvs.reduce((best, cv) => ((cv.stats ? cv.stats.scans : 0) > (best.stats ? best.stats.scans : 0) ? cv : best), cvs[0])
    : null;
  const topCvScans = topCv && topCv.stats ? topCv.stats.scans : 0;
  const topCvShare = totalScans > 0 && topCv
    ? Math.round((topCvScans / totalScans) * 100) + '%'
    : '0%';

  // Stats agrégées par secteur pour top secteur
  const sectorMap = {};
  cvs.forEach((cv) => {
    const sector = cv.sector || '—';
    if (!sectorMap[sector]) sectorMap[sector] = 0;
    sectorMap[sector] += cv.stats ? cv.stats.scans : 0;
  });
  const topSectorEntry = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0];
  const topSector = topSectorEntry ? { name: topSectorEntry[0], scans: topSectorEntry[1] } : { name: '—', scans: 0 };
  const topSectorShare = totalScans > 0 ? Math.round((topSector.scans / totalScans) * 100) + '%' : '0%';

  const totals = [
    { label: t("analytics.totalScans"), value: String(totalScans), trend: null },
    { label: t("analytics.avgTime"), value: avgTimeFmt, trend: null },
    { label: t("analytics.feedbackRate"), value: audioRate, trend: null },
  ];

  const engagement = [
    { label: t("analytics.engagement.launched"), value: totalAudioDem },
    { label: t("analytics.engagement.complete"), value: totalAudioComp },
    { label: t("analytics.engagement.rate"), value: audioRate },
  ];

  const clicks = [
    { label: "WhatsApp", value: cvs.reduce((a, c) => a + (c.stat_clics_whatsapp || 0), 0), brand: "whatsapp" },
    { label: "Gmail", value: cvs.reduce((a, c) => a + (c.stat_clics_email || 0), 0), brand: "gmail" },
    { label: "LinkedIn", value: cvs.reduce((a, c) => a + (c.stat_clics_linkedin || 0), 0), brand: "linkedin" },
    { label: "Instagram", value: cvs.reduce((a, c) => a + (c.stat_clics_instagram || 0), 0), brand: "instagram" },
    { label: lang === "es" ? "Sitio web" : "Site web", value: cvs.reduce((a, c) => a + (c.stat_clics_site_web || 0), 0), icon: "Globe" },
  ];
  const maxClicks = Math.max(...clicks.map((c) => c.value), 1);

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
          {[...new Set(cvs.map((c) => c.sector).filter(Boolean))].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="select" style={{ flex: "1 1 160px", maxWidth: 220 }} defaultValue="">
          <option value="">{t("analytics.allCvs")}</option>
          {cvs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn--primary" style={{ marginLeft: "auto" }}>{t("analytics.filter")}</button>
      </div>

      {/* KPI tiles */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 28 }}>
        {totals.map((tt) => <StatTile key={tt.label} {...tt} />)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 28 }}>
          <h3 className="display" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>{t("analytics.clicksTitle")}</h3>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>{t("analytics.clicksSub")}</p>
          {clicks.map((c) => <MiniBar key={c.label} {...c} max={maxClicks} />)}
        </div>

        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("analytics.championsTitle")}</h3>

          <div style={{ padding: 18, background: "var(--bg-soft)", borderRadius: 14 }}>
            <div className="row gap-8" style={{ marginBottom: 6 }}>
              <I.Crown size={16} stroke="var(--gold-deep)" />
              <div className="eyebrow" style={{ color: "var(--gold-deep)" }}>{t("analytics.topCv")}</div>
            </div>
            <div className="display" style={{ fontSize: 26, fontWeight: 500, fontStyle: "italic", lineHeight: 1.1 }}>
              {topCv ? topCv.name : '—'}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{topCvScans} scans · {topCvShare} {t("analytics.topShare")}</div>
          </div>

          <div style={{ padding: 18, background: "var(--surface-2)", borderRadius: 14, border: "1px solid var(--border-soft)" }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{t("analytics.topSector")}</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.15 }}>{topSector.name}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{topSector.scans} scans · {topSectorShare} {t("analytics.topShare")}</div>
          </div>

          <div style={{ padding: 18, background: "#1B1814", color: "#F7F3EC", borderRadius: 14 }}>
            <div className="eyebrow" style={{ color: "rgba(247,243,236,0.5)", marginBottom: 6 }}>{t("analytics.audioEngagement")}</div>
            <div className="row gap-24" style={{ alignItems: "flex-end", marginTop: 4 }}>
              <div>
                <div className="display" style={{ fontSize: 36, fontWeight: 500, color: "#F7F3EC" }}>{audioRate}</div>
                <div style={{ fontSize: 12, color: "rgba(247,243,236,0.6)" }}>{t("analytics.fullListens")}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--gold-soft)" }}>{t("analytics.listensOf", { a: totalAudioComp, b: totalAudioDem })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 28 }}>
        {engagement.map((e) => <StatTile key={e.label} label={e.label} value={e.value} />)}
      </div>

      {/* Interactions — fonctionnalité future */}
      <div className="card" style={{ padding: 28 }}>
        <div className="between" style={{ marginBottom: 16 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("analytics.interactions")}</h3>
        </div>
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          <I.Calendar size={32} stroke="var(--subtle)"/>
          <p style={{ margin: "12px 0 0" }}>Fonctionnalité disponible prochainement</p>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .page > .card[style*="grid-template-columns"], .page > .grid[style*="grid-template-columns: 1.2fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>);
};

window.Analytics = Analytics;
