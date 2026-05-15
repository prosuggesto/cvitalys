// Backward compat shim — real data comes from Supabase via api (supabase.jsx)
// Les composants utilisent window.MOCK pour affichage du preview CV (initiales, etc.)
// Ces valeurs sont écrasées dynamiquement dans app.jsx dès que le profil est chargé.

window.MOCK = {
  initialUser: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    lang: 'Français',
    plan: 'Pro',
    renewalDate: '',
  },
  initialCvs: [],
  mockStats: {
    totals: [],
    engagement: [],
    clicks: [],
    interactions: [],
    topCv: { name: '', scans: 0, share: '0%' },
    topSector: { name: '', scans: 0, share: '0%' },
  },
};
