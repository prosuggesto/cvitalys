-- ============================================================
-- CVitalis — Migration SQL complète
-- À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABLE profils
-- ============================================================
create table if not exists public.profils (
  id                  uuid primary key references auth.users(id) on delete cascade,
  prenom              text not null default '',
  nom                 text not null default '',
  email               text not null default '',
  telephone           text,
  langue_interface    text not null default 'fr',
  derniere_connexion_le timestamptz,
  cree_le             timestamptz not null default now(),
  modifie_le          timestamptz not null default now()
);

-- ============================================================
-- 2. TABLE secteurs
-- ============================================================
create table if not exists public.secteurs (
  id            bigint generated always as identity primary key,
  utilisateur_id uuid references public.profils(id) on delete cascade,
  nom           text not null,
  cree_le       timestamptz not null default now()
);

-- ============================================================
-- 3. TABLE postes
-- ============================================================
create table if not exists public.postes (
  id            bigint generated always as identity primary key,
  utilisateur_id uuid references public.profils(id) on delete cascade,
  nom           text not null,
  cree_le       timestamptz not null default now()
);

-- ============================================================
-- 4. TABLE cvs
-- ============================================================
create table if not exists public.cvs (
  id                              bigint generated always as identity primary key,
  utilisateur_id                  uuid not null references public.profils(id) on delete cascade,
  short_code                      text unique not null default encode(gen_random_bytes(6), 'base64'),
  nom_cv                          text not null default 'Nouveau CV',
  poste_id                        bigint references public.postes(id) on delete set null,
  secteur_id                      bigint references public.secteurs(id) on delete set null,
  cv_url                          text,
  audio_url                       text,
  email_contact                   text,
  telephone_contact               text,
  numero_whatsapp                 text,
  linkedin_url                    text,
  instagram_url                   text,
  site_web_url                    text,
  afficher_bouton_echange         boolean not null default true,
  afficher_bouton_retour          boolean not null default true,
  afficher_bouton_email           boolean not null default true,
  afficher_bouton_whatsapp        boolean not null default false,
  afficher_bouton_linkedin        boolean not null default false,
  afficher_bouton_instagram       boolean not null default false,
  afficher_bouton_site_web        boolean not null default false,
  stat_scans                      integer not null default 0,
  stat_temps_moyen_page_secondes  integer not null default 0,
  stat_audio_demarrages           integer not null default 0,
  stat_audio_completes            integer not null default 0,
  stat_clics_voir_cv              integer not null default 0,
  stat_clics_echange              integer not null default 0,
  stat_clics_retour               integer not null default 0,
  stat_clics_email                integer not null default 0,
  stat_clics_whatsapp             integer not null default 0,
  stat_clics_linkedin             integer not null default 0,
  stat_clics_instagram            integer not null default 0,
  stat_clics_site_web             integer not null default 0,
  est_public                      boolean not null default true,
  nfc_actif                       boolean not null default false,
  cree_le                         timestamptz not null default now(),
  modifie_le                      timestamptz not null default now()
);

-- ============================================================
-- 5. TABLE stats_globales
-- ============================================================
create table if not exists public.stats_globales (
  id                          bigint generated always as identity primary key,
  utilisateur_id              uuid not null references public.profils(id) on delete cascade,
  secteur_id                  bigint references public.secteurs(id) on delete set null,
  mois                        integer not null check (mois between 1 and 12),
  annee                       integer not null,
  stat_scans                  integer not null default 0,
  stat_audio_demarrages       integer not null default 0,
  stat_audio_completes        integer not null default 0,
  stat_clics_voir_cv          integer not null default 0,
  stat_clics_echange          integer not null default 0,
  stat_clics_retour           integer not null default 0,
  cree_le                     timestamptz not null default now(),
  modifie_le                  timestamptz not null default now(),
  unique (utilisateur_id, secteur_id, mois, annee)
);

-- ============================================================
-- 6. TABLE nfc_cv
-- ============================================================
create table if not exists public.nfc_cv (
  id              bigint generated always as identity primary key,
  utilisateur_id  uuid not null references public.profils(id) on delete cascade,
  code_court      text unique not null default upper(encode(gen_random_bytes(4), 'hex')),
  nfc_uid         text,
  cv_id           bigint references public.cvs(id) on delete set null,
  actif           boolean not null default true,
  cree_le         timestamptz not null default now(),
  modifie_le      timestamptz not null default now()
);

-- ============================================================
-- 7. TRIGGERS modifie_le
-- ============================================================
create or replace function public.set_modifie_le()
returns trigger language plpgsql as $$
begin
  new.modifie_le = now();
  return new;
end;
$$;

create or replace trigger trg_profils_modifie_le
  before update on public.profils
  for each row execute function public.set_modifie_le();

create or replace trigger trg_cvs_modifie_le
  before update on public.cvs
  for each row execute function public.set_modifie_le();

create or replace trigger trg_nfc_cv_modifie_le
  before update on public.nfc_cv
  for each row execute function public.set_modifie_le();

create or replace trigger trg_stats_globales_modifie_le
  before update on public.stats_globales
  for each row execute function public.set_modifie_le();

-- ============================================================
-- 8. TRIGGER auto-création profil à l'inscription
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  prenom_val text;
  nom_val    text;
begin
  prenom_val := coalesce(
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'first_name',
    split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1),
    ''
  );
  nom_val := coalesce(
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'last_name',
    split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 2),
    ''
  );

  insert into public.profils (id, prenom, nom, email, langue_interface, cree_le, modifie_le)
  values (
    new.id,
    prenom_val,
    nom_val,
    coalesce(new.email, ''),
    'fr',
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 9. RPC incrementer_stat_cv
-- ============================================================
create or replace function public.incrementer_stat_cv(
  p_short_code  text,
  p_type_stat   text,
  p_secondes    integer default 0
)
returns void language plpgsql security definer set search_path = public as $$
begin
  case p_type_stat
    when 'scan' then
      update public.cvs set stat_scans = stat_scans + 1
        where short_code = p_short_code;
    when 'temps_page' then
      update public.cvs set stat_temps_moyen_page_secondes =
        case when stat_scans = 0 then p_secondes
             else ((stat_temps_moyen_page_secondes * stat_scans) + p_secondes) / (stat_scans + 1)
        end
        where short_code = p_short_code;
    when 'audio_demarre' then
      update public.cvs set stat_audio_demarrages = stat_audio_demarrages + 1
        where short_code = p_short_code;
    when 'audio_complet' then
      update public.cvs set stat_audio_completes = stat_audio_completes + 1
        where short_code = p_short_code;
    when 'temps_audio' then
      -- Enregistrement du temps audio (pas de colonne dédiée, on l'ignore silencieusement)
      null;
    when 'clic_voir_cv' then
      update public.cvs set stat_clics_voir_cv = stat_clics_voir_cv + 1
        where short_code = p_short_code;
    when 'clic_echange' then
      update public.cvs set stat_clics_echange = stat_clics_echange + 1
        where short_code = p_short_code;
    when 'clic_retour' then
      update public.cvs set stat_clics_retour = stat_clics_retour + 1
        where short_code = p_short_code;
    when 'clic_email' then
      update public.cvs set stat_clics_email = stat_clics_email + 1
        where short_code = p_short_code;
    when 'clic_whatsapp' then
      update public.cvs set stat_clics_whatsapp = stat_clics_whatsapp + 1
        where short_code = p_short_code;
    when 'clic_linkedin' then
      update public.cvs set stat_clics_linkedin = stat_clics_linkedin + 1
        where short_code = p_short_code;
    when 'clic_instagram' then
      update public.cvs set stat_clics_instagram = stat_clics_instagram + 1
        where short_code = p_short_code;
    when 'clic_site_web' then
      update public.cvs set stat_clics_site_web = stat_clics_site_web + 1
        where short_code = p_short_code;
    else
      -- type inconnu, on ignore silencieusement
      null;
  end case;
end;
$$;

-- ============================================================
-- 10. INDEX
-- ============================================================
create index if not exists idx_cvs_utilisateur_id    on public.cvs(utilisateur_id);
create index if not exists idx_cvs_short_code        on public.cvs(short_code);
create index if not exists idx_cvs_poste_id          on public.cvs(poste_id);
create index if not exists idx_cvs_secteur_id        on public.cvs(secteur_id);
create index if not exists idx_nfc_cv_code_court     on public.nfc_cv(code_court);
create index if not exists idx_nfc_cv_utilisateur_id on public.nfc_cv(utilisateur_id);
create index if not exists idx_nfc_cv_cv_id          on public.nfc_cv(cv_id);
create index if not exists idx_postes_utilisateur_id on public.postes(utilisateur_id);
create index if not exists idx_secteurs_utilisateur_id on public.secteurs(utilisateur_id);
create index if not exists idx_stats_globales_utilisateur_id on public.stats_globales(utilisateur_id);

-- ============================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================

-- profils
alter table public.profils enable row level security;

create policy "Lecture profil propre" on public.profils
  for select using (auth.uid() = id);

create policy "Modification profil propre" on public.profils
  for update using (auth.uid() = id);

-- cvs
alter table public.cvs enable row level security;

create policy "Lecture CVs propres" on public.cvs
  for select using (auth.uid() = utilisateur_id or est_public = true);

create policy "Insertion CVs propres" on public.cvs
  for insert with check (auth.uid() = utilisateur_id);

create policy "Modification CVs propres" on public.cvs
  for update using (auth.uid() = utilisateur_id);

create policy "Suppression CVs propres" on public.cvs
  for delete using (auth.uid() = utilisateur_id);

-- secteurs
alter table public.secteurs enable row level security;

create policy "Lecture secteurs" on public.secteurs
  for select using (utilisateur_id is null or auth.uid() = utilisateur_id);

create policy "Insertion secteurs propres" on public.secteurs
  for insert with check (auth.uid() = utilisateur_id);

create policy "Modification secteurs propres" on public.secteurs
  for update using (auth.uid() = utilisateur_id);

create policy "Suppression secteurs propres" on public.secteurs
  for delete using (auth.uid() = utilisateur_id);

-- postes
alter table public.postes enable row level security;

create policy "Lecture postes" on public.postes
  for select using (utilisateur_id is null or auth.uid() = utilisateur_id);

create policy "Insertion postes propres" on public.postes
  for insert with check (auth.uid() = utilisateur_id);

create policy "Modification postes propres" on public.postes
  for update using (auth.uid() = utilisateur_id);

create policy "Suppression postes propres" on public.postes
  for delete using (auth.uid() = utilisateur_id);

-- nfc_cv
alter table public.nfc_cv enable row level security;

create policy "Lecture NFC propre" on public.nfc_cv
  for select using (auth.uid() = utilisateur_id);

create policy "Insertion NFC propre" on public.nfc_cv
  for insert with check (auth.uid() = utilisateur_id);

create policy "Modification NFC propre" on public.nfc_cv
  for update using (auth.uid() = utilisateur_id);

create policy "Suppression NFC propre" on public.nfc_cv
  for delete using (auth.uid() = utilisateur_id);

-- stats_globales
alter table public.stats_globales enable row level security;

create policy "Lecture stats propres" on public.stats_globales
  for select using (auth.uid() = utilisateur_id);

create policy "Modification stats propres" on public.stats_globales
  for all using (auth.uid() = utilisateur_id);

-- ============================================================
-- 12. PERMISSIONS RPC (accès anonyme pour les stats publiques)
-- ============================================================
grant execute on function public.incrementer_stat_cv(text, text, integer) to anon, authenticated;

-- ============================================================
-- 13. STORAGE BUCKETS
-- Exécuter ces commandes via l'API REST ou l'interface Supabase :
--
-- POST https://<project>.supabase.co/storage/v1/bucket
-- Headers: apikey: SERVICE_ROLE_KEY, Authorization: Bearer SERVICE_ROLE_KEY
-- Body: {"id":"cvs-files","name":"cvs-files","public":true}
--
-- POST https://<project>.supabase.co/storage/v1/bucket
-- Body: {"id":"audio-files","name":"audio-files","public":true}
--
-- Ou via PowerShell :
-- $headers = @{ "apikey" = "SERVICE_ROLE_KEY"; "Authorization" = "Bearer SERVICE_ROLE_KEY"; "Content-Type" = "application/json" }
-- Invoke-RestMethod -Uri "https://lsjgnunqzaogphstainl.supabase.co/storage/v1/bucket" -Method POST -Headers $headers -Body '{"id":"cvs-files","name":"cvs-files","public":true}'
-- Invoke-RestMethod -Uri "https://lsjgnunqzaogphstainl.supabase.co/storage/v1/bucket" -Method POST -Headers $headers -Body '{"id":"audio-files","name":"audio-files","public":true}'
-- ============================================================
