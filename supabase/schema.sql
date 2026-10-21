-- Schéma Duo : tables, RLS et fonctions SQL.
-- Toute modification se fait ici, puis est jouée dans l'éditeur SQL de Supabase.

-- ---------------------------------------------------------------------------
-- US03 · Inscription et connexion
-- À fusionner avec le bloc profiles d'US02 : si US02 crée déjà la table,
-- ne garder que la fonction creer_profil et son trigger.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (length(trim(prenom)) > 0),
  role text not null check (role in ('membre', 'commercant')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profil lisible par son propriétaire" on public.profiles;
create policy "profil lisible par son propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

-- Crée le profil à partir des métadonnées passées à signUp (prénom, rôle).
-- Si le rôle ou le prénom est invalide, l'insertion échoue et le compte
-- n'est pas créé (RG01).
create or replace function public.creer_profil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, prenom, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'role'
  );
  return new;
end;
$$;

drop trigger if exists creer_profil_apres_inscription on auth.users;
create trigger creer_profil_apres_inscription
  after insert on auth.users
  for each row execute function public.creer_profil();
