# Plan d'amélioration — formulaire de publication communauté

## 1) Problèmes UX observés

- Feedback insuffisant sur les états de soumission (chargement, succès, erreur).
- Pas de brouillon local : risque de perte de texte en cas de refresh / fermeture.
- Validation perçue tardivement (erreurs après submit plutôt qu'en amont).
- Gestion image perfectible (compression client, progression upload, annulation).
- Modale dense : l'utilisateur n'est pas guidé étape par étape.
- Le formulaire ne reprend pas assez les codes “social network” (en-tête profil, composition naturelle).
- Le champ **titre** ajoute de la friction alors qu'un post court devrait partir directement sur le contenu.
- Aperçu image jugé non fiable (chargement/rafraîchissement incomplet selon les cas).

## 2) Idées d'amélioration (priorisées)

### P1 — Impact fort, effort modéré

0. **Recentrer le formulaire en mode “réseau social”**
   - En-tête fixe avec avatar + nom affiché avant le textarea.
   - Suppression du champ `title` (optionnel inutile dans ce flux).
   - Placeholder orienté conversation (“Partagez une actu, un résultat, une photo…”).
1. **Validation instantanée**
   - Compteur de caractères (`12 / 2000`) et seuil visuel.
   - Erreurs inline sur `content`, `scope`, `tournamentId`.
2. **États de soumission clairs**
   - Bouton avec état `Envoi...`, `Envoyé`, `Réessayer`.
   - Bannière résultat persistante 5–8 secondes.
3. **Prévention double submit**
   - Lock bouton + idempotency key côté API.
4. **Brouillon local auto-save**
   - Sauvegarde toutes les 2s dans `localStorage`.
   - Restauration au rechargement avec confirmation.

### P2 — Qualité de publication

5. **Aide contextuelle sur le contenu**
   - Suggestions de titres (résultats, annonces, infos club).
   - Exemples de message selon le scope choisi.
6. **Upload image robuste**
   - Barre de progression + limite visible.
   - Compression client légère avant upload.
   - CTA “Retirer / Remplacer” plus explicite.
   - Refonte preview : composant dédié + état “image chargée / image invalide”.
7. **Preview finale avant envoi**
   - Carte "aperçu publication" identique au rendu du feed.

### P3 — Modération & exploitation

8. **Signal qualité automatique**
   - Détection contenu trop court / répétitif / spam.
9. **Télémétrie produit**
   - Taux d'abandon, erreurs upload, temps de soumission.
10. **Messages admin améliorés**
   - Remonter la raison d'échec vers un code lisible (`UPLOAD_TIMEOUT`, `DB_ERROR`, etc.).

## 3) Plan d'exécution proposé

## Sprint 1 (1 semaine)
- UI “social network” : avatar+nom en entête + retrait champ titre.
- Validation instantanée + compteur.
- États de soumission harmonisés.
- Prévention double submit.
- Instrumentation minimale (logs structurés).

**Critères d'acceptation**
- Aucun double post sur double clic.
- Erreurs utilisateur lisibles sans ouvrir la console.
- Temps moyen soumission < 2s hors upload.

## Sprint 2 (1 semaine)
- Brouillon local auto-save + restauration.
- Preview finale.
- Upload avec progression et messages améliorés.
- Correctif preview image (fallback + retry + état d'erreur explicite).

**Critères d'acceptation**
- 0 perte de contenu sur refresh involontaire.
- Diminution du taux d'abandon de 20%.

## Sprint 3 (1 semaine)
- Suggestions éditoriales.
- Télémetrie complète + dashboard simple.
- Améliorations modération (codes erreurs + raison).

**Critères d'acceptation**
- Baisse des tickets support “formulaire ne fonctionne pas”.
- Traçabilité de 95% des échecs d'envoi.

## 4) Backlog technique concret

- Extraire un hook `useCommunityComposer()` (états + actions + autosave).
- Introduire un schéma de validation partagé (zod) client + serveur.
- Standardiser les réponses API `{ ok, code, message, details? }`.
- Créer un composant `ComposerHeader` (avatar, nom, badge club/zone).
- Créer un composant `ComposerImagePreview` (preview + erreurs image + retry).
- Ajouter tests :
  - unitaires validation,
  - unitaires preview image (URL locale, URL uploadée, erreur chargement),
  - intégration upload/remplacement,
  - e2e soumission avec image et sans image.

## 5) Risques & mitigation

- **Risque:** complexité UI croissante.  
  **Mitigation:** découper en composants (`ComposerFields`, `ComposerMedia`, `ComposerSubmitBar`).
- **Risque:** incohérences entre validation client/serveur.  
  **Mitigation:** schéma unique partagé.
- **Risque:** stockage d'orphelins média.  
  **Mitigation:** job de cleanup quotidien par `sourceRef` non relié.
