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

-- subscriptions : le membre gère son propre abonnement
drop policy if exists "abonnement lisible par son titulaire" on public.subscriptions;
create policy "abonnement lisible par son titulaire" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "abonnement créé par son titulaire" on public.subscriptions;
create policy "abonnement créé par son titulaire" on public.subscriptions
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "abonnement modifiable par son titulaire" on public.subscriptions;
create policy "abonnement modifiable par son titulaire" on public.subscriptions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

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
