// Top-level app: hash router + auth state + Supabase session

// PWA standalone detection — used to skip the landing page entirely when
// launched from home screen. Conservative on iOS because `matchMedia
// (display-mode: standalone)` has historically misfired on iOS Safari, so
// we exclusively trust `navigator.standalone` there. On Android Chrome,
// `navigator.standalone` doesn't exist so we fall back to matchMedia.
// Query-string `?pwa=1` (set in manifest start_url) is also a positive
// signal that we were launched from the PWA icon.
const isPwaStandalone = () => {
  if (typeof window === "undefined") return false;
  try {
    // Explicit query param from manifest start_url
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("pwa") === "1") return true;
    // iOS: navigator.standalone is the only reliable check
    if (window.navigator && window.navigator.standalone === true) return true;
    // Non-iOS: trust matchMedia
    const ua = (window.navigator && window.navigator.userAgent) || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (!isIOS && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      return true;
    }
  } catch (_) {}
  return false;
};

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
  const { t, setLang } = useT();

  // Expose loading state to the SW registration script (in CVitalis.html).
  // The SW only triggers a silent reload while this flag is true, so updates
  // apply during the loading screen and never interrupt the user.
  useEffect(() => {
    window.__cvitalysLoading = loading;
  }, [loading]);

  // Charger le profil et les CVs après authentification.
  // Implémenté en async/await pour pouvoir poser TOUS les setStates dans le
  // même tick à la fin (batched render) — sinon React peut commit un état
  // intermédiaire (avatar vide / CVs vides) entre setProfile et setCvs, ce
  // qui donne le rendu "chaotique" qu'on cherche à éviter.
  // Retourne une promesse qui résout quand profil + CVs sont prêts ET déjà
  // posés dans le state ; l'appelant n'a plus qu'à setLoading(false).
  const loadUserData = async (userId) => {
    try {
      // 1. Récupérer le profil (créer s'il n'existe pas)
      let profile;
      try {
        profile = await api.getProfile(userId);
      } catch (_) {
        // Profil absent → le créer (fallback si le trigger DB n'est pas installé)
        const { data: { user } } = await sb.auth.getUser();
        const meta = (user && user.user_metadata) || {};
        await sb.from('profils').upsert({
          id: userId,
          prenom: meta.prenom || '',
          nom: meta.nom || '',
          email: user.email || '',
          telephone: meta.telephone || null,
          langue_interface: meta.langue_interface || 'fr',
        }, { onConflict: 'id' });
        profile = await api.getProfile(userId);
      }

      // 2. Sync langue_interface depuis les metadata auth si nécessaire
      try {
        const { data: { user } } = await sb.auth.getUser();
        const metaLang = ((user && user.user_metadata) || {}).langue_interface;
        if (metaLang && metaLang !== profile.langue_interface) {
          await api.updateProfile(userId, { langue_interface: metaLang });
          profile = { ...profile, langue_interface: metaLang };
        }
      } catch (_) { /* non bloquant */ }

      // 3. Récupérer les CVs
      const cvData = await api.getCvs(userId);

      // 4. Pose TOUS les setStates en une seule fois → un seul render
      setProfile(profile);
      setCvs(cvData);
      if (profile.langue_interface) setLang(profile.langue_interface);
      window.MOCK.initialUser = {
        firstName: profile.prenom || '',
        lastName: profile.nom || '',
        email: profile.email || '',
        phone: profile.telephone || '',
        plan: 'Pro',
        renewalDate: '',
      };
    } catch (err) {
      if (window.logErr) window.logErr("Erreur chargement données utilisateur:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Vérifier la session initiale
    api.getSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        loadUserData(s.user.id).then(() => { if (mounted) setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth (login, logout, token refresh)
    const { data: listener } = api.onAuthChange((event, s) => {
      if (!mounted) return;
      setSession(s);
      // Sur SIGNED_IN (login via le formulaire), on garde l'écran de
      // chargement visible jusqu'à ce que profil + CVs soient chargés
      // → pas de rendu intermédiaire chaotique (avatar vide, CVs qui
      // apparaissent un par un dans le désordre, etc.)
      if (event === 'SIGNED_IN' && s) {
        setLoading(true);
        loadUserData(s.user.id).then(() => { if (mounted) setLoading(false); });
      } else if (event === 'TOKEN_REFRESHED' && s) {
        // Refresh silencieux des données en background, pas de loading screen
        loadUserData(s.user.id);
      } else if (event === 'SIGNED_OUT' || !s) {
        setProfile(null);
        setCvs([]);
        window.MOCK.initialUser = { firstName: '', lastName: '', email: '', phone: '', plan: 'Pro', renewalDate: '' };
        setLoading(false);
      }
    });

    // Retour en ligne → refresh silencieux des CVs (stats à jour à chaque
    // reconnexion réseau, sans interrompre l'utilisateur)
    const handleOnline = () => {
      api.getSession().then((s) => {
        if (s && mounted) api.getCvs(s.user.id).then((data) => mounted && setCvs(data)).catch(() => {});
      });
    };
    window.addEventListener('online', handleOnline);

    // Message du Service Worker (ex: FLUSH_OFFLINE_QUEUE après retour réseau)
    const handleSwMessage = (e) => {
      if (e.data && e.data.type === 'FLUSH_OFFLINE_QUEUE') {
        handleOnline();
      }
    };
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      mounted = false;
      if (listener && listener.subscription) listener.subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
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
  const isLegalRoute = route.startsWith("/legal/");

  // Écran de chargement pendant l'init
  if (loading) return <LoadingScreen/>;

  // PWA standalone : jamais de landing page → connecté direct sur /app/cvs,
  // sinon direct sur /auth/login (l'utilisateur peut aller à /auth/signup depuis là)
  if (isPwaStandalone() && (route === "/" || route === "")) {
    navigate(session ? "/app/cvs" : "/auth/login");
    return null;
  }

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
    if (!cv) {
      // CV pas (encore) dans le state local : peut arriver après création
      // si la propagation du setCvs n'est pas encore visible, ou si l'user
      // ouvre /app/customize/X via deep-link avant que getCvs ait fini.
      // On refetch depuis le serveur pour s'assurer d'avoir la donnée à jour.
      page = <CustomizeMissing id={id} session={session} navigate={navigate} setCvs={setCvs} cvs={cvs}/>;
    } else {
      page = <CustomizeEdit
        cv={cv}
        session={session}
        profile={profile}
        onSave={(updated) => setCvs(cvs.map((c) => c.id === updated.id ? updated : c))}
        onPreview={(cv) => navigate(`/cv/${cv.short_code || cv.id}`)}
        toast={toast}
        navigate={navigate}
      />;
    }
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
  } else if (route === "/legal/mentions") {
    page = <LegalMentions navigate={navigate}/>;
  } else if (route === "/legal/privacy") {
    page = <LegalPrivacy navigate={navigate}/>;
  } else if (route === "/legal/terms") {
    page = <LegalTerms navigate={navigate}/>;
  } else if (route === "/legal/cookies") {
    page = <LegalCookies navigate={navigate}/>;
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
          <InstallTutorial/>
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
