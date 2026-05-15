// Top-level app: hash router + state

function useHashRoute() {
  const get = () => window.location.hash.replace(/^#/, "") || "/";
  const [route, setRoute] = useState(get());
  useEffect(() => {
    const onChange = () => setRoute(get());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = (path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0 });
  };
  return [route, navigate];
}

function AppInner() {
  const [route, navigate] = useHashRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cvs, setCvs] = useState(MOCK.initialCvs);
  const [user, setUser] = useState(MOCK.initialUser);
  const { Toast: T, show: toast } = useToast();
  const { t } = useT();

  // Title resolution
  const titleFor = (r) => {
    if (r.startsWith("/app/cvs")) return t("nav.cvs");
    if (r.startsWith("/app/customize")) return t("nav.customize");
    if (r.startsWith("/app/analytics")) return t("nav.analytics");
    if (r.startsWith("/app/nfc")) return t("nav.nfc");
    if (r.startsWith("/app/account")) return t("nav.account");
    return "";
  };

  const isApp = route.startsWith("/app");

  let page;
  if (route === "/" || route === "") {
    page = <Landing navigate={navigate}/>;
  } else if (route === "/auth/login") {
    page = <Login navigate={navigate}/>;
  } else if (route === "/auth/signup") {
    page = <Signup navigate={navigate}/>;
  } else if (route === "/auth/forgot") {
    page = <Forgot navigate={navigate}/>;
  } else if (route === "/app/cvs") {
    page = <MesCV cvs={cvs} setCvs={setCvs} navigate={navigate} toast={toast}/>;
  } else if (route === "/app/customize") {
    page = <CustomizeSelect cvs={cvs} navigate={navigate}/>;
  } else if (route.startsWith("/app/customize/")) {
    const id = route.split("/").pop();
    const cv = cvs.find((c) => c.id === id);
    page = <CustomizeEdit cv={cv} onSave={(updated) => setCvs(cvs.map((c) => c.id === updated.id ? updated : c))} onPreview={(cv) => navigate(`/cv/${cv.id}`)} toast={toast} navigate={navigate}/>;
  } else if (route === "/app/analytics") {
    page = <Analytics cvs={cvs}/>;
  } else if (route === "/app/nfc") {
    page = <NFCPage cvs={cvs} toast={toast}/>;
  } else if (route === "/app/account") {
    page = <Account user={user} setUser={setUser} toast={toast} onLogout={() => navigate("/")}/>;
  } else if (route.startsWith("/cv/")) {
    const id = route.split("/").pop();
    const cv = id === "demo" ? cvs[0] : cvs.find((c) => c.id === id);
    page = <PublicPage cv={cv} user={user} navigate={navigate}/>;
  } else {
    page = (
      <div data-no-chrome style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <h2 className="display" style={{ fontSize: 36 }}>{t("public.notFound")}</h2>
        <button className="btn btn--primary" onClick={() => navigate("/")}>{t("public.backHome")}</button>
      </div>
    );
  }

  return (
    <React.Fragment>
      {isApp && (
        <React.Fragment>
          <AppHeader title={titleFor(route)} onMenu={() => setDrawerOpen(true)} user={user}/>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} currentRoute={route} navigate={navigate} onLogout={() => { setDrawerOpen(false); navigate("/"); }}/>
        </React.Fragment>
      )}
      {page}
      {T}
    </React.Fragment>
  );
}

function App() {
  return <I18nProvider><AppInner/></I18nProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
