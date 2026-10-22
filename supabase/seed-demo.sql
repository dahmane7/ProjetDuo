-- Duo · données de démonstration (US12), en une seule exécution
-- À jouer dans l'éditeur SQL de Supabase APRÈS schema.sql : tout coller, Run. Rien à remplir.
-- Rejouable : sert aussi de remise à zéro juste avant la démo (les utilisations de démo sont supprimées
-- puis recréées, rien n'est créé deux fois). Indépendant de seed.sql et seed-utilisations.sql.
--
-- MOT DE PASSE ET CODE DE CAISSE : laissés vides (cas normal), le script les invente et les AFFICHE dans
-- le résultat, en dernière ligne (colonnes mot_de_passe et code_caisse) : notez-les avant de quitter la page.
-- Ils changent à chaque exécution (les comptes et le code sont mis à jour) : relancer le script juste avant
-- la démo donne donc de nouvelles valeurs. Pour les fixer, remplissez mot_de_passe (6 caractères au moins)
-- et code_caisse (4 chiffres) ci-dessous, DANS L'ÉDITEUR SUPABASE ; ne commitez jamais le fichier rempli.
-- Aucun mot de passe ni code n'est écrit dans le dépôt.
--
-- Ce que le script crée :
--   - Léa (lea.demo@duo.test), membre abonnée depuis 40 jours, avec un historique d'économies ;
--   - La Table Zen (table-zen.demo@duo.test), le restaurant du scénario : code caisse, offre valable tous
--     les jours, une offre désactivée, ~90 utilisations sur 30 jours pour remplir son tableau de bord ;
--   - Le Café du Lundi : offre valable le lundi seulement ;
--   - 5 commerces fictifs dans les autres catégories (dont un au nom très long, pour éprouver les 375 px) ;
--   - 12 membres de démo (client.demo.N@duo.test), auteurs des utilisations de La Table Zen.
-- Seuls Léa et La Table Zen ont un mot de passe : les autres comptes ne peuvent pas se connecter.
-- Léa n'a aucune utilisation à La Table Zen : la validation en caisse marche en direct (une fois, max_par_membre = 1).
--
-- Pour tout retirer :
--   delete from public.redemptions
--     where offer_id::text like '00000000-0000-4000-c000-0000000001%'
--        or user_id in (select id from auth.users where email like '%.demo@duo.test' or email like 'client.demo.%@duo.test');
--   delete from auth.users where email like '%.demo@duo.test' or email like 'client.demo.%@duo.test';
--   (les profils, commerces, offres et abonnements suivent par cascade ; les comptes de seed.sql ne sont pas touchés)
--
-- Un bloc do et non une table temporaire : l'éditeur Supabase signale toute « table sans RLS »
-- et, avec « Run and enable RLS », vise une table inexistante (erreur 42P01).
-- Identifiants fixes en …0101 et au-delà : pas de collision avec seed.sql (…0001 à …0010, …0099).

do $$
declare
  -- Facultatif, jamais dans le dépôt : laissés vides, le script les invente et les affiche en fin de résultat
  mot_de_passe text := '';  -- 6 caractères au moins, pour Léa et La Table Zen
  code_caisse  text := '';  -- 4 chiffres, code de caisse de La Table Zen

  lea constant uuid := '00000000-0000-4000-e000-000000000101';
  table_zen_compte constant uuid := '00000000-0000-4000-a000-000000000101';
  table_zen constant uuid := '00000000-0000-4000-b000-000000000101';
  table_zen_offre constant uuid := '00000000-0000-4000-c000-000000000101';
  -- Poids de chaque jour (lundi = 1 … dimanche = 7) : plus il est haut, plus il y a d'utilisations
  poids constant numeric[] := array[0.3, 0.3, 0.4, 0.5, 1.0, 1.0, 0.6];
  s record;
  c record;
  compte record;
  jour date;
  jours_offre smallint[];
  quand timestamptz;
  essais int;
  i int;
begin
  -- Valeurs choisies : contrôlées ; vides : inventées (octets aléatoires, indépendants de setseed plus bas)
  if mot_de_passe = '' then
    mot_de_passe := 'Duo-' || upper(encode(extensions.gen_random_bytes(4), 'hex'));
  elsif char_length(mot_de_passe) < 6 then
    raise exception 'mot_de_passe fait % caractère(s) : 6 au moins, ou laissez-le vide pour que le script en invente un.', char_length(mot_de_passe);
  end if;
  if code_caisse = '' then
    code_caisse := lpad(((('x' || encode(extensions.gen_random_bytes(2), 'hex'))::bit(16)::int) % 10000)::text, 4, '0');
  elsif code_caisse !~ '^[0-9]{4}$' then
    raise exception 'code_caisse doit faire exactement 4 chiffres (ou laissez-le vide pour que le script en invente un).';
  end if;
  -- Gardés le temps de la transaction pour la ligne de résultat finale
  perform set_config('duo.mot_de_passe', mot_de_passe, true);
  perform set_config('duo.code_caisse', code_caisse, true);

  -- Tirages au sort identiques d'une exécution à l'autre
  perform setseed(0.42);

  -- 1. Comptes commerçants, commerces et offres
  for s in
    select * from (values
      (101, 'table-zen.demo@duo.test', 'Hugo', 'La Table Zen', 'Restaurant', 'Lyon 2e', '9 rue des Marronniers',
       'Cuisine du marché, bols et plats mijotés.',
       '1 plat acheté = 1 plat offert', 18, '{1,2,3,4,5,6,7}'::smallint[], '1512621776951-a57141f2eefd'),
      (102, 'cafe-du-lundi.demo@duo.test', 'Démo', 'Le Café du Lundi', 'Café et boulangerie', 'Lyon 1er', '2 rue d''Algérie',
       'Le café qui rend le lundi plus doux.',
       '1 café acheté = 1 café offert', 3, '{1}'::smallint[], '1495474472287-4d71bcdd2085'),
      (103, 'institut-eclat.demo@duo.test', 'Démo', 'Institut Éclat', 'Beauté et bien-être', 'Lyon 6e', '18 rue Vendôme',
       'Soins du visage et manucure.',
       '1 manucure achetée = 1 manucure offerte', 25, '{2,3,4,5,6}'::smallint[], '1560066984-138dadb4c035'),
      (104, 'bains-du-rhone.demo@duo.test', 'Démo', 'Les Bains du Rhône', 'Beauté et bien-être', 'Lyon 7e', '40 quai Claude Bernard',
       'Hammam, sauna et massages.',
       '1 entrée hammam achetée = 1 entrée offerte', 30, '{1,2,3,4}'::smallint[], '1544161515-4ab6ce6db874'),
      (105, 'atelier-ceramique.demo@duo.test', 'Démo',
       'Atelier de Céramique et de Poterie Artisanale des Pentes de la Croix-Rousse', 'Loisirs', 'Lyon 4e',
       '27 rue d''Austerlitz', 'Initiation au tour et modelage, en petits groupes.',
       '1 cours d''initiation acheté = 1 cours offert', 35, '{3,6,7}'::smallint[], '1585504198199-20277593b94f'),
      (106, 'fleurs-saison.demo@duo.test', 'Démo', 'Fleurs de Saison', 'Commerce', 'Lyon 4e', '5 boulevard de la Croix-Rousse',
       'Bouquets de fleurs locales.',
       '1 bouquet acheté = 1 bouquet offert', 20, '{2,3,4,5,6}'::smallint[], '1490750967868-88aa4486c946'),
      (107, 'librairie-quai.demo@duo.test', 'Démo', 'La Librairie du Quai', 'Commerce', 'Lyon 5e', '12 quai Romain Rolland',
       'Romans, BD et livres jeunesse.',
       '1 livre de poche acheté = 1 livre offert', 8, '{1,2,3,4,5,6}'::smallint[], '1509440159596-0249088772ff')
    ) as t(n, email, prenom, nom, categorie, ville, adresse, description, titre, economie, jours, photo)
  loop
    -- Le trigger handle_new_user crée le profil « commercant ».
    -- Les jetons vides évitent une erreur de l'écran Authentication sur les champs NULL.
    insert into auth.users (
      instance_id, id, aud, role, email, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      ('00000000-0000-4000-a000-' || lpad(s.n::text, 12, '0'))::uuid,
      'authenticated', 'authenticated', s.email, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('prenom', s.prenom, 'role', 'commercant'),
      now(), now(), '', '', '', ''
    ) on conflict (id) do nothing;

    insert into public.merchants (id, owner_id, nom, categorie, ville, adresse, description, photo)
    values (
      ('00000000-0000-4000-b000-' || lpad(s.n::text, 12, '0'))::uuid,
      ('00000000-0000-4000-a000-' || lpad(s.n::text, 12, '0'))::uuid,
      s.nom, s.categorie, s.ville, s.adresse, s.description, s.photo
    ) on conflict (id) do update
      set nom = excluded.nom, categorie = excluded.categorie, ville = excluded.ville,
          adresse = excluded.adresse, description = excluded.description, photo = excluded.photo;

    insert into public.offers (id, merchant_id, titre, description, economie, jours, active, max_par_membre)
    values (
      ('00000000-0000-4000-c000-' || lpad(s.n::text, 12, '0'))::uuid,
      ('00000000-0000-4000-b000-' || lpad(s.n::text, 12, '0'))::uuid,
      s.titre, 'Le deuxième article, identique ou de valeur égale, est offert. Sur place uniquement.',
      s.economie, s.jours, true, 1
    ) on conflict (id) do update
      set titre = excluded.titre, description = excluded.description, economie = excluded.economie,
          jours = excluded.jours, active = true, max_par_membre = 1;
  end loop;

  -- Offre désactivée de La Table Zen : ne doit jamais apparaître dans le catalogue
  insert into public.offers (id, merchant_id, titre, economie, jours, active)
  values (
    '00000000-0000-4000-c000-000000000199', table_zen,
    'Menu d''été (terminé)', 15, '{1,2,3,4,5,6,7}'::smallint[], false
  ) on conflict (id) do update set active = false;

  -- 2. Comptes où l'on peut se connecter : Léa (membre) et La Table Zen (commerçant).
  -- Sans ligne dans auth.identities, la connexion par e-mail échoue.
  for compte in
    select * from (values
      (lea, 'lea.demo@duo.test', 'Léa', 'membre'),
      (table_zen_compte, 'table-zen.demo@duo.test', 'Hugo', 'commercant')
    ) as t(id, email, prenom, role)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', compte.id, 'authenticated', 'authenticated',
      compte.email, extensions.crypt(mot_de_passe, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('prenom', compte.prenom, 'role', compte.role),
      now(), now(), '', '', '', ''
    ) on conflict (id) do update
      set encrypted_password = excluded.encrypted_password,
          email_confirmed_at = excluded.email_confirmed_at, updated_at = now();

    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      compte.id::text, compte.id,
      jsonb_build_object('sub', compte.id::text, 'email', compte.email, 'email_verified', true),
      'email', now(), now(), now()
    ) on conflict (provider_id, provider) do update
      set identity_data = excluded.identity_data, updated_at = now();
  end loop;

  -- 3. Code de caisse de La Table Zen, haché comme dans definir_code
  insert into public.merchant_secrets (merchant_id, pin_hash, updated_at)
  values (table_zen, extensions.crypt(code_caisse, extensions.gen_salt('bf')), now())
  on conflict (merchant_id) do update set pin_hash = excluded.pin_hash, updated_at = now();

  -- 4. Abonnement de Léa : actif depuis 40 jours, pour 12 mois
  insert into public.subscriptions (user_id, statut, debut, fin)
  values (lea, 'active', now() - interval '40 days', now() - interval '40 days' + interval '12 months')
  on conflict (user_id) do update
    set statut = 'active', debut = excluded.debut, fin = excluded.fin;

  -- 5. Utilisations passées
  -- Douze membres de démo sans mot de passe (le trigger handle_new_user crée leur profil « membre »)
  for i in 1..12 loop
    insert into auth.users (
      instance_id, id, aud, role, email, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      ('00000000-0000-4000-d000-' || lpad((100 + i)::text, 12, '0'))::uuid,
      'authenticated', 'authenticated',
      'client.demo.' || i || '@duo.test', now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('prenom', 'Client démo ' || i, 'role', 'membre'),
      now(), now(), '', '', '', ''
    ) on conflict (id) do nothing;
  end loop;

  -- Rejouable : on repart de zéro pour Léa et les membres de démo
  delete from public.redemptions
  where user_id = lea
     or user_id in (select id from auth.users where email like 'client.demo.%@duo.test');

  -- La Table Zen : ~90 utilisations sur les 30 derniers jours, plus nombreuses le vendredi et le samedi
  for i in 1..90 loop
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

    insert into public.redemptions (offer_id, user_id, economie, created_at)
    values (
      table_zen_offre,
      ('00000000-0000-4000-d000-' || lpad((101 + floor(random() * 12)::int)::text, 12, '0'))::uuid,
      18, quand
    );
  end loop;

  -- Léa : une utilisation chez quatre autres commerces depuis son abonnement, chacune
  -- un jour où l'offre était valable (le plus proche avant « il y a N jours »)
  for c in
    select * from (values
      ('00000000-0000-4000-c000-000000000102'::uuid, 35, 9),   -- Le Café du Lundi
      ('00000000-0000-4000-c000-000000000103'::uuid, 24, 17),  -- Institut Éclat
      ('00000000-0000-4000-c000-000000000107'::uuid, 12, 15),  -- La Librairie du Quai
      ('00000000-0000-4000-c000-000000000106'::uuid, 4, 18)    -- Fleurs de Saison
    ) as t(offre, il_y_a, heure)
  loop
    select jours into jours_offre from public.offers where id = c.offre;
    jour := (now() at time zone 'Europe/Paris')::date - c.il_y_a;
    while not (extract(isodow from jour)::smallint = any (jours_offre)) loop
      jour := jour - 1;
    end loop;

    insert into public.redemptions (offer_id, user_id, economie, created_at)
    select c.offre, lea, o.economie,
           (jour + make_interval(hours => c.heure, mins => 30)) at time zone 'Europe/Paris'
    from public.offers o where o.id = c.offre;
  end loop;
end $$;

-- Résultat à lire : d'abord les identifiants de connexion (mot de passe et code de caisse inventés par le script
-- si vous ne les avez pas choisis : à noter), puis la ligne de contrôle : 7 commerces, 1 offre du lundi,
-- ~90 utilisations à La Table Zen, 4 pour Léa, 2 comptes connectables
select
  'lea.demo@duo.test' as compte_membre,
  'table-zen.demo@duo.test' as compte_commercant,
  current_setting('duo.mot_de_passe', true) as mot_de_passe,
  current_setting('duo.code_caisse', true) as code_caisse,
  (select count(*) from public.merchants where id::text like '00000000-0000-4000-b000-0000000001%') as commerces,
  (select count(*) from public.offers where id::text like '00000000-0000-4000-c000-0000000001%'
     and jours = '{1}' and active) as offres_du_lundi,
  (select count(*) from public.redemptions where offer_id = '00000000-0000-4000-c000-000000000101') as utilisations_table_zen,
  (select count(*) from public.redemptions where user_id = '00000000-0000-4000-e000-000000000101') as utilisations_lea,
  (select count(*) from auth.users where email in ('lea.demo@duo.test', 'table-zen.demo@duo.test')
     and encrypted_password like '$2%') as comptes_connectables;
