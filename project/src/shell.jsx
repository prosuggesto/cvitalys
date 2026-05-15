// App shell: top header, side drawer, page wrapper

const NAV = [
  { id: "cvs",       key: "nav.cvs",       icon: "Cv",     route: "/app/cvs" },
  { id: "custom",    key: "nav.customize", icon: "Brush",  route: "/app/customize" },
  { id: "analytics", key: "nav.analytics", icon: "Chart",  route: "/app/analytics" },
  { id: "nfc",       key: "nav.nfc",       icon: "Wifi",   route: "/app/nfc" },
  { id: "account",   key: "nav.account",   icon: "User",   route: "/app/account" },
];

const Brand = ({ size = 22, withText = true }) => (
  <span className="brand" style={{ fontSize: size }}>
    <span className="brand__mark" style={{ width: size * 1.25, height: size * 1.25 }}/>
    {withText && <span>CVitalis</span>}
  </span>
);

const Drawer = ({ open, onClose, user, currentRoute, navigate, onLogout }) => {
  const { t } = useT();
  return (
  <React.Fragment>
    <div className={"drawer-backdrop" + (open ? " is-open" : "")} onClick={onClose}/>
    <div className={"drawer" + (open ? " is-open" : "")}>
      <div className="between">
        <Brand/>
        <button className="icon-btn" onClick={onClose}><I.Close size={16}/></button>
      </div>
      <div className="drawer__user">
        <div className="avatar">{user.firstName[0]}{user.lastName[0]}</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{t("common.candidate")} · {user.plan}</div>
        </div>
      </div>
      <nav className="drawer__nav">
        {NAV.map((n) => {
          const Ico = I[n.icon];
          const active = currentRoute && currentRoute.startsWith(n.route);
          return (
            <button key={n.id} className={"nav-item" + (active ? " is-active" : "")} onClick={() => { navigate(n.route); onClose(); }}>
              <Ico size={18} className="nav-icon"/>
              <span>{t(n.key)}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid var(--border-soft)" }}>
        <button className="nav-item" onClick={onLogout}>
          <I.Logout size={18} className="nav-icon"/>
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  </React.Fragment>
  );
};

const AppHeader = ({ title, onMenu, user }) => {
  const { t } = useT();
  return (
  <header className="app-header">
    <button className="icon-btn" onClick={onMenu} aria-label="Menu"><I.Menu size={20}/></button>
    <Brand size={20}/>
    <span className="app-header__title">{title}</span>
    <div className="app-header__right">
      <span className="badge badge--green badge--dot">{user.plan}</span>
      <span className="user-chip">
        <span className="user-chip__name">
          <strong>{user.firstName} {user.lastName.toLowerCase()}</strong>
          <span>{t("common.candidate")}</span>
        </span>
        <span className="avatar">{user.firstName[0]}{user.lastName[0]}</span>
      </span>
    </div>
  </header>
  );
};

const PageHeader = ({ eyebrow, title, subtitle, action }) => (
  <div className="page-header">
    {eyebrow && <div className="eyebrow">{eyebrow}</div>}
    <div className="between" style={{ alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  </div>
);

Object.assign(window, { Drawer, AppHeader, PageHeader, Brand, NAV });
