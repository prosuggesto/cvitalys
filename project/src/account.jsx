// Mon compte page — connecté à Supabase

const Account = ({ profile, setProfile, session, toast, onLogout }) => {
  const { t, lang, setLang } = useT();
  const [local, setLocal] = useState(profile ? {
    firstName: profile.prenom || '',
    lastName: profile.nom || '',
    email: profile.email || '',
    phone: profile.telephone || '',
  } : { firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocal({
        firstName: profile.prenom || '',
        lastName: profile.nom || '',
        email: profile.email || '',
        phone: profile.telephone || '',
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!session) return;
    setSaving(true);
    api.updateProfile(session.user.id, {
      prenom: local.firstName,
      nom: local.lastName,
      email: local.email,
      telephone: local.phone,
      langue_interface: lang,
    })
      .then(() => {
        setSaving(false);
        const updated = {
          ...(profile || {}),
          prenom: local.firstName,
          nom: local.lastName,
          email: local.email,
          telephone: local.phone,
          langue_interface: lang,
        };
        setProfile(updated);
        window.MOCK.initialUser = { firstName: local.firstName, lastName: local.lastName, email: local.email, phone: local.phone, plan: 'Pro', renewalDate: '' };
        toast(t("account.saved"));
      })
      .catch((err) => {
        setSaving(false);
        toast("Erreur : " + (err.message || "sauvegarde échouée"));
      });
  };

  const initials = ((local.firstName || '?')[0] + (local.lastName || '?')[0]).toUpperCase();

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <PageHeader
        eyebrow={t("nav.account")}
        title={t("account.title")}
        subtitle={t("account.sub")} />

      <div className="card" style={{ padding: 32, marginBottom: 22 }}>
        <div className="between" style={{ marginBottom: 24 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{t("account.infoTitle")}</h3>
          <div className="row gap-12">
            <div className="avatar" style={{ width: 44, height: 44, fontSize: 14 }}>{initials}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label={t("common.firstName")}><input className="input" value={local.firstName} onChange={(e) => setLocal({ ...local, firstName: e.target.value })} /></Field>
          <Field label={t("common.lastName")}><input className="input" value={local.lastName} onChange={(e) => setLocal({ ...local, lastName: e.target.value })} /></Field>
          <Field label={t("common.email")}><input className="input" type="email" value={local.email} onChange={(e) => setLocal({ ...local, email: e.target.value })} /></Field>
          <Field label={t("common.phone")}><input className="input" value={local.phone} onChange={(e) => setLocal({ ...local, phone: e.target.value })} /></Field>
        </div>

        <hr className="hr" />

        <Field label={t("common.langLabel")}>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value)} style={{ maxWidth: 260 }}>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            <I.Check size={14} /> {saving ? "Sauvegarde…" : t("common.save")}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn--ghost" onClick={onLogout}><I.Logout size={14} /> {t("nav.logout")}</button>
      </div>
    </div>);
};

window.Account = Account;
