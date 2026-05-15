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
    short_code: row.jeton_public,
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
      audioArrets: row.stat_audio_arrets || 0,
      totalTempsAudio: row.stat_total_temps_audio_secondes || 0,
      avgTimeAudio: row.stat_temps_moyen_audio_secondes || 0,
      clicVoirCv: row.stat_clic_voir_cv || 0,
      clicEchange: row.stat_clic_echange || 0,
      clicRetour: row.stat_clic_retour || 0,
      clicEmail: row.stat_clic_email || 0,
      clicWhatsapp: row.stat_clic_whatsapp || 0,
      clicLinkedin: row.stat_clic_linkedin || 0,
      clicInstagram: row.stat_clic_instagram || 0,
      clicSiteWeb: row.stat_clic_site_web || 0,
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

  signUp(email, password, prenom, nom, telephone) {
    return sb.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom, telephone: telephone || '' },
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
    // `*` ramène toutes les colonnes y compris les stats (stat_clic_*, stat_scans, etc.)
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
      .select('*, postes(nom), secteurs(nom), profils(prenom, nom, email, telephone, langue_interface)')
      .eq('jeton_public', shortCode)
      .eq('est_public', true)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data ? { cv: normalizeCv(data), profil: data.profils } : null;
      });
  },

  // ---- STORAGE -------------------------------------------------------------

  // Reçoit un Blob WebP déjà compressé (voir window.imageToWebP)
  uploadCvFile(userId, cvId, blob) {
    const path = `${userId}/${cvId}/cv.webp`;
    return sb.storage
      .from('cvs-files')
      .upload(path, blob, { upsert: true, contentType: 'image/webp' })
      .then(({ data, error }) => {
        if (error) throw error;
        const { data: urlData } = sb.storage.from('cvs-files').getPublicUrl(path);
        // Cache buster pour forcer le navigateur à récupérer la nouvelle version après remplacement
        const url = urlData.publicUrl + '?t=' + Date.now();
        return sb
          .from('cvs')
          .update({ cv_url: url })
          .eq('id', cvId)
          .then(({ error: e2 }) => {
            if (e2) throw e2;
            return url;
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
        p_jeton_public: shortCode,
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
      .select('nom_cv, stat_scans, stat_audio_demarrages, stat_audio_completes, stat_clic_voir_cv, stat_clic_echange, stat_clic_retour, stat_clic_email, stat_clic_whatsapp, stat_clic_linkedin, stat_clic_instagram, stat_clic_site_web, stat_temps_moyen_page_secondes')
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
      .select('*, cvs(jeton_public, nom_cv)')
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
      .select('*, cvs(jeton_public, nom_cv)')
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
      .select('*, cvs(jeton_public)')
      .eq('code_court', codeCourtNfc)
      .eq('actif', true)
      .single()
      .then(({ data, error }) => {
        if (error) return null;
        return data;
      });
  },

  // ---- POSTES / SECTEURS (lookup ou create) --------------------------------

  getPostes(userId) {
    return sb
      .from('postes')
      .select('id, nom')
      .or(`utilisateur_id.eq.${userId},utilisateur_id.is.null`)
      .order('nom')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      });
  },

  getSecteurs(userId) {
    return sb
      .from('secteurs')
      .select('id, nom')
      .or(`utilisateur_id.eq.${userId},utilisateur_id.is.null`)
      .order('nom')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      });
  },

  getOrCreatePoste(userId, nom) {
    if (!nom) return Promise.resolve(null);
    return sb
      .from('postes')
      .select('id')
      .or(`utilisateur_id.eq.${userId},utilisateur_id.is.null`)
      .ilike('nom', nom)
      .limit(1)
      .maybeSingle()
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
      .maybeSingle()
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
