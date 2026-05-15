// Supabase client + API layer
// Doit être chargé EN PREMIER (avant tous les autres scripts babel)

const SUPABASE_URL = "https://lsjgnunqzaogphstainl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzamdudW5xemFvZ3Boc3RhaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTk3MTYsImV4cCI6MjA5NDM5NTcxNn0.EQ7rHeL9o7kGAGcEOzAqcP7rXLSOWa4_UH_33SDfQPM";

const { createClient } = supabase; // from CDN @supabase/supabase-js@2
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------------
// Normaliser une ligne cvs (avec jointures postes + secteurs) vers le format
// attendu par les composants React
// ---------------------------------------------------------------------------
function normalizeCv(row) {
  return {
    id: String(row.id),
    dbId: row.id,
    short_code: row.short_code,
    name: row.nom_cv,
    role: (row.postes && row.postes.nom) ? row.postes.nom : '',
    sector: (row.secteurs && row.secteurs.nom) ? row.secteurs.nom : '',
    poste_id: row.poste_id,
    secteur_id: row.secteur_id,
    audio: row.audio_url ? { url: row.audio_url } : null,
    hasFile: !!row.cv_url,
    cv_url: row.cv_url || null,
    audio_url: row.audio_url || null,
    buttons: {
      exchange: !!row.afficher_bouton_echange,
      feedback: !!row.afficher_bouton_retour,
      email: !!row.afficher_bouton_email,
      whatsapp: !!row.afficher_bouton_whatsapp,
      linkedin: !!row.afficher_bouton_linkedin,
      instagram: !!row.afficher_bouton_instagram,
      website: !!row.afficher_bouton_site_web,
    },
    contact: {
      email: row.email_contact || '',
      phone: row.telephone_contact || '',
      whatsapp: row.numero_whatsapp || '',
      linkedin: row.linkedin_url || '',
      instagram: row.instagram_url || '',
      website: row.site_web_url || '',
    },
    accent: 'warm',
    stats: {
      scans: row.stat_scans || 0,
      avgTime: row.stat_temps_moyen_page_secondes || 0,
      audioDemarrages: row.stat_audio_demarrages || 0,
      audioCompletes: row.stat_audio_completes || 0,
    },
    est_public: row.est_public,
    utilisateur_id: row.utilisateur_id,
  };
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const api = {

  // ---- AUTH ----------------------------------------------------------------

  signUp(email, password, prenom, nom) {
    return sb.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom },
      },
    });
  },

  signIn(email, password) {
    return sb.auth.signInWithPassword({ email, password });
  },

  signOut() {
    return sb.auth.signOut();
  },

  resetPassword(email) {
    return sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/auth/reset',
    });
  },

  onAuthChange(callback) {
    return sb.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  getSession() {
    return sb.auth.getSession().then(({ data }) => data.session);
  },

  // ---- PROFIL --------------------------------------------------------------

  getProfile(userId) {
    return sb
      .from('profils')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });
  },

  updateProfile(userId, updates) {
    return sb
      .from('profils')
      .update(updates)
      .eq('id', userId)
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  // ---- CVS -----------------------------------------------------------------

  getCvs(userId) {
    return sb
      .from('cvs')
      .select('*, postes(nom), secteurs(nom)')
      .eq('utilisateur_id', userId)
      .order('cree_le', { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(normalizeCv);
      });
  },

  createCv(userId, data) {
    const row = {
      utilisateur_id: userId,
      nom_cv: data.nom_cv || 'Nouveau CV',
      poste_id: data.poste_id || null,
      secteur_id: data.secteur_id || null,
      email_contact: data.email_contact || null,
      telephone_contact: data.telephone_contact || null,
      numero_whatsapp: data.numero_whatsapp || null,
      linkedin_url: data.linkedin_url || null,
      instagram_url: data.instagram_url || null,
      site_web_url: data.site_web_url || null,
      afficher_bouton_echange: data.afficher_bouton_echange !== undefined ? data.afficher_bouton_echange : true,
      afficher_bouton_retour: data.afficher_bouton_retour !== undefined ? data.afficher_bouton_retour : true,
      afficher_bouton_email: data.afficher_bouton_email !== undefined ? data.afficher_bouton_email : true,
      afficher_bouton_whatsapp: data.afficher_bouton_whatsapp !== undefined ? data.afficher_bouton_whatsapp : false,
      afficher_bouton_linkedin: data.afficher_bouton_linkedin !== undefined ? data.afficher_bouton_linkedin : false,
      afficher_bouton_instagram: data.afficher_bouton_instagram !== undefined ? data.afficher_bouton_instagram : false,
      afficher_bouton_site_web: data.afficher_bouton_site_web !== undefined ? data.afficher_bouton_site_web : false,
      est_public: true,
    };
    return sb
      .from('cvs')
      .insert(row)
      .select('*, postes(nom), secteurs(nom)')
      .single()
      .then(({ data: created, error }) => {
        if (error) throw error;
        return normalizeCv(created);
      });
  },

  updateCv(cvId, updates) {
    // Convertir les clés "frontend" vers les clés DB si nécessaire
    const dbUpdates = {};
    const keyMap = {
      nom_cv: 'nom_cv',
      poste_id: 'poste_id',
      secteur_id: 'secteur_id',
      cv_url: 'cv_url',
      audio_url: 'audio_url',
      email_contact: 'email_contact',
      telephone_contact: 'telephone_contact',
      numero_whatsapp: 'numero_whatsapp',
      linkedin_url: 'linkedin_url',
      instagram_url: 'instagram_url',
      site_web_url: 'site_web_url',
      afficher_bouton_echange: 'afficher_bouton_echange',
      afficher_bouton_retour: 'afficher_bouton_retour',
      afficher_bouton_email: 'afficher_bouton_email',
      afficher_bouton_whatsapp: 'afficher_bouton_whatsapp',
      afficher_bouton_linkedin: 'afficher_bouton_linkedin',
      afficher_bouton_instagram: 'afficher_bouton_instagram',
      afficher_bouton_site_web: 'afficher_bouton_site_web',
      est_public: 'est_public',
    };
    Object.keys(updates).forEach((k) => {
      if (keyMap[k]) dbUpdates[keyMap[k]] = updates[k];
    });
    return sb
      .from('cvs')
      .update(dbUpdates)
      .eq('id', cvId)
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  deleteCv(cvId) {
    return sb
      .from('cvs')
      .delete()
      .eq('id', cvId)
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  getCvByShortCode(shortCode) {
    return sb
      .from('cvs')
      .select('*, postes(nom), secteurs(nom), profils(prenom, nom, email, telephone)')
      .eq('short_code', shortCode)
      .eq('est_public', true)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data ? { cv: normalizeCv(data), profil: data.profils } : null;
      });
  },

  // ---- STORAGE -------------------------------------------------------------

  uploadCvFile(userId, cvId, file) {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${cvId}/cv.${ext}`;
    return sb.storage
      .from('cvs-files')
      .upload(path, file, { upsert: true })
      .then(({ data, error }) => {
        if (error) throw error;
        const { data: urlData } = sb.storage.from('cvs-files').getPublicUrl(path);
        return sb
          .from('cvs')
          .update({ cv_url: urlData.publicUrl })
          .eq('id', cvId)
          .then(({ error: e2 }) => {
            if (e2) throw e2;
            return urlData.publicUrl;
          });
      });
  },

  uploadAudio(userId, cvId, blob) {
    const path = `${userId}/${cvId}/audio.webm`;
    return sb.storage
      .from('audio-files')
      .upload(path, blob, { upsert: true, contentType: 'audio/webm' })
      .then(({ data, error }) => {
        if (error) throw error;
        const { data: urlData } = sb.storage.from('audio-files').getPublicUrl(path);
        return sb
          .from('cvs')
          .update({ audio_url: urlData.publicUrl })
          .eq('id', cvId)
          .then(({ error: e2 }) => {
            if (e2) throw e2;
            return urlData.publicUrl;
          });
      });
  },

  // ---- STATS ---------------------------------------------------------------

  incrementStat(shortCode, type, secondes) {
    return sb
      .rpc('incrementer_stat_cv', {
        p_short_code: shortCode,
        p_type_stat: type,
        p_secondes: secondes || 0,
      })
      .then(({ error }) => {
        if (error) console.error('incrementStat error:', error);
      });
  },

  getStatsForUser(userId) {
    return sb
      .from('cvs')
      .select('nom_cv, stat_scans, stat_audio_demarrages, stat_audio_completes, stat_clics_voir_cv, stat_clics_echange, stat_clics_retour, stat_clics_email, stat_clics_whatsapp, stat_clics_linkedin, stat_clics_instagram, stat_clics_site_web, stat_temps_moyen_page_secondes')
      .eq('utilisateur_id', userId)
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      });
  },

  // ---- NFC -----------------------------------------------------------------

  getNfcCards(userId) {
    return sb
      .from('nfc_cv')
      .select('*, cvs(short_code, nom_cv)')
      .eq('utilisateur_id', userId)
      .order('cree_le', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      });
  },

  createNfcCard(userId, cvId) {
    return sb
      .from('nfc_cv')
      .insert({ utilisateur_id: userId, cv_id: cvId, actif: true })
      .select('*, cvs(short_code, nom_cv)')
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });
  },

  updateNfcCard(nfcId, updates) {
    return sb
      .from('nfc_cv')
      .update(updates)
      .eq('id', nfcId)
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  deleteNfcCard(nfcId) {
    return sb
      .from('nfc_cv')
      .delete()
      .eq('id', nfcId)
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  getNfcByCode(codeCourtNfc) {
    return sb
      .from('nfc_cv')
      .select('*, cvs(short_code)')
      .eq('code_court', codeCourtNfc)
      .eq('actif', true)
      .single()
      .then(({ data, error }) => {
        if (error) return null;
        return data;
      });
  },

  // ---- POSTES / SECTEURS (lookup ou create) --------------------------------

  getOrCreatePoste(userId, nom) {
    if (!nom) return Promise.resolve(null);
    return sb
      .from('postes')
      .select('id')
      .or(`utilisateur_id.eq.${userId},utilisateur_id.is.null`)
      .ilike('nom', nom)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) return data.id;
        return sb
          .from('postes')
          .insert({ utilisateur_id: userId, nom })
          .select('id')
          .single()
          .then(({ data: created, error }) => {
            if (error) throw error;
            return created.id;
          });
      });
  },

  getOrCreateSecteur(userId, nom) {
    if (!nom) return Promise.resolve(null);
    return sb
      .from('secteurs')
      .select('id')
      .or(`utilisateur_id.eq.${userId},utilisateur_id.is.null`)
      .ilike('nom', nom)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) return data.id;
        return sb
          .from('secteurs')
          .insert({ utilisateur_id: userId, nom })
          .select('id')
          .single()
          .then(({ data: created, error }) => {
            if (error) throw error;
            return created.id;
          });
      });
  },
};

window.sb = sb;
window.api = api;
window.normalizeCv = normalizeCv;
