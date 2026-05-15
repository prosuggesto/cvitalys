// Top-level app: hash router + auth state + Supabase session

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

const LoadingScreen = () => (
  <div data-no-chrome style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, background: "var(--bg)" }}>
    <Brand size={28}/>
    <div style={{ width: 32, height: 32, border: "2px solid var(--border)", borderTopColor: "var(--gold-deep)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function AppInner() {
  const [route, navigate] = useHashRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvs, setCvs] = useState([]);
  const { Toast: T, show: toast } = useToast();
  const { t } = useT();

  // Charger le profil et les CVs après authentification
  // Si le profil n'existe pas encore (trigger non installé), on le crée ici
  const loadUserData = (userId) => {
    return api.getProfile(userId)
      .catch(() => {
        // Profil absent → on le crée (fallback si le trigger DB n'est pas installé)
        return sb.auth.getUser().then(({ data: { user } }) => {
          const meta = user.user_metadata || {};
          return sb.from('profils').upsert({
            id: userId,
            prenom: meta.prenom || '',
            nom: meta.nom || '',
            email: user.email || '',
            telephone: meta.telephone || null,
          }, { onConflict: 'id' }).then(() => api.getProfile(userId));
        });
      })
      .then((p) => {
        setProfile(p);
        window.MOCK.initialUser = {
          firstName: p.prenom || '',
          lastName: p.nom || '',
          email: p.email || '',
          phone: p.telephone || '',
          plan: 'Pro',
          renewalDate: '',
        };
        return api.getCvs(userId);
      })
      .then((data) => {
        setCvs(data);
      })
      .catch((err) => {
        console.error("Erreur chargement données utilisateur:", err);
      });
  };

  useEffect(() => {
    // Vérifier la session initiale
    api.getSession().then((s) => {
      setSession(s);
      if (s) {
        loadUserData(s.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth
    const { data: listener } = api.onAuthChange((event, s) => {
      setSession(s);
      if (s) {
        loadUserData(s.user.id);
      } else {
        setProfile(null);
        setCvs([]);
        window.MOCK.initialUser = { firstName: '', lastName: '', email: '', phone: '', plan: 'Pro', renewalDate: '' };
      }
    });

    return () => {
      if (listener && listener.subscription) listener.subscription.unsubscribe();
    };
  }, []);

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
  const isAuthRoute = route.startsWith("/auth/");
  const isPublicRoute = route.startsWith("/cv/") || route.startsWith("/nfc/");

  // Écran de chargement pendant l'init
  if (loading) return <LoadingScreen/>;

  // Si session active et sur une page auth → rediriger vers l'app
  if (session && isAuthRoute) {
    navigate("/app/cvs");
    return null;
  }

  // Protéger les routes /app/*
  if (isApp && !session) {
    navigate("/auth/login");
    return null;
  }

  // Données utilisateur dérivées du profil
  const user = profile ? {
    firstName: profile.prenom || '',
    lastName: profile.nom || '',
    email: profile.email || '',
    phone: profile.telephone || '',
    plan: 'Pro',
    renewalDate: '',
  } : window.MOCK.initialUser;

  const handleLogout = () => {
    api.signOut().then(() => {
      navigate("/");
    });
  };

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
    page = <MesCV cvs={cvs} setCvs={setCvs} session={session} navigate={navigate} toast={toast}/>;
  } else if (route === "/app/customize") {
    page = <CustomizeSelect cvs={cvs} navigate={navigate}/>;
  } else if (route.startsWith("/app/customize/")) {
    const id = route.split("/").pop();
    const cv = cvs.find((c) => c.id === id);
    page = <CustomizeEdit
      cv={cv}
      session={session}
      onSave={(updated) => setCvs(cvs.map((c) => c.id === updated.id ? updated : c))}
      onPreview={(cv) => navigate(`/cv/${cv.short_code || cv.id}`)}
      toast={toast}
      navigate={navigate}
    />;
  } else if (route === "/app/analytics") {
    page = <Analytics cvs={cvs}/>;
  } else if (route === "/app/nfc") {
    page = <NFCPage cvs={cvs} session={session} toast={toast}/>;
  } else if (route === "/app/account") {
    page = <Account
      profile={profile}
      setProfile={(p) => {
        setProfile(p);
        window.MOCK.initialUser = { firstName: p.prenom, lastName: p.nom, email: p.email, phone: p.telephone || '', plan: 'Pro', renewalDate: '' };
      }}
      session={session}
      toast={toast}
      onLogout={handleLogout}
    />;
  } else if (route.startsWith("/cv/")) {
    const shortCode = route.replace("/cv/", "");
    page = <PublicPage shortCode={shortCode} navigate={navigate}/>;
  } else if (route.startsWith("/nfc/")) {
    const code = route.replace("/nfc/", "");
    page = <NfcRedirect code={code} navigate={navigate}/>;
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
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} currentRoute={route} navigate={navigate} onLogout={() => { setDrawerOpen(false); handleLogout(); }}/>
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
