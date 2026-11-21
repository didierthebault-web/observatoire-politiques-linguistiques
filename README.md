# Observatoire des politiques linguistiques

Prototype expérimental DGLFLF, sans validation institutionnelle. React, TypeScript, Vite ; diffusion statique sur GitHub Pages. Logo fourni par le demandeur.

## Utilisation

`npm ci`, puis `npm run build` et `npm run admin`. Ouvrir http://127.0.0.1:5197/observatoire-politiques-linguistiques/#/administration . Le service écoute exclusivement sur la boucle locale. Le dossier `private/` contient les 80 fiches et 10 hypothèses et reste exclu de Git et du build.

Sur le site public, seules les fiches explicitement validées et autorisées sont accessibles. Le corpus public comporte 80 fiches : le demandeur a explicitement validé leur diffusion après examen dans ChatGPT. Cette décision est consignée dans leur historique, sans être présentée comme une nouvelle vérification des sources. Les réserves de l’audit sont conservées. T20 est une source secondaire de T01 et ne doit pas être comptée comme tendance indépendante. Les compteurs agrégés décrivent l’import, jamais une validation ou une tendance représentative.

## Validation et mise à jour

Ouvrir une fiche dans l’atelier, consulter la source et les réserves, corriger, choisir un statut, fournir auteur, motif et preuve réellement examinée. Cocher l’autorisation de diffusion uniquement pour une fiche validée. L’historique est persistant dans `private/workspace.json`. Résoudre les doublons avant diffusion. Le bouton « Générer le jeu public validé » écrit seulement les JSON publics ; il ne déploie pas. Exécuter ensuite `npm run build`, `npm test`, examiner `public/data/catalog.json`, committer et pousser. GitHub Actions teste puis publie `dist/`.

Ne jamais ajouter `private/` ou les classeurs originaux au dépôt public. Faire une sauvegarde privée de ce dossier avant un nouvel import : le script de migration réinitialise l’atelier. Pour réimporter, utiliser Python avec openpyxl : `python scripts/import_data.py CHEMIN_BANC_ESSAI CHEMIN_AUDIT`.

## Import et référentiel

Les propositions JSON `{records:[{id:...}]}`, CSV ou Excel (colonne `id`) sont sauvegardées dans `private/imports.json` sans écraser les décisions. Leur examen est manuel à partir de ce fichier, puis correction dans l’atelier. Le référentiel est éditable dans `public/data/themes.json`, sans modification du code. Les familles attribuées par l’import sont des propositions lexicales à revoir. Les données historiques complètes et les feuilles annexes sont conservées dans le dossier privé.

## Fonctions disponibles

Recherche sans accents, filtres multicritères, tri, fiches détaillées, sélection persistante dans le navigateur, exports CSV/Excel/JSON, rapports imprimables en PDF, réseau de rapprochements cliquable et alternative textuelle, registre des sources, tableau de qualité, contrôle documentaire local, publication filtrée, historique, journal d’import. Les champs absents restent inconnus.

## Limites explicites et V2

Aucun service IA connecté : interface interchangeable dans `src/ai.ts`, aucune simulation ni clé publique. Pas de collecte RSS/API/extraction active ni de planification ; import à la demande uniquement. Le registre conserve les URL mais ne contrôle pas automatiquement leur contenu ou leur disponibilité. Dates de publication, pays, affiliations et détails d’éligibilité nécessitent un enrichissement humain. Les 39 URL ne représentent pas 39 producteurs. Les scores historiques ne sont pas revalidés. Les relations initiales restent des suggestions non diffusées.

L’atelier n’est pas une administration collaborative distante. La publication est manuelle via GitHub après export ; pas de synchronisation automatique. Les propositions importées s’examinent dans le fichier journal, sans écran de comparaison. Le réseau représente les quatre identifiants d’une hypothèse, sans inférer des liens attestés. O18 exige encore une séparation des entités. Les fonds clos restent clos ; aucun appel n’est déclaré ouvert par l’import.

V2 : stockage privé avec authentification et rôles, registre de preuves par affirmation, contrôle daté des URL et des échéances, écran de rapprochement des imports, enrichissement des affiliations/territoires, collecte autorisée à la demande, fournisseur IA sécurisé côté serveur, validation et publication des rapports, suivi des versions éditoriales.

## Tests, sécurité et accessibilité

`npm test` contrôle la publication, les preuves obligatoires, les liens, l’intégrité des identifiants et la migration si le corpus privé est présent. `node tests/browser.cjs` vérifie les parcours sur l’atelier démarré, les neuf rubriques, le refus de validation sans preuve, le mobile et axe. `TEST_URL` permet de cibler le site publié. `npm audit` contrôle les dépendances du registre npm ; le paquet SheetJS distribué par son producteur nécessite une veille complémentaire.

Les écritures locales exigent un en-tête spécifique, un hôte exact et une origine locale. Aucune API d’écriture n’est déployée. React échappe le texte des fiches, les sources doivent être HTTP(S). Pas de secret dans le code. Aucun mot de passe JavaScript. L’atelier est destiné à un poste de confiance, pas à l’exposition réseau.

RGAA : non audité. Les tests axe ne constituent pas une déclaration de conformité. Contrôles complémentaires requis : lecteur d’écran NVDA, zoom 200/400 %, contraste et compréhension des graphes, formulaires, impression et exports avec technologies d’assistance. Les sélections sont locales au navigateur. Réexamen annuel des profils, rectification/retrait via le responsable du prototype ou le dépôt sans données privées en public.

Voir `docs/migration.md`, `docs/data-dictionary.json` et `docs/tests.md`.

## Présentation des experts

20 profils sont présentés en liste illustrée : portrait à gauche, nom ouvrant la fiche, affiliation, texte documentaire et liens sources. 18 portraits professionnels sourcés sont disponibles. Shu Okabe et Tilahun Yeshambel disposent d’un emplacement « Portrait non disponible » ; aucun visage n’est inventé. Les images et leurs crédits sont associés à chaque fiche. Le texte d’enrichissement et ses références sont distingués du résumé historique. Les dix rapprochements restent des hypothèses privées, la validation du demandeur portant sur les fiches.
