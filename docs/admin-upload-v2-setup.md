# Admin upload V2 — checklist de mise en service

## Pourquoi “ça ne fonctionne pas” actuellement
La V2 repose sur :
1. une **BDD prête** avec la table `Media`,
2. un **bucket objet S3/R2** configuré,
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

S3_ENDPOINT="https://<endpoint-s3-ou-r2>"
S3_REGION="auto"
S3_BUCKET="tfg-media"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_FORCE_PATH_STYLE="true"

# Recommandé pour servir les assets depuis un domaine CDN/public
S3_PUBLIC_URL_BASE="https://cdn.mondomaine.fr/admin-media"
```

## 3) Démarrage local
```bash
npm run dev
```
Puis ouvrir `/admin/uploads`.

## 4) Ce que fait la V2
- Compression automatique en **WEBP** (max 1600px).
- Génération d'une **thumbnail** carrée 420x420.
- Upload objet de l'original + miniature.
- Enregistrement BDD (`Media`) avec metadata (poids, dimensions, alt, source).
- Suppression admin sécurisée : suppression objet + suppression en base.

## 5) Vérifications rapides
- L'upload retourne une entrée dans la liste “Derniers médias uploadés”.
- Le lien “Voir l'original” est accessible.
- Le bouton “Supprimer” retire l'asset de la liste et du bucket.

