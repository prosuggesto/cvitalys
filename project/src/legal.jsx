// Pages légales — CGU, Politique de confidentialité (RGPD), Mentions légales, Cookies
// Routes : /legal/mentions, /legal/privacy, /legal/terms, /legal/cookies

// ⚠️ À PERSONNALISER : remplacer ces valeurs par les vraies informations de l'éditeur
const LEGAL_INFO = {
  editor: "Diego Lamperim",
  editorRole: "Éditeur indépendant",
  email: "lamperim.diego47@gmail.com",
  address: "France",
  publicationDirector: "Diego Lamperim",
  hostingFrontend: "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
  hostingBackend: "Supabase Inc. (infrastructure située dans la région eu-west-3, Paris, France)",
  effectiveDate: "16 mai 2026",
};

// Wrapper de page légale — header simple + contenu centré + footer
const LegalLayout = ({ title, lastUpdated, children, navigate }) => {
  const { t } = useT();
  return (
    <div data-no-chrome>
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <Brand/>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate("/")}>
              ← Accueil
            </button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "60px 32px 40px" }}>
        <div className="eyebrow">Légal</div>
        <h1 className="display" style={{ fontSize: 44, margin: "10px 0 8px", fontWeight: 500, lineHeight: 1.1 }}>{title}</h1>
        {lastUpdated && (
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>Dernière mise à jour : {lastUpdated}</p>
        )}
      </section>

      <main className="legal-content" style={{ maxWidth: 820, margin: "0 auto", padding: "20px 32px 80px", fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)" }}>
        {children}
      </main>

      <LegalFooter navigate={navigate}/>
    </div>
  );
};

const LegalFooter = ({ navigate }) => (
  <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
    <Brand size={18}/>
    <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
      <a href="#/legal/mentions" style={{ color: "inherit", textDecoration: "none" }}>Mentions légales</a>
      <a href="#/legal/privacy" style={{ color: "inherit", textDecoration: "none" }}>Confidentialité</a>
      <a href="#/legal/terms" style={{ color: "inherit", textDecoration: "none" }}>CGU</a>
      <a href="#/legal/cookies" style={{ color: "inherit", textDecoration: "none" }}>Cookies</a>
    </div>
    <div style={{ marginTop: 12 }}>CVitalis · © 2026</div>
  </footer>
);

// Helpers pour la mise en forme
const H2 = ({ children }) => (
  <h2 className="display" style={{ fontSize: 26, fontWeight: 500, margin: "36px 0 12px", lineHeight: 1.25 }}>{children}</h2>
);
const H3 = ({ children }) => (
  <h3 style={{ fontSize: 17, fontWeight: 600, margin: "22px 0 8px", color: "var(--ink)" }}>{children}</h3>
);
const P = ({ children }) => (
  <p style={{ margin: "0 0 12px" }}>{children}</p>
);
const UL = ({ children }) => (
  <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>{children}</ul>
);

// =============================================================================
// MENTIONS LÉGALES
// =============================================================================
const LegalMentions = ({ navigate }) => (
  <LegalLayout title="Mentions légales" lastUpdated={LEGAL_INFO.effectiveDate} navigate={navigate}>
    <H2>1. Éditeur du site</H2>
    <P>Le site <strong>CVitalis</strong> (ci-après « le Service ») est édité par :</P>
    <UL>
      <li><strong>{LEGAL_INFO.editor}</strong> — {LEGAL_INFO.editorRole}</li>
      <li>Adresse : {LEGAL_INFO.address}</li>
      <li>Email de contact : <a href={`mailto:${LEGAL_INFO.email}`} style={{ color: "var(--gold-deep)" }}>{LEGAL_INFO.email}</a></li>
      <li>Directeur de la publication : {LEGAL_INFO.publicationDirector}</li>
    </UL>

    <H2>2. Hébergement</H2>
    <P>Le Service est hébergé par les prestataires suivants :</P>
    <UL>
      <li><strong>Frontend</strong> : {LEGAL_INFO.hostingFrontend}</li>
      <li><strong>Base de données et stockage</strong> : {LEGAL_INFO.hostingBackend}</li>
    </UL>
    <P>Les données personnelles des utilisateurs sont stockées au sein de l'Union Européenne (Paris, France).</P>

    <H2>3. Propriété intellectuelle</H2>
    <P>L'ensemble des éléments composant le Service (textes, graphismes, logos, code, structure, base de données…) est la propriété exclusive de l'éditeur ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, est interdite sans autorisation écrite préalable.</P>
    <P>Les contenus uploadés par l'utilisateur (CV, présentation vocale, photos) restent la propriété exclusive de leur auteur. L'utilisateur concède à l'éditeur une licence d'hébergement et de diffusion strictement nécessaire au fonctionnement du Service (voir CGU).</P>

    <H2>4. Données personnelles</H2>
    <P>Le traitement des données personnelles est détaillé dans la <a href="#/legal/privacy" style={{ color: "var(--gold-deep)" }}>Politique de confidentialité</a>.</P>

    <H2>5. Cookies</H2>
    <P>L'utilisation des cookies et technologies similaires est décrite dans la <a href="#/legal/cookies" style={{ color: "var(--gold-deep)" }}>Politique cookies</a>.</P>

    <H2>6. Contact</H2>
    <P>Pour toute question relative au Service ou à ces mentions légales, vous pouvez nous contacter à : <a href={`mailto:${LEGAL_INFO.email}`} style={{ color: "var(--gold-deep)" }}>{LEGAL_INFO.email}</a></P>
  </LegalLayout>
);

// =============================================================================
// POLITIQUE DE CONFIDENTIALITÉ (RGPD)
// =============================================================================
const LegalPrivacy = ({ navigate }) => (
  <LegalLayout title="Politique de confidentialité" lastUpdated={LEGAL_INFO.effectiveDate} navigate={navigate}>
    <P>La présente politique décrit comment <strong>CVitalis</strong> (« nous ») collecte, utilise et protège vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi française « Informatique et Libertés » modifiée.</P>

    <H2>1. Responsable du traitement</H2>
    <P>Le responsable du traitement est <strong>{LEGAL_INFO.editor}</strong>, dont les coordonnées figurent dans les <a href="#/legal/mentions" style={{ color: "var(--gold-deep)" }}>mentions légales</a>. Pour toute question relative à vos données, contactez : <a href={`mailto:${LEGAL_INFO.email}`} style={{ color: "var(--gold-deep)" }}>{LEGAL_INFO.email}</a>.</P>

    <H2>2. Données collectées</H2>
    <H3>Données de compte (fournies par l'utilisateur)</H3>
    <UL>
      <li>Prénom, nom, adresse email</li>
      <li>Numéro de téléphone (optionnel)</li>
      <li>Mot de passe (stocké sous forme hashée par notre fournisseur d'authentification Supabase)</li>
    </UL>

    <H3>Données de CV (créées par l'utilisateur)</H3>
    <UL>
      <li>Nom du CV, poste recherché, secteur d'activité</li>
      <li>Fichier image du CV (JPEG/PNG/WebP)</li>
      <li>Présentation vocale (fichier audio)</li>
      <li>Liens vers réseaux sociaux et site web</li>
    </UL>

    <H3>Données collectées automatiquement</H3>
    <UL>
      <li><strong>Statistiques de scan</strong> agrégées et anonymes : nombre de scans, temps passé sur la page, écoutes audio (lancements/arrêts), clics par canal (WhatsApp, email, etc.)</li>
      <li><strong>Aucun cookie de traçage tiers</strong>, aucune analytique externe (pas de Google Analytics, pas de Meta Pixel, etc.)</li>
    </UL>

    <H3>Interactions des recruteurs (sur la page publique scannée)</H3>
    <UL>
      <li>Lorsqu'un recruteur utilise les boutons « Je souhaite échanger » ou « Donner un retour », les informations qu'il saisit volontairement sont enregistrées : entreprise, nom du recruteur, message, date de rendez-vous proposée.</li>
      <li>Ces données sont exclusivement accessibles à l'utilisateur titulaire du CV scanné.</li>
    </UL>

    <H2>3. Finalités et bases légales</H2>
    <UL>
      <li><strong>Fourniture du Service</strong> (création de compte, gestion du CV digital, génération du QR code) — Base légale : exécution du contrat (article 6.1.b RGPD).</li>
      <li><strong>Statistiques d'usage agrégées</strong> (mesure de l'intérêt sur vos propres CV) — Base légale : intérêt légitime à fournir une fonctionnalité d'analytics à l'utilisateur.</li>
      <li><strong>Réception des messages recruteurs</strong> (mise en relation candidat / recruteur) — Base légale : exécution du contrat.</li>
      <li><strong>Sécurité du Service</strong> (prévention de la fraude, abus) — Base légale : intérêt légitime.</li>
    </UL>

    <H2>4. Destinataires des données</H2>
    <P>Vos données sont exclusivement traitées par <strong>{LEGAL_INFO.editor}</strong> et ses sous-traitants techniques :</P>
    <UL>
      <li><strong>Supabase Inc.</strong> (hébergement base de données et fichiers, authentification) — données stockées dans l'UE (Paris)</li>
      <li><strong>Vercel Inc.</strong> (hébergement frontend) — sans accès aux données personnelles, sert uniquement les fichiers statiques de l'interface</li>
    </UL>
    <P>Aucune donnée n'est vendue, cédée ou partagée à des tiers commerciaux.</P>

    <H2>5. Durée de conservation</H2>
    <UL>
      <li><strong>Compte actif</strong> : tant que le compte est actif</li>
      <li><strong>Compte inactif</strong> : suppression automatique après 3 ans d'inactivité (ou sur demande)</li>
      <li><strong>Statistiques agrégées</strong> : conservées indéfiniment sous forme anonyme</li>
      <li><strong>Interactions recruteurs</strong> : conservées tant que l'utilisateur ne les supprime pas</li>
    </UL>

    <H2>6. Vos droits RGPD</H2>
    <P>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</P>
    <UL>
      <li><strong>Droit d'accès</strong> : obtenir une copie des données vous concernant</li>
      <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
      <li><strong>Droit à l'effacement</strong> (« droit à l'oubli ») : demander la suppression de vos données</li>
      <li><strong>Droit à la limitation</strong> du traitement</li>
      <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
      <li><strong>Droit d'opposition</strong> au traitement</li>
      <li><strong>Droit de retirer votre consentement</strong> à tout moment, lorsque le traitement est basé sur le consentement</li>
    </UL>
    <P>Pour exercer ces droits, écrivez à : <a href={`mailto:${LEGAL_INFO.email}`} style={{ color: "var(--gold-deep)" }}>{LEGAL_INFO.email}</a></P>
    <P>Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)" }}>www.cnil.fr</a>).</P>

    <H2>7. Sécurité</H2>
    <P>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</P>
    <UL>
      <li>Chiffrement des communications (HTTPS/TLS)</li>
      <li>Mots de passe hashés (jamais stockés en clair)</li>
      <li>Isolation des données par utilisateur via Row Level Security (RLS) au niveau base de données</li>
      <li>Accès restreint aux données — seul l'éditeur dispose d'un accès administrateur</li>
    </UL>

    <H2>8. Transferts hors UE</H2>
    <P>Les données personnelles sont stockées au sein de l'Union Européenne. L'interface frontend est servie par Vercel (États-Unis) mais ne traite aucune donnée personnelle directement.</P>

    <H2>9. Modifications</H2>
    <P>Cette politique peut être mise à jour. Toute modification substantielle vous sera notifiée par email.</P>
  </LegalLayout>
);

// =============================================================================
// CONDITIONS GÉNÉRALES D'UTILISATION (CGU)
// =============================================================================
const LegalTerms = ({ navigate }) => (
  <LegalLayout title="Conditions générales d'utilisation" lastUpdated={LEGAL_INFO.effectiveDate} navigate={navigate}>
    <H2>1. Objet</H2>
    <P>Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'utilisation du Service <strong>CVitalis</strong>, plateforme permettant de transformer un CV papier en CV digital interactif accessible par QR code ou NFC.</P>
    <P>En créant un compte ou en utilisant le Service, vous acceptez sans réserve les présentes CGU.</P>

    <H2>2. Accès au Service</H2>
    <P>L'accès au Service nécessite la création d'un compte utilisateur. Vous devez être âgé d'au moins 16 ans pour créer un compte. Vous vous engagez à fournir des informations exactes et à maintenir vos identifiants confidentiels.</P>
    <P>L'éditeur se réserve le droit de suspendre ou résilier tout compte ne respectant pas les présentes CGU.</P>

    <H2>3. Contenus de l'utilisateur</H2>
    <P>Vous restez seul propriétaire des contenus que vous uploadez (CV, présentation vocale, informations personnelles). En les mettant en ligne, vous accordez à l'éditeur une licence non exclusive, gratuite, mondiale, strictement limitée aux opérations techniques nécessaires à l'hébergement et à la diffusion publique du Service (stockage, transcodage, transmission au navigateur du recruteur scannant le QR code).</P>
    <P>Cette licence prend fin automatiquement à la suppression du contenu ou à la fermeture du compte.</P>

    <H2>4. Engagements de l'utilisateur</H2>
    <P>Vous vous engagez à :</P>
    <UL>
      <li>Ne pas uploader de contenu illicite, diffamatoire, haineux, pornographique ou portant atteinte aux droits d'autrui</li>
      <li>Ne pas uploader de CV ou de présentation vocale qui ne vous appartient pas</li>
      <li>Ne pas utiliser le Service pour des activités de spam, phishing ou collecte de données illicite</li>
      <li>Ne pas tenter de contourner les mesures de sécurité du Service</li>
      <li>Respecter les droits de propriété intellectuelle de l'éditeur et des tiers</li>
    </UL>

    <H2>5. Disponibilité du Service</H2>
    <P>L'éditeur s'efforce d'assurer la meilleure disponibilité possible du Service mais ne garantit pas une disponibilité de 100%. Le Service peut être interrompu temporairement pour maintenance, mise à jour ou en cas de force majeure.</P>

    <H2>6. Responsabilité</H2>
    <P>L'éditeur ne saurait être tenu responsable :</P>
    <UL>
      <li>Du contenu uploadé par les utilisateurs</li>
      <li>Des messages envoyés par les recruteurs via les boutons « Je souhaite échanger » ou « Donner un retour »</li>
      <li>Des conséquences professionnelles, contractuelles ou financières liées à l'utilisation du Service</li>
      <li>D'une interruption temporaire du Service liée à une cause indépendante de sa volonté</li>
    </UL>

    <H2>7. Suppression du compte</H2>
    <P>Vous pouvez supprimer votre compte à tout moment depuis la page « Mon compte ». Cette action entraîne la suppression définitive de toutes vos données personnelles et de tous vos contenus (CV, audio, statistiques individuelles) dans un délai maximal de 30 jours.</P>
    <P>L'éditeur peut également supprimer un compte en cas de non-respect des CGU, après notification préalable lorsque cela est possible.</P>

    <H2>8. Tarification</H2>
    <P>Le Service est actuellement proposé gratuitement. L'éditeur se réserve le droit d'introduire à l'avenir des fonctionnalités payantes, qui feront alors l'objet de Conditions Générales de Vente distinctes. Aucun débit ne sera effectué sans accord préalable explicite de l'utilisateur.</P>

    <H2>9. Modification des CGU</H2>
    <P>Les CGU peuvent être modifiées à tout moment. Toute modification substantielle vous sera notifiée par email ou via le Service. La poursuite de l'utilisation après notification vaut acceptation des nouvelles CGU.</P>

    <H2>10. Droit applicable et juridiction</H2>
    <P>Les présentes CGU sont régies par le droit français. Tout litige relatif à leur exécution ou interprétation relève de la compétence exclusive des tribunaux français, après tentative préalable de résolution amiable.</P>
    <P>Conformément à l'article L.612-1 du Code de la consommation, les consommateurs ont accès à la plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)" }}>ec.europa.eu/consumers/odr</a>.</P>

    <H2>11. Contact</H2>
    <P>Pour toute question relative aux présentes CGU : <a href={`mailto:${LEGAL_INFO.email}`} style={{ color: "var(--gold-deep)" }}>{LEGAL_INFO.email}</a></P>
  </LegalLayout>
);

// =============================================================================
// POLITIQUE COOKIES
// =============================================================================
const LegalCookies = ({ navigate }) => (
  <LegalLayout title="Politique des cookies" lastUpdated={LEGAL_INFO.effectiveDate} navigate={navigate}>
    <H2>1. Qu'est-ce qu'un cookie ?</H2>
    <P>Un cookie est un petit fichier déposé sur votre terminal (ordinateur, smartphone) lors de la visite d'un site web. Il permet de mémoriser des informations relatives à votre navigation (session de connexion, préférences…).</P>

    <H2>2. Cookies utilisés par CVitalis</H2>
    <P>CVitalis utilise <strong>uniquement des cookies strictement nécessaires</strong> au fonctionnement du Service. Aucun cookie publicitaire, aucun cookie de tracking tiers (Google Analytics, Meta Pixel…) n'est utilisé.</P>

    <H3>Cookies d'authentification (Supabase)</H3>
    <UL>
      <li><strong>Finalité</strong> : maintenir votre session de connexion active entre les visites</li>
      <li><strong>Émetteur</strong> : Supabase (notre fournisseur d'authentification)</li>
      <li><strong>Durée</strong> : jusqu'à expiration de la session ou déconnexion manuelle</li>
      <li><strong>Base légale</strong> : exemption au consentement (cookie strictement nécessaire — article 82 de la loi Informatique et Libertés)</li>
    </UL>

    <H3>Stockage local (localStorage)</H3>
    <UL>
      <li><strong>Finalité</strong> : mémoriser vos préférences (langue d'interface FR/ES) côté navigateur</li>
      <li><strong>Stockage</strong> : sur votre navigateur, jamais transmis à nos serveurs</li>
      <li><strong>Durée</strong> : jusqu'à effacement manuel des données du site</li>
    </UL>

    <H2>3. Gestion des cookies</H2>
    <P>Puisque CVitalis n'utilise que des cookies strictement nécessaires, aucune bannière de consentement n'est requise par la réglementation. Vous pouvez néanmoins gérer ou supprimer les cookies depuis les paramètres de votre navigateur. Attention : la suppression des cookies d'authentification entraînera votre déconnexion.</P>

    <H3>Liens utiles</H3>
    <UL>
      <li>Chrome : <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)" }}>support.google.com/chrome</a></li>
      <li>Firefox : <a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)" }}>support.mozilla.org</a></li>
      <li>Safari : <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)" }}>support.apple.com</a></li>
      <li>Edge : <a href="https://support.microsoft.com/fr-fr/microsoft-edge" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)" }}>support.microsoft.com</a></li>
    </UL>

    <H2>4. Modifications</H2>
    <P>Cette politique peut évoluer. Toute modification substantielle vous sera notifiée.</P>
  </LegalLayout>
);

Object.assign(window, { LegalMentions, LegalPrivacy, LegalTerms, LegalCookies, LegalFooter, LEGAL_INFO });
