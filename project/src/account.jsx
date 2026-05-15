// Mon compte page + subscription modals — connecté à Supabase

const Account = ({ profile, setProfile, session, toast, onLogout }) => {
  const { t, lang, setLang } = useT();
  const [local, setLocal] = useState(profile ? {
    firstName: profile.prenom || '',
    lastName: profile.nom || '',
    email: profile.email || '',
    phone: profile.telephone || '',
  } : { firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

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

  const plan = 'Pro';
  const renewalDate = '';

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

      <div className="card" style={{ padding: 32, marginBottom: 22 }}>
        <div className="between" style={{ marginBottom: 18 }}>
          <h3 className="display" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{t("account.subTitle")}</h3>
          <span className={"badge" + (cancelled ? " badge--neutral" : "")}>{cancelled ? t("account.cancelled") : plan}</span>
        </div>
        <div className="between" style={{ alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 14, color: "var(--ink-2)" }}>
              <span style={{ fontWeight: 500 }}>{plan}</span> · {cancelled ? t("account.accessUntil") + " " : t("account.renewing") + " "}{renewalDate || "—"}
            </div>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: 13, maxWidth: 480 }}>
              {cancelled ? t("account.cancelledDesc") : t("account.subDesc")}
            </p>
          </div>
          {!cancelled && <button className="btn btn--secondary" onClick={() => setManageOpen(true)}><I.Chart size={14} /> {t("account.manageBtn")}</button>}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn--ghost" onClick={onLogout}><I.Logout size={14} /> {t("nav.logout")}</button>
      </div>

      <Modal open={manageOpen} onClose={() => setManageOpen(false)} width={480}>
        <div style={{ padding: 36 }}>
          <div className="eyebrow">{t("account.subTitle")}</div>
          <h2 className="display" style={{ fontSize: 32, fontWeight: 500, margin: "8px 0 6px" }}>{t("account.manageTitle")}</h2>
          <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}><strong style={{ color: "var(--ink)" }}>{plan}</strong> · {t("account.renewing")} {renewalDate || "—"}.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn btn--secondary btn--block">{t("account.editPayment")}</button>
            <button className="btn btn--block" style={{ background: "var(--red-soft)", color: "var(--red)" }} onClick={() => {setManageOpen(false);setConfirmOpen(true);}}>
              {t("account.cancelBtn")}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} width={520}>
        <div style={{ padding: 36 }}>
          <div className="eyebrow" style={{ color: "var(--red)" }}>{t("account.cancelEyebrow")}</div>
          <h2 className="display" style={{ fontSize: 30, fontWeight: 500, margin: "8px 0 12px" }}>{t("account.cancelTitle")}</h2>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 12 }}>
            {t("account.cancelIntro")}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {[1, 2, 3, 4, 5, 6].map((i) =>
            <li key={i} className="row gap-8" style={{ fontSize: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }} />{t("account.feat" + i)}
              </li>
            )}
          </ul>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setConfirmOpen(false)}>{t("account.keep")}</button>
            <button className="btn btn--danger" style={{ flex: 1 }} onClick={() => {setCancelled(true);setConfirmOpen(false);toast(t("account.cancelDone"));}}>
              {t("account.confirmCancel")}
            </button>
          </div>
        </div>
      </Modal>
    </div>);
};

window.Account = Account;
