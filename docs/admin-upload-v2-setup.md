# Admin upload V2 — checklist de mise en service

## Pourquoi “ça ne fonctionne pas” actuellement

La V2 repose sur :

1. une **BDD prête** avec la table `Media`,
2. un **bucket Supabase Storage** configuré,
3. les variables d'environnement renseignées.

Si l'un manque, l'upload échoue.

## 1) BDD prête (obligatoire)

Le schéma Prisma contient désormais un modèle `Media`.

### Commandes

```bash
npx prisma generate
npx prisma db push
```

> En environnement d'équipe, privilégier ensuite des migrations versionnées (`prisma migrate dev`).

## 2) Variables d'environnement (obligatoire)

Ajouter dans `.env.local` :

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"

SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="tfg-media"

# Optionnel: prefix des objets stockés
SUPABASE_MEDIA_PREFIX="admin-media"

# Optionnel: URL publique personnalisée (CDN / domaine custom)
SUPABASE_PUBLIC_URL_BASE="https://cdn.mondomaine.fr/admin-media"
```

## 3) Démarrage local

```bash
npm run dev
```

Puis ouvrir `/admin/uploads`.

## 4) Ce que fait la V2

- Compression automatique en **WEBP** (max 1600px).
- Génération d'une **thumbnail** carrée 420x420.
- Upload objet de l'original + miniature dans Supabase Storage.
- Enregistrement BDD (`Media`) avec metadata (poids, dimensions, alt, source).
- Suppression admin sécurisée : suppression objet + suppression en base.

## 5) Vérifications rapides

- L'upload retourne une entrée dans la liste “Derniers médias uploadés”.
- Le lien “Voir l'original” est accessible.
- Le bouton “Supprimer” retire l'asset de la liste et du bucket.
