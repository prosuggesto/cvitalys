// Landing page

const HeroPreview = () => {
  const { t } = useT();
  return (
    <div className="hero__preview">
      <div style={{ position: "absolute", top: -14, left: 24, padding: "5px 12px", borderRadius: 999, background: "var(--ink)", color: "#F7F3EC", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {t("landing.hero.scanned")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 22, alignItems: "center" }}>
        <CVPreviewVisual cv={MOCK.initialCvs[0]} scale={0.7}/>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>{t("landing.hero.candidate")}</div>
          <h3 className="display" style={{ fontSize: 32, margin: "4px 0 4px", fontWeight: 500 }}>Diego Lamperim</h3>
          <div style={{ fontSize: 14, color: "var(--gold-deep)" }}>Réceptionniste · Hôtellerie</div>
          <div className="audio-player" style={{ marginTop: 16 }}>
            <button className="audio-play"><I.Play size={14}/></button>
            <div style={{ flex: 1 }}>
              <div className="audio-bar"><div className="audio-bar__progress" style={{ width: "32%" }}/></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span className="audio-time">0:21</span>
                <span className="audio-time">1:08</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
        <button className="btn btn--primary"><I.ThumbsUp size={16}/> {t("landing.hero.exchange")}</button>
        <button className="btn btn--secondary"><I.Feedback size={16}/> {t("landing.hero.feedback")}</button>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
        <button className="icon-btn" style={{ width: 44, height: 44, border: "1px solid var(--border)", borderRadius: "50%", padding: 0, overflow: "hidden", background: "var(--surface)" }}><BrandLogo name="whatsapp" size={22}/></button>
        <button className="icon-btn" style={{ width: 44, height: 44, border: "1px solid var(--border)", borderRadius: "50%", padding: 0, overflow: "hidden", background: "var(--surface)" }}><BrandLogo name="gmail" size={22}/></button>
        <button className="icon-btn" style={{ width: 44, height: 44, border: "1px solid var(--border)", borderRadius: "50%", padding: 0, overflow: "hidden", background: "var(--surface)" }}><BrandLogo name="linkedin" size={20}/></button>
        <button className="icon-btn" style={{ width: 44, height: 44, border: "1px solid var(--border)", borderRadius: "50%", padding: 0, overflow: "hidden", background: "var(--surface)" }}><BrandLogo name="instagram" size={22}/></button>
      </div>
    </div>
  );
};

const StepCard = ({ n, title, body }) => (
  <div className="card" style={{ padding: 26 }}>
    <div className="step-bubble" style={{ background: "transparent", color: "var(--gold-deep)", border: "1px solid var(--gold-soft)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, width: 32, height: 32 }}>{n}</div>
    <h3 className="display" style={{ fontSize: 22, margin: "14px 0 8px", fontWeight: 500 }}>{title}</h3>
    <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>{body}</p>
  </div>
);

const BenefitRow = ({ title, body, num }) => (
  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 22, padding: "28px 0", borderTop: "1px solid var(--border)" }}>
    <div className="display-italic" style={{ fontSize: 26, color: "var(--gold-deep)" }}>{num}</div>
    <div>
      <h4 className="display" style={{ fontSize: 24, margin: "0 0 8px", fontWeight: 500 }}>{title}</h4>
      <p style={{ margin: 0, color: "var(--muted)", maxWidth: 540 }}>{body}</p>
    </div>
  </div>
);

const LangSwitch = () => {
  const { lang, setLang } = useT();
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 999, gap: 2, marginLeft: 8 }}>
      {["fr","es"].map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 10px", borderRadius: 999, fontSize: 12, border: "none", background: lang === l ? "var(--ink)" : "transparent", color: lang === l ? "#F7F3EC" : "var(--muted)", fontWeight: 500, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {l}
        </button>
      ))}
    </div>
  );
};

const Landing = ({ navigate }) => {
  const { t } = useT();
  return (
    <div data-no-chrome>
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <Brand/>
          <div className="landing-nav__links">
            <a href="#fonctionnement">{t("nav.howItWorks")}</a>
            <a href="#valeur">{t("nav.why")}</a>
            <a href="#preview">{t("nav.recruiterPreview")}</a>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <LangSwitch/>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate("/auth/login")}>{t("nav.login")}</button>
            <button className="btn btn--primary btn--sm" onClick={() => navigate("/auth/signup")}>{t("nav.createCv")}</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="fade-in">
          <span className="badge"><I.Sparkle size={12}/> {t("landing.hero.badge")}</span>
          <h1>{t("landing.hero.title1")} <em>{t("landing.hero.title2")}</em></h1>
          <p>{t("landing.hero.sub")}</p>
          <div className="hero__cta">
            <button className="btn btn--primary btn--lg" onClick={() => navigate("/auth/signup")}>{t("landing.hero.cta1")} <I.Arrow size={16}/></button>
            <button className="btn btn--secondary btn--lg" onClick={() => navigate("/cv/demo")}>{t("landing.hero.cta2")}</button>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 28, fontSize: 13, color: "var(--muted)" }}>
            <span className="row gap-8"><I.Check size={14} stroke="#6E8E78"/> {t("landing.hero.bullet1")}</span>
            <span className="row gap-8"><I.Check size={14} stroke="#6E8E78"/> {t("landing.hero.bullet2")}</span>
          </div>
        </div>
        <div>
          <HeroPreview/>
        </div>
      </section>

      <section id="fonctionnement" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px" }}>
        <div className="between" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
          <div>
            <div className="eyebrow">{t("landing.how.eyebrow")}</div>
            <h2 className="display" style={{ fontSize: 52, margin: "10px 0 0", fontWeight: 500 }}>{t("landing.how.title1")} <em className="display-italic">{t("landing.how.title2")}</em></h2>
          </div>
          <p className="muted" style={{ maxWidth: 360, margin: 0 }}>{t("landing.how.intro")}</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <StepCard n="01" title={t("landing.how.s1t")} body={t("landing.how.s1b")}/>
          <StepCard n="02" title={t("landing.how.s2t")} body={t("landing.how.s2b")}/>
          <StepCard n="03" title={t("landing.how.s3t")} body={t("landing.how.s3b")}/>
          <StepCard n="04" title={t("landing.how.s4t")} body={t("landing.how.s4b")}/>
        </div>
      </section>

      <section id="valeur" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "flex-start" }}>
          <div style={{ position: "sticky", top: 100 }}>
            <div className="eyebrow">{t("landing.why.eyebrow")}</div>
            <h2 className="display" style={{ fontSize: 48, margin: "10px 0 18px", fontWeight: 500 }}>{t("landing.why.title1")} <em className="display-italic">{t("landing.why.title2")}</em> {t("landing.why.title3")}</h2>
            <p className="muted">{t("landing.why.intro")}</p>
          </div>
          <div>
            <BenefitRow num="i." title={t("landing.why.r1t")} body={t("landing.why.r1b")}/>
            <BenefitRow num="ii." title={t("landing.why.r2t")} body={t("landing.why.r2b")}/>
            <BenefitRow num="iii." title={t("landing.why.r3t")} body={t("landing.why.r3b")}/>
            <BenefitRow num="iv." title={t("landing.why.r4t")} body={t("landing.why.r4b")}/>
          </div>
        </div>
      </section>

      <section id="preview" style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="eyebrow">{t("landing.preview.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 52, margin: "10px 0 14px", fontWeight: 500 }}>{t("landing.preview.title1")} <em className="display-italic">{t("landing.preview.title2")}</em> {t("landing.preview.title3")}</h2>
          <p className="muted" style={{ maxWidth: 540, margin: "0 auto" }}>{t("landing.preview.intro")}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 380, transform: "rotate(-2deg)" }}>
            <PublicCVCard cv={MOCK.initialCvs[0]} user={MOCK.initialUser} compact/>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 32px 100px" }}>
        <div className="card" style={{ padding: 56, textAlign: "center", background: "var(--ink)", color: "#F7F3EC", borderColor: "var(--ink)" }}>
          <div className="eyebrow" style={{ color: "rgba(247,243,236,0.6)" }}>{t("landing.cta.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 52, margin: "12px 0 18px", fontWeight: 500, color: "#F7F3EC" }}>{t("landing.cta.title1")} <em className="display-italic" style={{ color: "var(--gold-soft)" }}>{t("landing.cta.title2")}</em></h2>
          <p style={{ maxWidth: 480, margin: "0 auto 28px", color: "rgba(247,243,236,0.7)" }}>{t("landing.cta.intro")}</p>
          <button className="btn btn--lg" style={{ background: "#F7F3EC", color: "var(--ink)" }} onClick={() => navigate("/auth/signup")}>{t("landing.cta.button")} <I.Arrow size={16}/></button>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
        <Brand size={18}/>
        <div style={{ marginTop: 12 }}>CVitalis · {t("brand.tagline")} · © 2026</div>
      </footer>
    </div>
  );
};

window.Landing = Landing;
