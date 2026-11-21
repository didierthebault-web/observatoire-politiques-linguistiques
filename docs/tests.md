# Vérification V1 — 21 novembre 2026

- Build TypeScript/Vite : réussi.
- 5 tests Node : réussis (filtre de publication, validation obligatoire, liens et sources filtrés, build sans dossier privé, migration des 80 identifiants/10 rapprochements/39 URL).
- Navigateur Chromium : 9 rubriques parcourues, recherche et réinitialisation, ouverture/fermeture des fiches, formulaire documentaire et refus effectif de validation sans preuve.
- Axe WCAG 2 A/AA et 2.1 AA : aucune violation détectée sur les 9 vues testées dans l’atelier. Les formulaires ouverts et tous les états dynamiques ne sont pas couverts exhaustivement.
- Mobile 390 × 844 : aucun débordement horizontal de l’accueil ; captures desktop et mobile examinées visuellement.
- Clavier : prise de focus contrôlée ; dialogue natif avec restitution du focus à la fermeture. Parcours manuel exhaustif NVDA et zoom restant à faire.
- Audit npm : aucune vulnérabilité signalée ; ceci ne constitue pas un audit de sécurité complet et ne couvre pas les avis hors registre npm.
- Aucun test n’a validé ou autorisé une vraie fiche au nom d’un documentaliste. Le test de publication utilise une fixture isolée, jamais livrée dans les JSON publics.

Les preuves détaillées, captures et résultats de contrôle des URL restent dans `private/`. L’accessibilité RGAA n’est pas déclarée conforme.
