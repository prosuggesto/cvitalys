// Analytics page — données calculées depuis les CVs Supabase

// Helper : date ISO → "il y a Xh / Xj" (FR / ES)
const timeAgo = (dateStr, lang) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  const hr  = Math.floor(diffMs / 3600000);
  const day = Math.floor(diffMs / 86400000);
  if (lang === 'es') {
    if (min < 1)   return 'ahora mismo';
    if (min < 60)  return `hace ${min} min`;
    if (hr  < 24)  return `hace ${hr} h`;
    if (day < 7)   return `hace ${day} ${day === 1 ? 'día' : 'días'}`;
    if (day < 30)  return `hace ${Math.floor(day / 7)} sem.`;
    return d.toLocaleDateString('es-ES');
  }
  if (min < 1)   return "à l'instant";
  if (min < 60)  return `il y a ${min} min`;
  if (hr  < 24)  return `il y a ${hr} h`;
  if (day < 7)   return `il y a ${day} ${day === 1 ? 'jour' : 'jours'}`;
  if (day < 30)  return `il y a ${Math.floor(day / 7)} sem.`;
  return d.toLocaleDateString('fr-FR');
};

// Tableau des interactions — version desktop tableau / mobile cards
const InteractionsTable = ({ interactions, lang }) => {
  const isMobile = useIsMobile(720);
  const labelExchange = lang === 'es' ? 'Encuentro' : 'Échange';
  const labelFeedback = lang === 'es' ? 'Comentario' : 'Commentaire';
  const colRdv = lang === 'es' ? 'Cita' : 'RDV';
  const colWhen = lang === 'es' ? 'Cuándo' : 'Quand';
  const colRecruteur = lang === 'es' ? 'Reclutador' : 'Recruteur';
  const colAction = 'Action';
  const colMessage = lang === 'es' ? 'Mensaje' : 'Message';
  const anonymous = lang === 'es' ? 'Anónimo' : 'Anonyme';

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {interactions.map((it, idx) => {
          const isExchange = it.type === 'exchange';
          return (
            <div key={it.id} style={{ padding: "14px 0", borderTop: idx > 0 ? "1px solid var(--border-soft)" : "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="between" style={{ alignItems: "flex-start", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{it.recruteur || anonymous}</div>
                  {it.entreprise && <div className="muted" style={{ fontSize: 12 }}>{it.entreprise}</div>}
                </div>
                <span style={{
                  fontSize: 11, padding: "4px 9px", borderRadius: 999, fontWeight: 500, whiteSpace: "nowrap",
                  background: isExchange ? "var(--ink)" : "var(--gold-soft)",
                  color: isExchange ? "#F7F3EC" : "var(--gold-deep)",
                }}>
                  {isExchange ? labelExchange : labelFeedback}
                </span>
              </div>
              {it.message && (
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                  « {it.message} »
                </div>
              )}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
                {it.date_rdv && isExchange && (
                  <span style={{ color: "var(--gold-deep)" }}><I.Calendar size={11}/> {fmtDateTimeFr(it.date_rdv)}</span>
                )}
                <span>{timeAgo(it.created_at, lang)}</span>
                {it.cv_name && <span style={{ marginLeft: "auto" }}>{it.cv_name}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop : vrai tableau
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
            <th style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid var(--border)" }}>{colRecruteur}</th>
            <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{colAction}</th>
            <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", minWidth: 240 }}>{colMessage}</th>
            <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{colRdv}</th>
            <th style={{ padding: "10px 0 10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", textAlign: "right" }}>{colWhen}</th>
          </tr>
        </thead>
        <tbody>
          {interactions.map((it, idx) => {
            const isExchange = it.type === 'exchange';
            return (
              <tr key={it.id} style={idx > 0 ? { borderTop: "1px solid var(--border-soft)" } : undefined}>
                <td style={{ padding: "14px 12px 14px 0", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 500, color: "var(--ink)" }}>{it.recruteur || anonymous}</div>
                  {it.entreprise && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{it.entreprise}</div>}
                  {it.cv_name && <div className="muted" style={{ fontSize: 10.5, marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{it.cv_name}</div>}
                </td>
                <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, padding: "4px 10px", borderRadius: 999, fontWeight: 500, whiteSpace: "nowrap",
                    background: isExchange ? "var(--ink)" : "var(--gold-soft)",
                    color: isExchange ? "#F7F3EC" : "var(--gold-deep)",
                  }}>
                    {isExchange ? <I.ThumbsUp size={11}/> : <I.Feedback size={11}/>}
                    {isExchange ? labelExchange : labelFeedback}
                  </span>
                </td>
                <td style={{ padding: "14px 12px", verticalAlign: "top", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  {it.message
                    ? <span style={{ fontStyle: "italic" }}>« {it.message} »</span>
                    : <span className="muted">—</span>}
                </td>
                <td style={{ padding: "14px 12px", verticalAlign: "top", whiteSpace: "nowrap", color: isExchange && it.date_rdv ? "var(--gold-deep)" : "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                  {isExchange && it.date_rdv ? fmtDateTimeFr(it.date_rdv) : '—'}
                </td>
                <td style={{ padding: "14px 0 14px 12px", verticalAlign: "top", whiteSpace: "nowrap", textAlign: "right", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                  {timeAgo(it.created_at, lang)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

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

const Analytics = ({ cvs }) => {
  const { t, lang } = useT();

  // ---- Filter UI state (avant appui sur Filtrer) --------------------------
  const [period, setPeriod] = useState('30j');
  const [sectorFilter, setSectorFilter] = useState('');
  const [cvIdFilter, setCvIdFilter] = useState('');

  // ---- Filtre appliqué (mis à jour quand on clique "Filtrer") -------------
  const [applied, setApplied] = useState({ period: '30j', sector: '', cvId: '' });

  // ---- Stats globales (chargées une fois, filtrées côté client) -----------
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // ---- Dernières interactions (échange + retour avec entreprise/recruteur) -
  const [interactions, setInteractions] = useState([]);
  const [loadingInter, setLoadingInter] = useState(false);

  // Dériver l'userId depuis le premier CV
  const userId = cvs.length > 0 ? cvs[0].utilisateur_id : null;

  // Charger stats_globales au montage (ou quand userId devient disponible)
  useEffect(() => {
    if (!userId) return;
    setLoadingStats(true);
    api.getStatsGlobales(userId)
      .then(rows => { setStatsGlobales(rows); setLoadingStats(false); })
      .catch((err) => {
        if (window.logWarn) window.logWarn('[Analytics] getStatsGlobales failed:', err);
        setStatsGlobales(null);
        setLoadingStats(false);
      });
  }, [userId]);

  // Charger les dernières interactions (RLS filtre auto par user)
  useEffect(() => {
    if (!userId) return;
    setLoadingInter(true);
    api.getLastInteractions(20)
      .then((rows) => { setInteractions(rows); setLoadingInter(false); })
      .catch(() => { setInteractions([]); setLoadingInter(false); });
  }, [userId]);

  // Map nom de secteur → secteur_id (pour filtrer stats_globales)
  const sectorIdMap = useMemo(() => {
    const map = {};
    cvs.forEach(cv => { if (cv.sector && cv.secteur_id) map[cv.sector] = cv.secteur_id; });
    return map;
  }, [cvs]);

  // Mode CV spécifique = le filtre appliqué a un CV sélectionné
  const cvMode = !!applied.cvId;

  // ---- Calcul de la période en mois/années --------------------------------
  const getMonthSet = (periodKey) => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1; // 1-12
    const numMonths = periodKey === '7j' ? 1 : periodKey === '30j' ? 2 : 3;
    const set = new Set();
    for (let i = 0; i < numMonths; i++) {
      let m = curMonth - i;
      let y = curYear;
      if (m <= 0) { m += 12; y -= 1; }
      set.add(`${y}-${m}`);
    }
    return set;
  };

  // ---- Données de travail (array d'objets stats à agréger) ----------------
  // Retourne aussi un flag pour savoir si les données sont "filtrées temporellement"
  const getWorkingStats = () => {
    if (cvMode) {
      const cv = cvs.find(c => c.id === applied.cvId);
      return { rows: cv && cv.stats ? [cv.stats] : [], periodActive: false };
    }

    // Filtrer par secteur depuis cvs (toujours disponible, pas besoin de stats_globales)
    const sectorFiltered = applied.sector
      ? cvs.filter(cv => cv.sector === applied.sector)
      : cvs;

    // Si stats_globales chargées et non vides → filtre temporel + secteur possible
    if (statsGlobales && statsGlobales.length > 0) {
      const monthSet = getMonthSet(applied.period);
      const secteurId = applied.sector ? sectorIdMap[applied.sector] : null;

      const rows = statsGlobales.filter(row => {
        const periodOk = monthSet.has(`${row.annee}-${row.mois}`);
        const sectorOk = !secteurId || row.secteur_id === secteurId;
        return periodOk && sectorOk;
      });

      if (rows.length > 0) {
        return {
          periodActive: true,
          rows: rows.map(row => ({
            scans:           row.stat_scans || 0,
            audioDemarrages: row.stat_audio_demarrages || 0,
            audioArrets:     row.stat_audio_arrets || 0,
            totalTempsAudio: row.stat_total_temps_audio_secondes || 0,
            totalTempsPage:  row.stat_total_temps_page_secondes || 0,
            clicRetour:      row.stat_clic_retour || 0,
            clicEmail:       row.stat_clic_email || 0,
            clicWhatsapp:    row.stat_clic_whatsapp || 0,
            clicLinkedin:    row.stat_clic_linkedin || 0,
            clicInstagram:   row.stat_clic_instagram || 0,
            clicSiteWeb:     row.stat_clic_site_web || 0,
            clicEchange:     row.stat_clic_echange || 0,
            clicVoirCv:      row.stat_clic_voir_cv || 0,
          })),
        };
      }
      // Pas de lignes pour cette période → fallback cvs + secteur
    }

    // Fallback : cvs filtrés par secteur (stats all-time, pas de filtre temporel)
    return { rows: sectorFiltered.map(cv => cv.stats || {}), periodActive: false };
  };

  const { rows: workingStats, periodActive } = getWorkingStats();
  const sumStat = (key) => workingStats.reduce((acc, s) => acc + (s[key] || 0), 0);

  const totalScans       = sumStat('scans');
  const totalAudioDem    = sumStat('audioDemarrages');
  const totalAudioArrets = sumStat('audioArrets');
  const totalClicRetour  = sumStat('clicRetour');
  const totalTempsAudio  = sumStat('totalTempsAudio');
  const totalTempsPage   = sumStat('totalTempsPage');

  // Temps moyen page
  let avgTime = 0;
  if (cvMode) {
    const cv = cvs.find(c => c.id === applied.cvId);
    avgTime = cv?.stats?.avgTime || 0;
  } else if (periodActive && totalTempsPage > 0 && totalScans > 0) {
    // stats_globales avec total → calcul exact
    avgTime = Math.round(totalTempsPage / totalScans);
  } else {
    // Fallback : moyenne des moyennes par CV (approximatif)
    const validCvs = workingStats.filter(s => s.avgTime > 0);
    if (validCvs.length > 0) {
      avgTime = Math.round(validCvs.reduce((acc, s) => acc + (s.avgTime || 0), 0) / validCvs.length);
    }
  }

  const avgTimeFmt = avgTime > 0
    ? `${Math.floor(avgTime / 60)}:${String(avgTime % 60).padStart(2, '0')}`
    : '—';

  const feedbackRate = totalScans > 0
    ? ((totalClicRetour / totalScans) * 100).toFixed(1) + '%'
    : '—';

  const avgAudioSec = totalAudioArrets > 0 ? Math.round(totalTempsAudio / totalAudioArrets) : 0;
  const avgAudioFmt = avgAudioSec > 0
    ? `${Math.floor(avgAudioSec / 60)}:${String(avgAudioSec % 60).padStart(2, '0')}`
    : '—';

  // ---- Champions : toujours depuis les données all-time (tableau cvs) ----
  const allTimeScans = cvs.reduce((acc, cv) => acc + (cv.stats?.scans || 0), 0);

  const topCv = cvs.length > 0
    ? cvs.reduce((best, cv) => ((cv.stats?.scans || 0) > (best.stats?.scans || 0) ? cv : best), cvs[0])
    : null;
  const topCvScans = topCv?.stats?.scans || 0;
  const topCvShare = allTimeScans > 0 && topCv
    ? Math.round((topCvScans / allTimeScans) * 100) + '%'
    : '0%';

  const sectorMap = {};
  cvs.forEach(cv => {
    const sector = cv.sector || '—';
    if (!sectorMap[sector]) sectorMap[sector] = 0;
    sectorMap[sector] += cv.stats?.scans || 0;
  });
  const topSectorEntry = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0];
  const topSector = topSectorEntry ? { name: topSectorEntry[0], scans: topSectorEntry[1] } : { name: '—', scans: 0 };
  const topSectorShare = allTimeScans > 0 ? Math.round((topSector.scans / allTimeScans) * 100) + '%' : '0%';

  // ---- Clics par canal -----------------------------------------------------
  const clicks = [
    { label: "WhatsApp",                                      value: sumStat('clicWhatsapp'),  brand: "whatsapp" },
    { label: "Gmail",                                         value: sumStat('clicEmail'),     brand: "gmail" },
    { label: "LinkedIn",                                      value: sumStat('clicLinkedin'),  brand: "linkedin" },
    { label: "Instagram",                                     value: sumStat('clicInstagram'), brand: "instagram" },
    { label: lang === "es" ? "Sitio web" : "Site web",       value: sumStat('clicSiteWeb'),   icon: "Globe" },
  ];
  const maxClicks = Math.max(...clicks.map(c => c.value), 1);

  // ---- Tiles KPI -----------------------------------------------------------
  const totals = [
    { label: t("analytics.totalScans"),   value: String(totalScans), trend: null },
    { label: t("analytics.avgTime"),      value: avgTimeFmt,         trend: null },
    { label: t("analytics.feedbackRate"), value: feedbackRate,       trend: null },
  ];

  const engagement = [
    { label: t("analytics.engagement.launched"), value: totalAudioDem    },
    { label: t("analytics.engagement.stopped"),  value: totalAudioArrets },
    { label: t("analytics.engagement.avgTime"),  value: avgAudioFmt      },
  ];

  // ---- Appliquer le filtre -------------------------------------------------
  const applyFilter = () => {
    setApplied({
      period: cvIdFilter ? 'all' : period,
      sector: cvIdFilter ? '' : sectorFilter,
      cvId: cvIdFilter,
    });
  };

  // Textes bilingues inline
  const sinceCreation = lang === 'es' ? 'Desde su creación' : 'Depuis sa création';
  const selectedCvName = cvMode ? (cvs.find(c => c.id === applied.cvId)?.name || '') : '';
  const cvInfoMsg = cvMode
    ? (lang === 'es'
        ? `Mostrando estadísticas desde la creación de « ${selectedCvName} ».`
        : `Statistiques affichées depuis la création de « ${selectedCvName} ».`)
    : '';

  return (
    <div className="page" style={{ maxWidth: 1320 }}>
      <PageHeader
        eyebrow={t("analytics.eyebrow")}
        title={t("analytics.title")}
        subtitle={t("analytics.sub")} />

      {/* Barre de filtres */}
      <div className="card" style={{ padding: 18, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>

        {/* Sélecteur de période — désactivé si un CV est sélectionné */}
        <select
          className="select"
          style={{ flex: "1 1 160px", maxWidth: 200, opacity: cvIdFilter ? 0.5 : 1 }}
          value={cvIdFilter ? 'since' : period}
          onChange={e => setPeriod(e.target.value)}
          disabled={!!cvIdFilter}
        >
          {cvIdFilter && <option value="since">{sinceCreation}</option>}
          <option value="7j">{t("analytics.period7")}</option>
          <option value="30j">{t("analytics.period30")}</option>
          <option value="3m">{t("analytics.period3m")}</option>
        </select>

        {/* Sélecteur de secteur — désactivé si un CV est sélectionné */}
        <select
          className="select"
          style={{ flex: "1 1 160px", maxWidth: 220, opacity: cvIdFilter ? 0.5 : 1 }}
          value={cvIdFilter ? '' : sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          disabled={!!cvIdFilter}
        >
          <option value="">{t("analytics.allSectors")}</option>
          {[...new Set(cvs.map(c => c.sector).filter(Boolean))].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sélecteur de CV — verrouille automatiquement les autres filtres */}
        <select
          className="select"
          style={{ flex: "1 1 160px", maxWidth: 220 }}
          value={cvIdFilter}
          onChange={e => {
            setCvIdFilter(e.target.value);
            if (e.target.value) {
              // Réinitialiser secteur quand on passe en mode CV
              setSectorFilter('');
            }
          }}
        >
          <option value="">{t("analytics.allCvs")}</option>
          {cvs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button
          className="btn btn--primary"
          style={{ marginLeft: "auto" }}
          onClick={applyFilter}
        >
          {loadingStats ? '…' : t("analytics.filter")}
        </button>
      </div>

      {/* Message d'info quand un CV spécifique est affiché */}
      {cvMode && (
        <div style={{ marginBottom: 12, padding: "10px 16px", background: "var(--surface-2)", borderRadius: 10, fontSize: 13, color: "var(--muted)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 8 }}>
          <I.Info size={14} />
          {cvInfoMsg}
        </div>
      )}

      {/* Avertissement quand le filtre temporel ne peut pas s'appliquer */}
      {!cvMode && !periodActive && (
        <div style={{ marginBottom: 12, padding: "10px 16px", background: "var(--surface-2)", borderRadius: 10, fontSize: 13, color: "var(--muted)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 8 }}>
          <I.Info size={14} />
          {lang === 'es'
            ? "Datos desde la creación — el filtro temporal se activará a medida que se registren nuevas visitas."
            : "Données depuis la création — le filtre temporel s'activera au fur et à mesure des nouveaux scans."}
        </div>
      )}

      {/* Tuiles KPI */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 28 }}>
        {totals.map(tt => <StatTile key={tt.label} {...tt} />)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 28 }}>
          <h3 className="display" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>{t("analytics.clicksTitle")}</h3>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>{t("analytics.clicksSub")}</p>
          {clicks.map(c => <MiniBar key={c.label} {...c} max={maxClicks} />)}
        </div>

        {/* Champions — toujours basé sur les stats all-time de tous les CVs */}
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
                <div className="display" style={{ fontSize: 36, fontWeight: 500, color: "#F7F3EC" }}>{avgAudioFmt}</div>
                <div style={{ fontSize: 12, color: "rgba(247,243,236,0.6)" }}>{t("analytics.avgAudioTime")}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--gold-soft)" }}>{t("analytics.listensOf", { a: totalAudioArrets, b: totalAudioDem })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 28 }}>
        {engagement.map(e => <StatTile key={e.label} label={e.label} value={e.value} />)}
      </div>

      {/* Interactions — tableau des demandes d'échange + retours */}
      <div className="card" style={{ padding: 28 }}>
        <div className="between" style={{ marginBottom: 16 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{t("analytics.interactions")}</h3>
        </div>
        {loadingInter ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ width: 22, height: 22, margin: "0 auto", border: "2px solid var(--border)", borderTopColor: "var(--gold-deep)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
          </div>
        ) : interactions.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            <I.Calendar size={32} stroke="var(--subtle)"/>
            <p style={{ margin: "12px 0 0" }}>
              {lang === 'es'
                ? 'Aún ninguna interacción. Las solicitudes de los reclutadores aparecerán aquí.'
                : "Aucune interaction pour le moment. Les demandes des recruteurs apparaîtront ici."}
            </p>
          </div>
        ) : (
          <InteractionsTable interactions={interactions} lang={lang}/>
        )}
      </div>

      <style>{`@media (max-width: 900px) { .page > .card[style*="grid-template-columns"], .page > .grid[style*="grid-template-columns: 1.2fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>);
};

window.Analytics = Analytics;
