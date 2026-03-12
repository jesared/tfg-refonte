# Plan d'exécution : couche communautaire pour le Trophée François Grieder

## Contexte
Le site TFG porte sur le **Trophée François Grieder** : un challenge de tennis de table basé sur un classement général, alimenté par plusieurs tournois régionaux homologués (Marne + ouverture Ardennes).

L'objectif n'est pas de créer un réseau social généraliste, mais une **couche communautaire utile au circuit sportif**.

## Objectifs produit
- Mieux connecter joueuses, joueurs, clubs et organisateurs.
- Donner de la visibilité aux tournois homologués et aux performances.
- Fidéliser la participation entre les différentes étapes du trophée.

## Détail "Communauté" par rapport au site actuel

### Ce que le site fait déjà bien (base solide)
- **Accueil clair** sur la mission du trophée, avec accès rapides vers agenda, tableaux et inscriptions.
- **Agenda structuré** par saison avec dates, clubs organisateurs, salles et adresses.
- **Inscriptions** connectées au prochain tournoi ouvert.
- **Contenu social actuel externalisé** surtout via Facebook (suivi + partage), pas natif dans le site.

### Limite actuelle
Le site est aujourd'hui excellent en logique **informationnelle/transactionnelle** (consulter, s'inscrire), mais il manque la logique **communautaire continue** entre deux tours :
- pas de publication native des clubs/joueurs,
- pas d'échanges (commentaires/réactions),
- pas d'espace d'animation autour des résultats,
- dépendance à Facebook pour les actus.

### Ce que "Communauté" ajoute concrètement
La couche communauté doit compléter l'existant sans le remplacer :

1. **Avant tournoi**
   - posts d'annonces clubs (infos salle, horaires, covoiturage),
   - fil filtré sur le tournoi concerné.

2. **Pendant / après tournoi**
   - publication rapide de résultats marquants,
   - photos officielles,
   - réactions/commentaires pour garder l'engagement.

3. **Entre les tours**
   - maintien du lien joueurs/clubs,
   - rappels et contenus de préparation,
   - visibilité des performances du classement général.

### Intégration cible dans la navigation actuelle
- **Accueil** : ajouter un module "À la une communauté" (3 à 5 posts récents liés aux tours).
- **Agenda** : chaque carte tournoi embarque un lien "Voir les publications de ce tour".
- **Tableaux** : relier les catégories à des publications de résultats/commentaires.
- **Inscriptions** : afficher un encart "infos de la communauté" pour le prochain tour.
- **Admin** : ajouter la modération des contenus sans casser les écrans tournois existants.

### Règle de conception
Priorité absolue : la communauté doit **servir le circuit sportif TFG** (tournois, clubs, résultats), jamais devenir un flux social générique sans lien avec la compétition.

## KPI de pilotage (MVP)
- Taux d'inscription aux tournois via le site.
- Utilisateurs actifs hebdomadaires (WAU).
- Nombre moyen d'interactions par publication (commentaires + réactions).
- Rétention à J7 / J30 des comptes créés.
- Nombre de signalements de contenu et délai de traitement.

## Périmètre MVP (8 à 10 semaines)

### 1) Profils orientés sport
- Profil joueur/joueuse : club, catégorie, classement, zones (Marne/Ardennes), historique TFG.
- Profil organisateur : tournoi, salle, infos pratiques.

### 2) Fil d'actualité contextualisé tournoi
- Publications textuelles + photo.
- Catégorisation : avant tournoi / résultats / vie des clubs.
- Fil filtrable par territoire (Marne, Ardennes) et par tournoi.

### 3) Interactions utiles
- Commentaires et réactions.
- Mentions des clubs ou des tournois.
- Signalement de contenu inapproprié.

### 4) Modération et gouvernance
- Charte de publication sportive (respect, anti-insultes, anti-spam).
- Back-office simple pour modérer les signalements.
- Rôles : admin, modérateur, membre.

### 5) Pages tournoi améliorées
- Bloc « actualités du tournoi ».
- Publication des résultats et photos officielles.
- Call-to-action d'inscription et rappel des échéances.

## Plan d'exécution détaillé

### S1 : cadrage
- Ateliers rapides avec organisateurs / référents clubs.
- Validation des KPI et du périmètre MVP.
- Maquette rapide des parcours (profil, feed, page tournoi).

### S2-S3 : socle technique
- Modèle de données (profils, posts, commentaires, réactions, signalements).
- API et permissions par rôle.
- Base d'administration minimale.

### S4-S6 : fonctionnalités cœur
- Publication + consultation du feed.
- Commentaires / réactions.
- Filtres par tournoi et par zone.
- Intégration sur pages tournoi.

### S7-S8 : fiabilisation
- Modération et workflow de signalement.
- Notifications essentielles (nouveau commentaire, publication de résultat).
- Tests fonctionnels et QA.

### S9-S10 : bêta pilotée
- Ouverture à un panel de clubs (Marne + Ardennes).
- Mesure KPI hebdomadaire.
- Ajustements UX avant ouverture élargie.

## Débrief recommandé après la bêta

### Ce qui a marché
- Adoption des profils clubs/joueurs.
- Engagement sur les publications liées aux résultats.
- Effet sur les inscriptions aux tournois.

### Ce qui bloque
- Frictions d'onboarding.
- Modération trop manuelle.
- Contenu insuffisant sur certains tournois.

### Décisions
- Features à conserver, améliorer, supprimer.
- Priorités du sprint suivant (max 3).
- Plan d'extension (nouveaux clubs / nouvelles zones).

## Backlog post-MVP (priorisé)
1. Messagerie directe club ↔ joueur (sur opt-in).
2. Mise en avant automatique des performances marquantes.
3. Pages clubs enrichies (calendrier, résultats, effectifs).
4. Tableau de bord organisateurs (engagement par tournoi).

## Risques à anticiper
- Contenu faible au lancement (cold start) → seed de contenu officiel TFG.
- Dérapages en commentaires → modération claire + sanctions progressives.
- Incohérence des données sportives → validation des résultats par organisateurs.
- Complexité excessive → rester sur un MVP orienté usages terrain.


## Démarrage immédiat : par quoi commencer maintenant

Oui : pour implémenter la communauté proprement, il faut commencer par une **évolution du schéma Prisma** (profils, posts, commentaires, réactions, signalements), puis dérouler un premier incrément fonctionnel très court.

### Sprint 0 (48h)
- Valider les 4 entités minimales : profil, post, commentaire, signalement.
- Confirmer les rôles (admin/modérateur/membre) et la charte de publication.
- Verrouiller 3 KPI de lancement (WAU, interactions/post, signalements traités).

### Sprint 1 (1 semaine)
- Mettre en place le schéma + migration Prisma.
- Générer les API CRUD de base (posts/commentaires).
- Ajouter un écran admin minimal de modération des signalements.

### Sprint 2 (1 semaine)
- Intégrer le flux communauté sur la page d'accueil (bloc "À la une communauté").
- Ajouter le lien depuis l'agenda vers les publications d'un tour.
- Lancer un test fermé avec 1–2 clubs pilotes.

### Définition de "bon départ"
- Au moins 10 publications utiles liées aux tournois.
- Délai de modération < 24h sur les signalements.
- Feedback positif des clubs pilotes sur la lisibilité et l'utilité terrain.
