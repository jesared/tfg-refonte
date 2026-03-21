# Micro-réseau social sportif (Communauté)

## 1) Structure SQL Follow (`subscriptions`)

```sql
CREATE TABLE subscriptions (
  follower_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  followed_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE INDEX subscriptions_followed_idx ON subscriptions(followed_id, created_at DESC);
CREATE INDEX subscriptions_follower_idx ON subscriptions(follower_id, created_at DESC);
```

### Rôle

- `follower_id`: joueur qui suit.
- `followed_id`: joueur suivi.
- La clé primaire composite évite les doublons.
- Le `CHECK` interdit l'auto-follow.

## 2) Fil d'activité: génération de phrase automatique

La fonction `generateActivitySentence` (dans `lib/community/activity-feed.ts`) prend un événement typé:

- `REGISTRATION` (inscription)
- `VICTORY` (victoire)
- `GRADE_CHANGE` (changement de grade)

Et retourne une phrase prête à afficher dans le fil d'activité sportif.

## 3) Logique badges / succès

Badge automatique **Triple Couronne**:

- Condition: `won_tournaments >= 3`.
- Fonction utilitaire: `hasTripleCrownBadge(wonTournaments)`.
- Affichage: badge sur la carte profil si la condition est vraie.

### Recommandation de table de stats (optionnelle)

```sql
CREATE TABLE player_performance_stats (
  user_id TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
  won_tournaments INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Puis calcul côté front/back:

- `has_triple_couronne = won_tournaments >= 3`.
