// Auth: login / signup / forgot — connecté au vrai backend Supabase

const AuthShell = ({ children, footer }) => {
  const { t } = useT();
  return (
  <div data-no-chrome style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
    <div style={{ background: "var(--ink)", color: "#F7F3EC", padding: "48px 48px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
      <Brand size={20}/>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="eyebrow" style={{ color: "rgba(247,243,236,0.5)" }}>{t("auth.left1")}</div>
        <h2 className="display" style={{ fontSize: 56, fontWeight: 500, margin: "12px 0 16px", lineHeight: 1.05 }}>
          {t("auth.left2a")} <br/><em className="display-italic" style={{ color: "var(--gold-soft)" }}>{t("auth.left2b")}</em> {t("auth.left2c")}
        </h2>
        <p style={{ maxWidth: 380, color: "rgba(247,243,236,0.65)" }}>
          {t("auth.left3")}
        </p>
      </div>
      <div style={{ fontSize: 12, color: "rgba(247,243,236,0.4)" }}>© 2026 CVitalis</div>
      <div style={{ position: "absolute", right: -120, bottom: -120, width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(182,151,104,0.35)" }}/>
      <div style={{ position: "absolute", right: -60, bottom: -60, width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(182,151,104,0.25)" }}/>
      <div style={{ position: "absolute", right: 60, bottom: 60, width: 140, height: 140, borderRadius: "50%", background: "var(--gold-deep)", opacity: 0.2, filter: "blur(40px)" }}/>
    </div>
    <div style={{ padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 520, width: "100%", margin: "0 auto" }}>
      {children}
      {footer}
    </div>
    <style>{`@media (max-width: 880px) { body > div > div[data-no-chrome] { grid-template-columns: 1fr !important; } body > div > div[data-no-chrome] > div:first-child { display: none; } }`}</style>
  </div>
  );
};

const AuthError = ({ message }) => {
  if (!message) return null;
  return (
    <div style={{ padding: "10px 14px", background: "var(--red-soft, #fef2f2)", border: "1px solid var(--red, #ef4444)", borderRadius: 10, color: "var(--red, #dc2626)", fontSize: 13, marginBottom: 4 }}>
      {message}
    </div>
  );
};

const Login = ({ navigate }) => {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    api.signIn(email, password)
      .then(({ error: err }) => {
        setLoading(false);
        if (err) {
          if (err.message && err.message.toLowerCase().includes("invalid")) {
            setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
          } else {
            setError(err.message || "Une erreur est survenue. Réessayez.");
          }
        } else {
          navigate("/app/cvs");
        }
      });
  };

  return (
    <AuthShell footer={
      <div style={{ marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
        {t("auth.noAccount")} <a onClick={() => navigate("/auth/signup")} style={{ color: "var(--ink)", textDecoration: "underline", cursor: "pointer" }}>{t("auth.createAccount")}</a>
      </div>
    }>
      <div className="eyebrow">{t("auth.eyebrowLogin")}</div>
      <h1 className="display" style={{ fontSize: 44, margin: "12px 0 8px", fontWeight: 500 }}>{t("auth.titleLogin1")} <em className="display-italic">{t("auth.titleLogin2")}</em></h1>
      <p className="muted" style={{ marginBottom: 32 }}>{t("auth.subLogin")}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label={t("common.email")}><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="votre@email.fr" required/></Field>
        <Field label={t("auth.password")}><input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required/></Field>
        <div style={{ textAlign: "right" }}>
          <a onClick={() => navigate("/auth/forgot")} style={{ fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>{t("auth.forgotPw")}</a>
        </div>
        <AuthError message={error}/>
        <button className="btn btn--primary btn--lg" type="submit" disabled={loading}>
          {loading ? "Connexion…" : t("auth.submitLogin")}
        </button>
      </form>
    </AuthShell>
  );
};

const Signup = ({ navigate }) => {
  const { t } = useT();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!f.firstName || !f.lastName) { setError("Prénom et nom sont requis."); return; }
    if (f.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setLoading(true);
    api.signUp(f.email, f.password, f.firstName, f.lastName)
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          if (err.message && err.message.toLowerCase().includes("already")) {
            setError("Un compte existe déjà avec cet email. Connectez-vous.");
          } else {
            setError(err.message || "Une erreur est survenue. Réessayez.");
          }
        } else if (data.session) {
          // Email confirmation désactivée → session immédiate
          navigate("/app/cvs");
        } else {
          // Email confirmation activée → afficher message
          setEmailSent(true);
        }
      });
  };

  if (emailSent) {
    return (
      <AuthShell footer={null}>
        <div className="eyebrow">{t("auth.eyebrowSignup")}</div>
        <h1 className="display" style={{ fontSize: 44, margin: "12px 0 8px", fontWeight: 500 }}>
          Vérifiez votre <em className="display-italic">email.</em>
        </h1>
        <p className="muted" style={{ marginBottom: 32 }}>
          Un lien de confirmation a été envoyé à <strong>{f.email}</strong>. Cliquez dessus pour activer votre compte.
        </p>
        <div className="card" style={{ padding: 20 }}>
          <div className="row gap-12">
            <span className="check check--on"><I.Check size={12}/></span>
            <span>Email envoyé — vérifiez votre boîte de réception.</span>
          </div>
        </div>
        <button className="btn btn--secondary btn--lg" style={{ marginTop: 20 }} onClick={() => navigate("/auth/login")}>
          ← Retour à la connexion
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell footer={
      <div style={{ marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
        {t("auth.hasAccount")} <a onClick={() => navigate("/auth/login")} style={{ color: "var(--ink)", textDecoration: "underline", cursor: "pointer" }}>{t("auth.submitLogin")}</a>
      </div>
    }>
      <div className="eyebrow">{t("auth.eyebrowSignup")}</div>
      <h1 className="display" style={{ fontSize: 44, margin: "12px 0 8px", fontWeight: 500 }}>{t("auth.titleSignup1")} <em className="display-italic">{t("auth.titleSignup2")}</em></h1>
      <p className="muted" style={{ marginBottom: 32 }}>{t("auth.subSignup")}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label={t("common.firstName")}><input className="input" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} placeholder="Diego" required/></Field>
          <Field label={t("common.lastName")}><input className="input" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} placeholder="Lamperim" required/></Field>
        </div>
        <Field label={t("common.email")}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="votre@email.fr" required/></Field>
        <Field label={t("auth.password")} hint={t("auth.pwHint")}><input className="input" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required/></Field>
        <AuthError message={error}/>
        <button className="btn btn--primary btn--lg" type="submit" disabled={loading}>
          {loading ? "Création du compte…" : t("auth.submitSignup")}
        </button>
        <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          {t("auth.terms")}
        </div>
      </form>
    </AuthShell>
  );
};

const Forgot = ({ navigate }) => {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    api.resetPassword(email)
      .then(({ error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message || "Une erreur est survenue. Réessayez.");
        } else {
          setSent(true);
        }
      });
  };

  return (
    <AuthShell footer={
      <div style={{ marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
        <a onClick={() => navigate("/auth/login")} style={{ color: "var(--ink)", textDecoration: "underline", cursor: "pointer" }}>{t("auth.backLogin")}</a>
      </div>
    }>
      <div className="eyebrow">{t("auth.eyebrowForgot")}</div>
      <h1 className="display" style={{ fontSize: 44, margin: "12px 0 8px", fontWeight: 500 }}>{t("auth.titleForgot1")} <em className="display-italic">{t("auth.titleForgot2")}</em></h1>
      <p className="muted" style={{ marginBottom: 32 }}>{t("auth.subForgot")}</p>
      {sent ? (
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-12"><span className="check check--on"><I.Check size={12}/></span> <strong>{t("auth.sent")}</strong></div>
          <p className="muted" style={{ margin: "10px 0 0", fontSize: 14 }}>{t("auth.sentSub")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label={t("common.email")}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.fr" required/></Field>
          <AuthError message={error}/>
          <button className="btn btn--primary btn--lg" type="submit" disabled={loading}>
            {loading ? "Envoi…" : t("auth.submitForgot")}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

Object.assign(window, { Login, Signup, Forgot });
