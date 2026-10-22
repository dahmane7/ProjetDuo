-- Duo · schéma Supabase (US02 · SCRUM-12)
-- Tables, contraintes et règles d'accès (RLS). À jouer dans l'éditeur SQL de Supabase.
-- Le script est rejouable : on peut le relancer après chaque modification.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Un profil par compte Supabase Auth, créé automatiquement à l'inscription (voir trigger plus bas)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'membre' check (role in ('membre', 'commercant')),
  prenom text,
  created_at timestamptz not null default now()
);

-- Abonnement d'un membre : un seul par compte
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  statut text not null default 'active' check (statut in ('active', 'annulee')),
  debut timestamptz not null default now(),
  fin timestamptz,
  created_at timestamptz not null default now()
);

-- Fiche commerce : un seul commerce par compte commerçant
-- Catégories RG11 : même liste que CATEGORIES dans src/lib/categories.js
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  nom text not null,
  categorie text not null check (
    categorie in ('Restaurant', 'Café et boulangerie', 'Beauté et bien-être', 'Loisirs', 'Commerce')
  ),
  ville text,
  adresse text,
  description text,
  photo text, -- identifiant de photo Unsplash, comme dans src/lib/exemples.js
  created_at timestamptz not null default now()
);

-- Code à 4 chiffres du commerçant, haché (pgcrypto).
-- Lisible par personne : seules definir_code et valider_offre (security definer) y accèdent.
create table if not exists public.merchant_secrets (
  merchant_id uuid primary key references public.merchants (id) on delete cascade,
  pin_hash text not null,
  updated_at timestamptz not null default now()
);

-- Offres « 1 acheté = 1 offert ». jours : jours ISO où l'offre est valable, lundi = 1 … dimanche = 7
-- (comme extract(isodow …) et JOURS dans src/lib/categories.js)
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  titre text not null,
  description text,
  economie numeric(6, 2) check (economie >= 0), -- euros économisés par utilisation
  jours smallint[] not null check (
    cardinality(jours) > 0 and jours <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]
  ),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Utilisations validées en caisse. Écrite uniquement par valider_offre.
-- Pas de suppression en cascade : une offre déjà utilisée se désactive (active = false).
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists offers_merchant_id_idx on public.offers (merchant_id);
create index if not exists redemptions_offer_id_idx on public.redemptions (offer_id);
create index if not exists redemptions_user_id_idx on public.redemptions (user_id);

-- ---------------------------------------------------------------------------
-- Création du profil à l'inscription
-- Le rôle et le prénom peuvent être passés dans options.data de supabase.auth.signUp
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, prenom)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'commercant' then 'commercant' else 'membre' end,
    new.raw_user_meta_data ->> 'prenom'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Sécurité au niveau des lignes (RLS) : activée sur toutes les tables
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.merchants enable row level security;
alter table public.merchant_secrets enable row level security;
alter table public.offers enable row level security;
alter table public.redemptions enable row level security;

-- profiles : chacun lit et modifie son propre profil
drop policy if exists "profil lisible par son titulaire" on public.profiles;
create policy "profil lisible par son titulaire" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profil modifiable par son titulaire" on public.profiles;
create policy "profil modifiable par son titulaire" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- subscriptions : le membre lit son propre abonnement.
-- Écriture uniquement par activer_abonnement (US04), qui calcule la date de fin :
-- un membre ne peut pas s'écrire lui-même un abonnement.
drop policy if exists "abonnement lisible par son titulaire" on public.subscriptions;
create policy "abonnement lisible par son titulaire" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "abonnement créé par son titulaire" on public.subscriptions;
drop policy if exists "abonnement modifiable par son titulaire" on public.subscriptions;

-- merchants : visibles par tous les connectés (catalogue), gérés par leur propriétaire
drop policy if exists "commerces visibles par les connectés" on public.merchants;
create policy "commerces visibles par les connectés" on public.merchants
  for select to authenticated using (true);

drop policy if exists "commerce créé par son propriétaire" on public.merchants;
create policy "commerce créé par son propriétaire" on public.merchants
  for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists "commerce modifiable par son propriétaire" on public.merchants;
create policy "commerce modifiable par son propriétaire" on public.merchants
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Droits de l'API : les nouvelles tables ne sont pas exposées automatiquement,
-- on accorde aux utilisateurs connectés uniquement les opérations couvertes par une policy.
-- Aucun droit pour anon : l'application demande une connexion.
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
revoke insert, update, delete on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update on public.merchants to authenticated;
grant select, insert, update, delete on public.offers to authenticated;
grant select on public.redemptions to authenticated;

-- merchant_secrets : aucune policy, et aucun droit pour les rôles de l'API
revoke all on public.merchant_secrets from anon, authenticated;

-- offers : offres actives visibles par tous les connectés ; le propriétaire voit et gère toutes les siennes
drop policy if exists "offres visibles" on public.offers;
create policy "offres visibles" on public.offers
  for select to authenticated using (
    active
    or exists (
      select 1 from public.merchants m
      where m.id = offers.merchant_id and m.owner_id = (select auth.uid())
    )
  );

drop policy if exists "offre créée par le propriétaire du commerce" on public.offers;
create policy "offre créée par le propriétaire du commerce" on public.offers
  for insert to authenticated with check (
    exists (
      select 1 from public.merchants m
      where m.id = offers.merchant_id and m.owner_id = (select auth.uid())
    )
  );

drop policy if exists "offre modifiable par le propriétaire du commerce" on public.offers;
create policy "offre modifiable par le propriétaire du commerce" on public.offers
  for update to authenticated
  using (
    exists (
      select 1 from public.merchants m
      where m.id = offers.merchant_id and m.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.merchants m
      where m.id = offers.merchant_id and m.owner_id = (select auth.uid())
    )
  );

drop policy if exists "offre supprimable par le propriétaire du commerce" on public.offers;
create policy "offre supprimable par le propriétaire du commerce" on public.offers
  for delete to authenticated using (
    exists (
      select 1 from public.merchants m
      where m.id = offers.merchant_id and m.owner_id = (select auth.uid())
    )
  );

-- redemptions : lecture par le membre concerné ou par le commerçant de l'offre.
-- Aucune policy d'écriture : seule valider_offre (security definer) insère.
drop policy if exists "utilisations visibles par le membre ou le commerçant" on public.redemptions;
create policy "utilisations visibles par le membre ou le commerçant" on public.redemptions
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.offers o
      join public.merchants m on m.id = o.merchant_id
      where o.id = redemptions.offer_id and m.owner_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- US04 · Activer son abonnement (paiement simulé)
-- 12 mois à partir de maintenant, un seul abonnement actif par membre (RG02).
-- La ligne est réutilisée à chaque réabonnement (user_id est unique).
-- ---------------------------------------------------------------------------

create or replace function public.activer_abonnement()
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  abonnement public.subscriptions;
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'membre'
  ) then
    raise exception 'reserve_aux_membres' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.subscriptions
    where user_id = auth.uid() and statut = 'active' and (fin is null or fin > now())
  ) then
    raise exception 'deja_abonne' using errcode = 'P0001';
  end if;

  insert into public.subscriptions (user_id, statut, debut, fin)
  values (auth.uid(), 'active', now(), now() + interval '12 months')
  on conflict (user_id) do update
    set statut = 'active', debut = excluded.debut, fin = excluded.fin
  returning * into abonnement;

  return abonnement;
end;
$$;

revoke execute on function public.activer_abonnement() from public, anon;
grant execute on function public.activer_abonnement() to authenticated;

-- Tests (éditeur SQL, en se faisant passer pour un membre puis un commerçant) :
--   select set_config('request.jwt.claims', '{"sub":"<id d''un membre>","role":"authenticated"}', true);
--   select public.activer_abonnement();  -- 1er appel : abonnement créé, fin = now() + 12 mois
--   select public.activer_abonnement();  -- 2e appel : erreur deja_abonne
--   select set_config('request.jwt.claims', '{"sub":"<id d''un commerçant>","role":"authenticated"}', true);
--   select public.activer_abonnement();  -- erreur reserve_aux_membres

-- ---------------------------------------------------------------------------
-- US05 · Fiche du commerce et code à 4 chiffres (RG08, RG09)
-- Le code n'est stocké que haché (bcrypt, pgcrypto) et ne peut jamais être relu.
-- Sur Supabase, pgcrypto est installée dans le schéma extensions.
-- ---------------------------------------------------------------------------

alter table public.merchants drop constraint if exists merchants_description_longueur;
alter table public.merchants
  add constraint merchants_description_longueur check (char_length(description) <= 300);

create or replace function public.definir_code(pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  commerce_id uuid;
begin
  if pin is null or pin !~ '^[0-9]{4}$' then
    raise exception 'code_invalide' using errcode = 'P0001';
  end if;

  select id into commerce_id from public.merchants where owner_id = auth.uid();
  if commerce_id is null then
    raise exception 'fiche_absente' using errcode = 'P0001';
  end if;

  insert into public.merchant_secrets (merchant_id, pin_hash, updated_at)
  values (commerce_id, crypt(pin, gen_salt('bf')), now())
  on conflict (merchant_id) do update
    set pin_hash = excluded.pin_hash, updated_at = excluded.updated_at;
end;
$$;

-- Le commerçant connecté a-t-il déjà un code ? (merchant_secrets reste illisible)
create or replace function public.code_defini()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.merchant_secrets s
    join public.merchants m on m.id = s.merchant_id
    where m.owner_id = auth.uid()
  );
$$;

revoke execute on function public.definir_code(text) from public, anon;
revoke execute on function public.code_defini() from public, anon;
grant execute on function public.definir_code(text) to authenticated;
grant execute on function public.code_defini() to authenticated;

-- Tests (éditeur SQL, en se faisant passer pour un commerçant qui a une fiche) :
--   select set_config('request.jwt.claims', '{"sub":"<id d''un commerçant>","role":"authenticated"}', true);
--   select public.definir_code('12a');   -- erreur code_invalide
--   select public.definir_code('4821');  -- ok
--   select public.code_defini();         -- true
--   select pin_hash from public.merchant_secrets;  -- un haché $2a$…, jamais 4821

-- ---------------------------------------------------------------------------
-- US08 · Catalogue public (membres et visiteurs, RG03)
-- Un visiteur non connecté voit les offres actives et leur commerce.
-- merchant_secrets, subscriptions et redemptions restent fermés à anon.
-- ---------------------------------------------------------------------------

drop policy if exists "offres actives visibles par les visiteurs" on public.offers;
create policy "offres actives visibles par les visiteurs" on public.offers
  for select to anon using (active);

drop policy if exists "commerces visibles par les visiteurs" on public.merchants;
create policy "commerces visibles par les visiteurs" on public.merchants
  for select to anon using (true);

grant select on public.offers, public.merchants to anon;

-- ---------------------------------------------------------------------------
-- US06 · Créer et gérer ses offres « 1 acheté = 1 offert »
-- Les policies d'US02 couvrent déjà l'écriture des offres par le propriétaire du commerce.
-- Ici : le nombre d'utilisations par membre (RG06) et les bornes des champs du formulaire.
-- Une offre déjà utilisée ne se supprime pas (redemptions.offer_id sans cascade) : elle se
-- désactive (RG10, active = false) et disparaît du catalogue, ses utilisations restent comptées.
-- ---------------------------------------------------------------------------

-- RG06 : nombre maximum d'utilisations de cette offre par membre, en tout.
-- valider_offre (US10) devra refuser au-delà : count(redemptions du membre pour l'offre) >= max_par_membre
alter table public.offers add column if not exists max_par_membre smallint not null default 1;

alter table public.offers drop constraint if exists offers_max_par_membre_check;
alter table public.offers add constraint offers_max_par_membre_check
  check (max_par_membre between 1 and 10);

-- Titre : 3 à 80 caractères. Conditions (description) : 200 au plus.
alter table public.offers drop constraint if exists offers_titre_longueur;
alter table public.offers add constraint offers_titre_longueur
  check (char_length(titre) between 3 and 80);

alter table public.offers drop constraint if exists offers_conditions_longueur;
alter table public.offers add constraint offers_conditions_longueur
  check (char_length(description) <= 200);

-- RG07 : valeur de l'article offert, en euros, obligatoire. `not valid` : les lignes déjà en base
-- ne sont pas revérifiées, la règle s'applique à toute création ou modification.
alter table public.offers drop constraint if exists offers_economie_requise;
alter table public.offers add constraint offers_economie_requise
  check (economie is not null and economie > 0) not valid;

-- Tests (éditeur SQL, en se faisant passer pour un commerçant qui a une fiche) :
--   select set_config('request.jwt.claims', '{"sub":"<id d''un commerçant>","role":"authenticated"}', true);
--   set local role authenticated;
--   insert into public.offers (merchant_id, titre, economie, jours)
--     select id, 'ab', 10, '{1}' from public.merchants where owner_id = auth.uid();          -- refus : titre trop court
--   insert into public.offers (merchant_id, titre, description, economie, jours)
--     select id, '1 plat acheté = 1 plat offert', repeat('x', 201), 10, '{1}'
--     from public.merchants where owner_id = auth.uid();                                       -- refus : conditions > 200
--   insert into public.offers (merchant_id, titre, economie, jours)
--     select id, '1 plat acheté = 1 plat offert', 10, '{}' from public.merchants where owner_id = auth.uid();  -- refus : aucun jour
--   insert into public.offers (merchant_id, titre, economie, jours, max_par_membre)
--     select id, '1 plat acheté = 1 plat offert', 10, '{1}', 0 from public.merchants where owner_id = auth.uid();  -- refus : max 0
--   insert into public.offers (merchant_id, titre, economie, jours)
--     select id, '1 plat acheté = 1 plat offert', 0, '{1}' from public.merchants where owner_id = auth.uid();  -- refus : valeur 0
--   insert into public.offers (merchant_id, titre, economie, jours)
--     select id, '1 plat acheté = 1 plat offert', 12.5, '{1,2,3}' from public.merchants where owner_id = auth.uid();  -- ok

-- ---------------------------------------------------------------------------
-- US07 · Suivre les utilisations de ses offres
-- Numéro de validation + tableau de bord du commerçant (30 derniers jours).
-- ---------------------------------------------------------------------------

-- Numéro de validation d'une utilisation : attribué seul à l'insertion, donc par valider_offre (US10),
-- qui pourra le renvoyer au membre. Les lignes déjà en base reçoivent un numéro.
alter table public.redemptions add column if not exists numero bigint generated always as identity;
create unique index if not exists redemptions_numero_key on public.redemptions (numero);

-- Tout le tableau de bord en un appel : total des 30 derniers jours, par offre, par jour de la semaine
-- (lundi = 1 … dimanche = 7, en heure de Paris, 0 quand il n'y a rien) et les 20 dernières utilisations.
-- security invoker : la RLS d'US02 s'applique, un commerçant ne voit que les utilisations de ses offres.
-- Les offres désactivées figurent dans la liste : leurs utilisations passées restent comptées.
create or replace function public.tableau_de_bord()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with mes_offres as (
    select o.id, o.titre, o.active, o.created_at
    from public.offers o
    join public.merchants m on m.id = o.merchant_id
    where m.owner_id = auth.uid()
  ),
  utilisations as (
    select r.numero, r.created_at, o.id as offer_id, o.titre
    from public.redemptions r
    join mes_offres o on o.id = r.offer_id
  ),
  recentes as (
    select * from utilisations where created_at >= now() - interval '30 days'
  )
  select jsonb_build_object(
    'total', (select count(*) from recentes),
    'par_offre', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', o.id, 'titre', o.titre, 'active', o.active,
          'utilisations', (select count(*) from recentes r where r.offer_id = o.id)
        )
        order by o.created_at desc
      )
      from mes_offres o
    ), '[]'::jsonb),
    'par_jour', (
      select jsonb_agg(
        jsonb_build_object(
          'jour', j,
          'utilisations', (
            select count(*) from recentes r
            where extract(isodow from r.created_at at time zone 'Europe/Paris') = j
          )
        )
        order by j
      )
      from generate_series(1, 7) as j
    ),
    'dernieres', coalesce((
      select jsonb_agg(
        jsonb_build_object('numero', d.numero, 'created_at', d.created_at, 'titre', d.titre)
        order by d.created_at desc, d.numero desc
      )
      from (select * from utilisations order by created_at desc, numero desc limit 20) d
    ), '[]'::jsonb)
  );
$$;

revoke execute on function public.tableau_de_bord() from public, anon;
grant execute on function public.tableau_de_bord() to authenticated;

-- Tests (éditeur SQL) : supabase/seed-utilisations.sql fabrique des utilisations pour un commerce de test.
--   select set_config('request.jwt.claims', '{"sub":"<id du commerçant>","role":"authenticated"}', true);
--   set local role authenticated;
--   select public.tableau_de_bord();
--     -- commerçant sans utilisation : total 0, par_offre avec des 0, par_jour = sept lignes à 0, dernieres = []
--     -- avec utilisations : total = somme de par_offre = somme de par_jour ; dernieres triées, la plus récente en premier
--   select set_config('request.jwt.claims', '{"sub":"<id d''un membre>","role":"authenticated"}', true);
--   select public.tableau_de_bord();
--     -- membre (ou autre commerçant) : aucune utilisation d'un commerce qui n'est pas le sien, total 0

-- ---------------------------------------------------------------------------
-- US09 · Utilisations restantes d'une offre pour le membre connecté (RG06, règle d'US06) :
-- max_par_membre moins ses utilisations de cette offre, en tout.
-- security invoker : la RLS de redemptions ne laisse compter que ses propres utilisations.
-- valider_offre (US10) applique la même limite.
-- ---------------------------------------------------------------------------

create or replace function public.utilisations_restantes(offre uuid)
returns int
language sql
stable
security invoker
set search_path = public
as $$
  select greatest(
    0,
    o.max_par_membre - (
      select count(*) from public.redemptions r
      where r.offer_id = o.id and r.user_id = auth.uid()
    )
  )::int
  from public.offers o
  where o.id = offre;
$$;

revoke execute on function public.utilisations_restantes(uuid) from public, anon;
grant execute on function public.utilisations_restantes(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- US10 · Valider une offre en caisse avec le code du commerçant
-- Seul chemin d'écriture dans redemptions. Quatre contrôles, dans l'ordre :
--   1. abonnement actif du membre (US04)     -> abonnement_inactif
--   2. offre active, valable aujourd'hui (RG05, jour de Paris) -> offre_non_valable
--   3. limite du membre pour l'offre (RG06, max_par_membre)    -> limite_atteinte
--   4. code du commerçant (haché par definir_code, RG08)       -> code_incorrect
-- Rien n'est enregistré si l'un d'eux échoue.
-- ---------------------------------------------------------------------------

create or replace function public.valider_offre(offre uuid, pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  o record;
  r public.redemptions;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'membre') then
    raise exception 'reserve_aux_membres' using errcode = 'P0001';
  end if;

  select x.id, x.titre, x.economie, x.jours, x.active, x.max_par_membre,
         m.id as merchant_id, m.nom as commerce
    into o
  from public.offers x
  join public.merchants m on m.id = x.merchant_id
  where x.id = offre;
  if not found then
    raise exception 'offre_introuvable' using errcode = 'P0001';
  end if;

  -- Deux validations simultanées du même membre sur la même offre passent l'une après l'autre
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text || offre::text));

  -- 1. Abonnement actif
  if not exists (
    select 1 from public.subscriptions
    where user_id = auth.uid() and statut = 'active' and (fin is null or fin > now())
  ) then
    raise exception 'abonnement_inactif' using errcode = 'P0001';
  end if;

  -- 2. Offre active et valable aujourd'hui (lundi = 1, heure de Paris)
  if not o.active
     or not (extract(isodow from now() at time zone 'Europe/Paris')::smallint = any (o.jours)) then
    raise exception 'offre_non_valable' using errcode = 'P0001';
  end if;

  -- 3. Limite d'utilisation du membre pour cette offre
  if (select count(*) from public.redemptions
      where offer_id = offre and user_id = auth.uid()) >= o.max_par_membre then
    raise exception 'limite_atteinte' using errcode = 'P0001';
  end if;

  -- 4. Code du commerçant
  if pin is null or pin !~ '^[0-9]{4}$' or not exists (
    select 1 from public.merchant_secrets
    where merchant_id = o.merchant_id and pin_hash = crypt(pin, pin_hash)
  ) then
    raise exception 'code_incorrect' using errcode = 'P0001';
  end if;

  insert into public.redemptions (offer_id, user_id)
  values (offre, auth.uid())
  returning * into r;

  return jsonb_build_object(
    'numero', r.numero,
    'created_at', r.created_at,
    'economie', o.economie,
    'commerce', o.commerce,
    'titre', o.titre
  );
end;
$$;

revoke execute on function public.valider_offre(uuid, text) from public, anon;
grant execute on function public.valider_offre(uuid, text) to authenticated;

-- Personne n'écrit dans redemptions sans passer par valider_offre (pas de policy d'écriture,
-- et pas de droit d'écriture pour les rôles de l'API)
revoke insert, update, delete on public.redemptions from anon, authenticated;

-- Tests des quatre refus (éditeur SQL ; begin … rollback pour ne rien laisser en base).
-- <membre> : id d'un membre ; <offre> : offre d'un commerce dont on connaît le code <code>.
--   begin;
--   select set_config('request.jwt.claims', '{"sub":"<membre>","role":"authenticated"}', true);
--   -- 1. abonnement_inactif : membre sans abonnement actif
--   select public.valider_offre('<offre>', '<code>');
--   -- 2. offre_non_valable : offre dont jours ne contient pas le jour courant (ou active = false)
--   select public.valider_offre('<offre pas valable aujourd''hui>', '<code>');
--   -- 3. limite_atteinte : après max_par_membre validations réussies
--   select public.valider_offre('<offre>', '<code>');  -- ok, renvoie numero, created_at, economie
--   select public.valider_offre('<offre>', '<code>');  -- limite_atteinte si max_par_membre = 1
--   -- 4. code_incorrect : mauvais code ; aucune ligne ajoutée dans redemptions
--   select public.valider_offre('<autre offre>', '0000');
--   rollback;
-- Accès directs refusés (en tant que membre, depuis l'API) :
--   insert into public.redemptions … -> permission denied ; select * from public.merchant_secrets -> permission denied

-- Recharge le cache de l'API pour qu'elle voie les tables et les droits ci-dessus
notify pgrst, 'reload schema';
