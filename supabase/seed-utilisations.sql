-- Duo · utilisations de test (US07, en attendant la validation en caisse d'US10)
-- À jouer dans l'éditeur SQL de Supabase APRÈS schema.sql, pour le commerce du compte commerçant de test :
-- sans rien changer, le script prend le seul commerce qui n'est pas un commerce de démo (seed.sql).
-- S'il y en a plusieurs, ou pour viser un compte précis, mettez son e-mail dans email_commerce.
-- Rejouable : les utilisations de test sont supprimées puis recréées.
-- Fabrique des utilisations sur les 30 derniers jours, plus nombreuses le vendredi et le samedi,
-- par 5 comptes membres de démo. Ces comptes n'ont pas de mot de passe : on ne peut pas s'y connecter.
-- Pour tout retirer : delete from auth.users where email like 'membre.demo.%@duo.test';
--
-- Un bloc do et non une table temporaire : voir l'erreur 42P01 de « Run and enable RLS » (seed.sql).

do $$
declare
  -- Facultatif : l'e-mail du compte commerçant dont vous voulez voir le tableau de bord.
  -- Laissé vide, le script prend le seul commerce qui n'est pas un commerce de démo.
  email_commerce constant text := '';
  -- Poids de chaque jour (lundi = 1 … dimanche = 7) : plus il est haut, plus il y a d'utilisations
  poids constant numeric[] := array[0.3, 0.3, 0.4, 0.5, 1.0, 1.0, 0.6];
  commerce uuid;
  offre uuid;
  jour date;
  quand timestamptz;
  i int;
  essais int;
  nb_commerces int;
begin
  if email_commerce <> '' then
    select m.id into commerce
    from public.merchants m
    join auth.users u on u.id = m.owner_id
    where u.email = email_commerce;
    if commerce is null then
      raise exception 'Aucun commerce pour l''e-mail %. Vérifiez email_commerce en tête du script (ou laissez-le vide).', email_commerce;
    end if;
  else
    select count(*) into nb_commerces
    from public.merchants m
    join auth.users u on u.id = m.owner_id
    where u.email not like 'commercant.demo.%@duo.test';
    if nb_commerces = 0 then
      raise exception 'Aucun commerce réel : créez d''abord la fiche de votre commerce sur le site (compte commerçant), ou indiquez email_commerce.';
    elsif nb_commerces > 1 then
      raise exception '% commerces réels : indiquez l''e-mail du bon compte dans email_commerce, en tête du script.', nb_commerces;
    end if;
    select m.id into commerce
    from public.merchants m
    join auth.users u on u.id = m.owner_id
    where u.email not like 'commercant.demo.%@duo.test';
  end if;
  if not exists (select 1 from public.offers where merchant_id = commerce) then
    raise exception 'Ce commerce n''a aucune offre : créez-en une dans « Mes offres » d''abord.';
  end if;

  -- Cinq membres de démo (le trigger handle_new_user crée leur profil « membre »)
  for i in 1..5 loop
    insert into auth.users (
      instance_id, id, aud, role, email, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      ('00000000-0000-4000-d000-' || lpad(i::text, 12, '0'))::uuid,
      'authenticated', 'authenticated',
      'membre.demo.' || i || '@duo.test', now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('prenom', 'Membre démo ' || i, 'role', 'membre'),
      now(), now(), '', '', '', ''
    ) on conflict (id) do nothing;
  end loop;

  -- Rejouable : on repart des seules utilisations de test
  delete from public.redemptions
  where user_id in (select id from auth.users where email like 'membre.demo.%@duo.test');

  for i in 1..80 loop
    select id into offre from public.offers where merchant_id = commerce order by random() limit 1;

    -- Un jour des 30 derniers, tiré au sort puis accepté selon son poids (heure de Paris)
    essais := 0;
    loop
      jour := (now() at time zone 'Europe/Paris')::date - floor(random() * 30)::int;
      exit when random() < poids[extract(isodow from jour)::int];
      essais := essais + 1;
      exit when essais > 50;
    end loop;

    -- Entre 11 h et 21 h 59, heure de Paris ; pas d'utilisation dans le futur
    quand := (jour + make_interval(hours => 11 + floor(random() * 11)::int, mins => floor(random() * 60)::int))
             at time zone 'Europe/Paris';
    continue when quand > now();

    insert into public.redemptions (offer_id, user_id, created_at)
    values (
      offre,
      ('00000000-0000-4000-d000-' || lpad((1 + floor(random() * 5)::int)::text, 12, '0'))::uuid,
      quand
    );
  end loop;
end $$;
