# Politique images (communauté + profils + administration)

Document prêt à copier/coller et à adapter pour une application web communautaire.

---

## 1) CGU — publication d'images par les utilisateurs

**Clause proposée :**

> En publiant une image (photo de profil, couverture, publication), l'Utilisateur déclare et garantit qu'il détient les droits nécessaires à son utilisation et à sa diffusion sur la Plateforme.
>
> L'Utilisateur s'engage à ne pas publier de contenus :
> - portant atteinte aux droits d'auteur, droits voisins, marques ou droits à l'image ;
> - illicites, diffamatoires, haineux, violents, pornographiques ou contraires à l'ordre public ;
> - contenant des données personnelles de tiers sans consentement.
>
> La Plateforme peut retirer tout contenu signalé ou manifestement illicite, suspendre un compte en cas d'abus, et coopérer avec les autorités compétentes si nécessaire.

---

## 2) Règles de modération (communauté)

### Contenus interdits
- Violation de droits d'auteur.
- Harcèlement, haine, discrimination, menaces.
- Pornographie explicite.
- Violence graphique.
- Doxxing / divulgation de données personnelles.
- Spam, publicité trompeuse, arnaques.

### Process de modération recommandé
1. Bouton **"Signaler"** sur chaque image/post.
2. File d'attente de modération côté admin.
3. Décision : **conserver / masquer / supprimer**.
4. Historique de décision (admin, motif, date).
5. Escalade (ban temporaire/définitif) en cas de récidive.

---

## 3) Checklist admin pour les images ajoutées par l'équipe

Avant publication, vérifier :
- [ ] Source connue (photo interne, Unsplash, Pexels, Pixabay, CC0...).
- [ ] Licence compatible avec l'usage (notamment commercial).
- [ ] Attribution ajoutée si la licence l'exige.
- [ ] Aucune marque/logo/personne identifiable problématique.
- [ ] Preuve de source archivée (lien + date + capture éventuelle).

### Tableau de suivi minimal
- URL source
- Auteur
- Licence
- Date de récupération
- Usage (page/article/campagne)
- Attribution requise (oui/non)

---

## 4) Guide de démarrage code — upload admin (première étape)

Objectif : livrer un premier upload **sécurisé** pour les administrateurs uniquement.

### Étape A — route API admin dédiée
Créer une route Next.js App Router :
- `app/api/admin/uploads/route.ts`

Comportement minimum :
1. Vérifier session + rôle `ADMIN`.
2. Lire `FormData`.
3. Valider fichier : présence, taille max, type MIME autorisé (`image/jpeg`, `image/png`, `image/webp`).
4. Renommer avec un identifiant unique.
5. Écrire le fichier dans un répertoire public (phase 1) : `public/uploads/admin`.
6. Retourner l'URL publique.

### Étape B — exemple de code (phase 1, stockage local)

```ts
// app/api/admin/uploads/route.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "admin");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({
    url: `/uploads/admin/${filename}`,
    filename,
  }, { status: 201 });
}
```

### Étape C — formulaire admin minimal
- Ajouter un formulaire dans une page admin (ex: `app/admin/page.tsx` ou section dédiée).
- Envoyer via `fetch('/api/admin/uploads', { method: 'POST', body: formData })`.
- Afficher l'URL retournée.

### Étape D — améliorations juste après MVP
1. Compression/redimensionnement avant stockage (ex: `sharp`).
2. Suppression métadonnées EXIF.
3. Stockage objet (S3/R2/Supabase Storage) au lieu de disque local.
4. Persistance DB (`Media` table) pour tracer uploader, date, source/licence.
5. Antivirus/scan sécurité selon contexte.

---

## 5) Notes importantes production
- Ne pas se fier uniquement à l'extension : valider aussi MIME.
- Limiter le débit (rate limit) pour éviter les abus.
- Journaliser les uploads admin.
- Prévoir suppression/rotation des fichiers non utilisés.

