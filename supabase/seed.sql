-- Duo · offres de test (US08, en attendant la création d'offres d'US06)
-- À jouer dans l'éditeur SQL de Supabase APRÈS schema.sql. Rejouable : rien n'est créé deux fois.
-- Reprend les offres d'exemple de la maquette : 10 commerces, une offre active chacun,
-- plus une offre inactive qui ne doit jamais apparaître dans le catalogue.
-- Les comptes commerçants n'ont pas de mot de passe : on ne peut pas s'y connecter.
-- Pour tout retirer : delete from auth.users where email like 'commercant.demo.%@duo.test';
--
-- Un bloc do et non une table temporaire : l'éditeur Supabase signale toute « table sans RLS »
-- et, avec « Run and enable RLS », vise public.seed_duo (inexistante) : erreur 42P01.

do $$
declare s record;
begin
  for s in
    select * from (values
      (1, 'Le Bistrot du coin', 'Restaurant', 'Lyon 2e', '14 rue Mercière',
       'Un plat du jour acheté, le second offert', 16, '{1,2,3,4,5}'::smallint[], '1517248135467-4c7edcad34c4'),
      (2, 'Pizza Mamma', 'Restaurant', 'Lyon 7e', '52 avenue Jean Jaurès',
       'Une pizza achetée, la seconde offerte', 13, '{2,4,6}'::smallint[], '1513104890138-7c749659a591'),
      (3, 'Maison Fournil', 'Café et boulangerie', 'Lyon 1er', '8 place Sathonay',
       'Un pain de campagne acheté, le second offert', 4, '{1,2,3,4,5,6,7}'::smallint[], '1509440159596-0249088772ff'),
      (4, 'Atelier Coiffure Lina', 'Beauté et bien-être', 'Villeurbanne', '31 cours Émile Zola',
       'Un brushing acheté, le second offert', 28, '{3,4,5}'::smallint[], '1560066984-138dadb4c035'),
      (5, 'Le Coffre à Jeux', 'Loisirs', 'Lyon 3e', '120 cours Gambetta',
       'Une soirée jeux achetée, la seconde offerte', 8, '{1,2,3,4}'::smallint[], '1585504198199-20277593b94f'),
      (6, 'Bol Vert', 'Restaurant', 'Lyon 6e', '27 rue Bossuet',
       'Un bol acheté, le second offert', 12, '{6,7}'::smallint[], '1512621776951-a57141f2eefd'),
      (7, 'Fleurs de Saison', 'Commerce', 'Lyon 4e', '5 boulevard de la Croix-Rousse',
       'Un bouquet acheté, le second offert', 20, '{2,3,4,5,6}'::smallint[], '1490750967868-88aa4486c946'),
      (8, 'Spa Les Bains', 'Beauté et bien-être', 'Lyon 6e', '44 boulevard des Belges',
       'Un massage acheté, le second offert', 55, '{1,2,3}'::smallint[], '1544161515-4ab6ce6db874'),
      (9, 'Brunch & Co', 'Restaurant', 'Lyon 1er', '3 quai de la Pêcherie',
       'Un brunch acheté, le second offert', 24, '{6,7}'::smallint[], '1504754524776-8f4f37790ca0'),
      (10, 'Café des Pentes', 'Café et boulangerie', 'Lyon 1er', '19 montée de la Grande Côte',
       'Un cappuccino acheté, le second offert', 4, '{1,2,3,4,5}'::smallint[], '1495474472287-4d71bcdd2085')
    ) as t(n, nom, categorie, ville, adresse, titre, economie, jours, photo)
  loop
    -- Compte commerçant (le trigger handle_new_user crée son profil « commercant »).
    -- Les jetons vides évitent une erreur de l'écran Authentication sur les champs NULL.
    insert into auth.users (
      instance_id, id, aud, role, email, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      ('00000000-0000-4000-a000-' || lpad(s.n::text, 12, '0'))::uuid,
      'authenticated', 'authenticated',
      'commercant.demo.' || s.n || '@duo.test', now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('prenom', 'Démo ' || s.n, 'role', 'commercant'),
      now(), now(), '', '', '', ''
    ) on conflict (id) do nothing;

    insert into public.merchants (id, owner_id, nom, categorie, ville, adresse, description, photo)
    values (
      ('00000000-0000-4000-b000-' || lpad(s.n::text, 12, '0'))::uuid,
      ('00000000-0000-4000-a000-' || lpad(s.n::text, 12, '0'))::uuid,
      s.nom, s.categorie, s.ville, s.adresse, 'Commerce de démonstration Duo.', s.photo
    ) on conflict (id) do nothing;

    insert into public.offers (id, merchant_id, titre, description, economie, jours, active)
    values (
      ('00000000-0000-4000-c000-' || lpad(s.n::text, 12, '0'))::uuid,
      ('00000000-0000-4000-b000-' || lpad(s.n::text, 12, '0'))::uuid,
      s.titre, 'Le deuxième article, identique ou de valeur égale, est offert.',
      s.economie, s.jours, true
    ) on conflict (id) do nothing;
  end loop;

  -- Offre désactivée : ne doit pas apparaître dans le catalogue
  insert into public.offers (id, merchant_id, titre, economie, jours, active)
  values (
    '00000000-0000-4000-c000-000000000099',
    '00000000-0000-4000-b000-000000000001',
    'Ancienne offre désactivée', 10, '{1,2,3,4,5,6,7}'::smallint[], false
  ) on conflict (id) do nothing;
end $$;
