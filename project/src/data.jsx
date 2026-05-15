// Mock data store

const initialUser = {
  firstName: "Diego",
  lastName: "Lamperim",
  email: "lamperim.diego47@gmail.com",
  phone: "0767569224",
  lang: "Français",
  plan: "Pro",
  renewalDate: "12 juin 2026",
};

const initialCvs = [
  {
    id: "cv1",
    name: "CV Hôtellerie",
    role: "Réceptionniste",
    sector: "Hôtellerie / Tourisme",
    audio: { name: "presentation_hotel.m4a", duration: "1:08" },
    hasFile: true,
    buttons: { exchange: true, feedback: true, email: true, whatsapp: true, linkedin: true, instagram: false, website: false },
    contact: {
      email: "lamperim.diego47@gmail.com",
      phone: "0767569224",
      whatsapp: "+33 7 67 56 92 24",
      linkedin: "linkedin.com/in/diego-l",
      instagram: "",
      website: "",
    },
    accent: "warm", // for preview tint
  },
  {
    id: "cv2",
    name: "CV Commercial",
    role: "Conseiller commercial",
    sector: "Vente / Relation client",
    audio: { name: "presentation_commercial.m4a", duration: "1:24" },
    hasFile: true,
    buttons: { exchange: true, feedback: true, email: true, whatsapp: true, linkedin: true, instagram: true, website: true },
    contact: {
      email: "lamperim.diego47@gmail.com",
      phone: "0767569224",
      whatsapp: "+33 7 67 56 92 24",
      linkedin: "linkedin.com/in/diego-l",
      instagram: "@diego.lamperim",
      website: "diego-lamperim.fr",
    },
    accent: "sage",
  },
];

const mockStats = {
  totals: [
    { label: "Total scans", value: "127", trend: "+18 ce mois" },
    { label: "Visiteurs uniques", value: "94", trend: "+12" },
    { label: "Temps moyen", value: "1:42", trend: "+8s" },
    { label: "Taux retour recruteur", value: "7,1%", trend: "5 retours" },
  ],
  engagement: [
    { label: "Écoutes audio lancées", value: 42 },
    { label: "Écoutes audio complètes", value: 31 },
    { label: "Taux d'écoute complète", value: "73,8%" },
    { label: "Clics « Voir le CV »", value: 18 },
  ],
  clicks: [
    { label: "WhatsApp", value: 11, icon: "Whatsapp" },
    { label: "Email", value: 8, icon: "Mail" },
    { label: "LinkedIn", value: 7, icon: "Linkedin" },
    { label: "Instagram", value: 3, icon: "Instagram" },
    { label: "Site web", value: 2, icon: "Globe" },
  ],
  interactions: [
    { date: "14 mai", cv: "CV Hôtellerie", action: "Souhaite échanger", company: "Hôtel Lutetia",  recruiter: "Claire Mercier",   note: "Poste réceptionniste de nuit — disponibilité ?" },
    { date: "13 mai", cv: "CV Commercial", action: "Retour recruteur",   company: "Maison Pernod",  recruiter: "Thomas Vidal",    note: "Profil intéressant mais cherche 3 ans d'expérience." },
    { date: "12 mai", cv: "CV Hôtellerie", action: "Souhaite échanger", company: "Sofitel Paris",  recruiter: "Naïma Bensaïd",   note: "Entretien à fixer la semaine prochaine." },
    { date: "11 mai", cv: "CV Commercial", action: "Audio écouté",      company: "—",              recruiter: "—",                note: "Écoute complète" },
    { date: "10 mai", cv: "CV Hôtellerie", action: "WhatsApp",          company: "Le Bristol",     recruiter: "Pierre Lacombe",  note: "—" },
  ],
  topCv: { name: "CV Hôtellerie", scans: 78, share: "61%" },
  topSector: { name: "Hôtellerie / Tourisme", scans: 78, share: "61%" },
};

window.MOCK = { initialUser, initialCvs, mockStats };
