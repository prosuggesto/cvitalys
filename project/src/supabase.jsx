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
    langue: row.langue_cv || 'fr',  // langue d'affichage de la page publique du CV
  };
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const api = {

  // ---- AUTH ----------------------------------------------------------------

  signUp(email, password, prenom, nom, telephone, langue_interface = 'fr') {
    return sb.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom, telephone: telephone || '', langue_interface },
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
      langue_cv: data.langue === 'es' ? 'es' : 'fr',  // défaut fr, sinon es (whitelist)
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
    // Whitelist stricte des champs modifiables par le client.
    // SÉCURITÉ : cv_url et audio_url SONT EXCLUS — ils ne doivent être modifiés
    // que par uploadCvFile/uploadAudio (qui posent l'URL Supabase Storage).
    // Sinon un attaquant pourrait via DevTools faire pointer cv_url vers
    // attacker.com → fuite d'IP du recruteur, tracking, etc.
    const dbUpdates = {};
    // NB: email/téléphone/whatsapp ne sont PAS dans la table cvs — ils viennent
    // uniquement de la table profils. Ne pas les inclure ici.
    const keyMap = {
      nom_cv: 'nom_cv',
      poste_id: 'poste_id',
      secteur_id: 'secteur_id',
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
      langue: 'langue_cv',  // côté frontend on appelle "langue", côté DB c'est "langue_cv"
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
    // Supprime aussi les fichiers storage (image CV + audio) pour éviter les
    // fichiers orphelins. On liste le dossier {userId}/{cvId}/ dans chaque bucket
    // puis on supprime tout — comme ça même les anciennes versions sont nettoyées.
    return sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error("Not authenticated");
      const userId = session.user.id;
      const folder = `${userId}/${cvId}`;

      const purgeBucket = (bucket) =>
        sb.storage.from(bucket).list(folder).then(({ data, error }) => {
          if (error) { if (window.logWarn) window.logWarn(`storage list failed (${bucket}):`, error.message); return; }
          if (!data || data.length === 0) return;
          const paths = data.map((f) => `${folder}/${f.name}`);
          return sb.storage.from(bucket).remove(paths).then(({ error: rmErr }) => {
            if (rmErr && window.logWarn) window.logWarn(`storage remove failed (${bucket}):`, rmErr.message);
          });
        });

      // 1) Purge storage (best-effort, ne bloque pas le delete DB)
      // 2) Delete DB row (doit réussir)
      return Promise.all([
        purgeBucket('cvs-files'),
        purgeBucket('audio-files'),
      ]).then(() =>
        sb.from('cvs').delete().eq('id', cvId).then(({ error }) => {
          if (error) throw error;
        })
      );
    });
  },

  getCvByShortCode(shortCode) {
    // Passe par la fonction SECURITY DEFINER get_public_cv qui :
    //  - Ne retourne QUE les colonnes nécessaires (pas les stats, pas utilisateur_id)
    //  - Joint poste/secteur/profil côté serveur (anon n'a pas besoin de RLS sur ces tables)
    //  - Filtre déjà sur est_public = true
    return sb.rpc('get_public_cv', { p_jeton_public: shortCode })
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data || data.length === 0) return null;
        const row = data[0];
        // Reconstruction du shape attendu par normalizeCv (postes/secteurs imbriqués)
        const cvRow = {
          ...row,
          postes: row.poste_nom ? { nom: row.poste_nom } : null,
          secteurs: row.secteur_nom ? { nom: row.secteur_nom } : null,
        };
        const profil = (row.profil_prenom !== null || row.profil_nom !== null) ? {
          prenom: row.profil_prenom,
          nom: row.profil_nom,
          email: row.profil_email,
          telephone: row.profil_telephone,
          langue_interface: row.profil_langue,
        } : null;
        return { cv: normalizeCv(cvRow), profil };
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
    // Validation : type audio + taille raisonnable
    if (!blob || typeof blob !== "object") return Promise.reject(new Error("Audio invalide"));
    if (blob.type && !blob.type.startsWith("audio/")) {
      return Promise.reject(new Error("Type de fichier invalide (audio attendu)"));
    }
    const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8 MB — ~5 min de webm/opus
    if (blob.size > MAX_AUDIO_BYTES) {
      return Promise.reject(new Error("Audio trop volumineux (max 8 Mo)"));
    }
    // iOS Safari enregistre toujours en audio/mp4, Chrome/Firefox en audio/webm.
    // On dérive l'extension + Content-Type du vrai type du blob pour que le
    // lecteur audio puisse relire le fichier après upload.
    const blobType = blob.type || "audio/webm";
    const ext = /mp4|m4a/i.test(blobType) ? "m4a"
              : /aac/i.test(blobType)      ? "aac"
              : /mpeg|mp3/i.test(blobType) ? "mp3"
              : /ogg/i.test(blobType)      ? "ogg"
              :                              "webm";
    const path = `${userId}/${cvId}/audio.${ext}`;
    return sb.storage
      .from('audio-files')
      .upload(path, blob, { upsert: true, contentType: blobType })
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
        if (error && window.logErr) window.logErr('incrementStat error:', error);
      });
  },

  // ---- INTERACTIONS --------------------------------------------------------
  // Insertion depuis la page publique (recruteur) via RPC SECURITY DEFINER.
  // type: 'exchange' | 'feedback'
  submitInteraction(shortCode, type, { entreprise, recruteur, message, dateRdv } = {}) {
    return sb
      .rpc('submit_interaction', {
        p_jeton_public: shortCode,
        p_type: type,
        p_entreprise: entreprise || null,
        p_recruteur: recruteur || null,
        p_message: message || null,
        p_date_rdv: dateRdv || null,
      })
      .then(({ data, error }) => {
        if (error) {
          if (window.logWarn) window.logWarn('submitInteraction error:', error.message);
          throw error;
        }
        return data;
      });
  },

  // Lecture des dernières interactions (uniquement le owner via RLS).
  getLastInteractions(limit = 20) {
    return sb
      .rpc('get_last_interactions', { p_limit: limit })
      .then(({ data, error }) => {
        if (error) {
          if (window.logWarn) window.logWarn('getLastInteractions error:', error.message);
          return [];
        }
        return data || [];
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

  // Toutes les lignes stats_globales de l'utilisateur — le filtrage (mois/secteur) est fait côté client
  getStatsGlobales(userId) {
    return sb
      .from('stats_globales')
      .select('*')
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
    // Whitelist : seuls cv_id et actif sont modifiables. SURTOUT pas utilisateur_id
    // (transfert de propriété), code_court (collision), nfc_uid, etc.
    const allowed = {};
    if ('cv_id' in updates) allowed.cv_id = updates.cv_id;
    if ('actif' in updates) allowed.actif = !!updates.actif;
    if (Object.keys(allowed).length === 0) return Promise.resolve();

    // Si on change le cv_id, vérifier que ce CV appartient bien à l'utilisateur
    // courant (anti-rebind vers le CV d'un autre user). La RLS Supabase devrait
    // bloquer aussi, mais double-vérification côté client = défense en profondeur.
    const verifyOwnership = () => {
      if (!('cv_id' in allowed)) return Promise.resolve();
      return sb.auth.getSession().then(({ data: { session } }) => {
        if (!session) throw new Error("Not authenticated");
        return sb
          .from('cvs')
          .select('id')
          .eq('id', allowed.cv_id)
          .eq('utilisateur_id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error || !data) throw new Error("CV inaccessible");
          });
      });
    };

    return verifyOwnership().then(() =>
      sb.from('nfc_cv').update(allowed).eq('id', nfcId).then(({ error }) => {
        if (error) throw error;
      })
    );
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
    // Passe par la fonction SECURITY DEFINER get_nfc_by_code qui ne retourne
    // QUE le CV ciblé (impossible d'énumérer toutes les cartes NFC du système)
    return sb.rpc('get_nfc_by_code', { p_code_court: codeCourtNfc })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return null;
        const row = data[0];
        // Shape compatible avec l'appelant (NfcRedirect attend .cvs.jeton_public)
        return { cvs: { jeton_public: row.cv_jeton_public } };
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
