# Audit technique et fonctionnel — https://v2.tropheefg.fr/
_Date de l'audit : 21 mars 2026_

## 1) Périmètre et méthode

Cet audit combine :

- **Observation de la version en ligne** via accès HTTP (lecture du rendu textuel de la page d'accueil).
- **Inspection du code source local** du projet Next.js (front, structure, SEO technique, config).
- **Analyse heuristique QA/UX** (sans tests utilisateurs instrumentés).

### Limites de mesure

- L'environnement d'exécution utilisé pour l'audit n'autorise pas une capture complète des entêtes HTTP (proxy bloquant les requêtes directes `curl` vers le domaine), donc les constats **headers sécurité** sont partiellement inférés depuis la configuration du code.
- Aucun score Lighthouse « réel » n'a été exécuté ici ; la section performance/SEO est une **simulation argumentée** basée sur l'architecture et les patterns observés.

---

## 2) Analyse Front-end

### Stack technique identifiée

- **Framework principal : Next.js (App Router)**.
- **UI : React**.
- **Langage : TypeScript**.
- **Styling : Tailwind CSS v4** avec design tokens personnalisés (palette claire/sombre, variables CSS).
- **Icônes : lucide-react**.
- **Composants UI : Radix UI (Accordion, Dialog, Dropdown, etc.)**.
- **Authentification : next-auth**.
- **Données : Prisma + base relationnelle (côté serveur)**.

### Structure DOM / architecture de pages

Points positifs :

- Layout global clair (`RootLayout`) avec composition : providers, sidebar, breadcrumb, zone `main`.
- Découpage composants cohérent (sidebar, items, sections de la home).
- Présence d'éléments sémantiques (`main`, `section`, `header`, listes, titres hiérarchiques).
- Utilisation explicite de `aria-*` sur certains composants interactifs (menu mobile, boutons de fermeture).

Points de vigilance :

- Quelques liens internes utilisent `<a href="...">` plutôt que le composant `Link` de Next.js, ce qui peut limiter certaines optimisations de navigation/prefetch.
- Le script d'initialisation du thème est injecté inline (`dangerouslySetInnerHTML`) : techniquement acceptable pour éviter le flash de thème, mais à cadrer avec une CSP stricte côté sécurité.

### Responsive / mobile-first

Points positifs :

- Breakpoints Tailwind bien utilisés (`sm`, `md`, `lg`) ; menus mobile/desktop distincts et gérés proprement.
- Sidebar mobile en panneau latéral + overlay, avec verrouillage du scroll du body.
- Mise en page modulaire en cartes qui s'adapte correctement (grilles en 1, 2, 3 colonnes selon largeur).

Points d'amélioration :

- Le parcours mobile gagnerait avec une vérification UX terrain sur petits écrans (≤360px) pour densité de contenu et lisibilité des zones « carte ».
- Ajouter des tests visuels automatisés (Playwright snapshots) sur 3-4 résolutions clés.

---

## 3) Performance & SEO (simulation des points critiques)

### Performance potentielle

Forces :

- Architecture Next.js moderne favorable au SSR/streaming et à la découpe par route.
- UI relativement sobre en assets riches sur la page d'accueil (peu d'images lourdes visibles dans le contenu principal).
- Tailwind + composants utilitaires : CSS orienté classes, généralement efficace en production.

Risques / points critiques :

1. **Fonts externes (`next/font/google`)** : bon choix global, mais surveiller impact CLS/FCP selon fallback réel.
2. **Hydratation client** : la présence de composants client (sidebar/session) est normale, mais il faut éviter de faire remonter trop de logique côté client si l'app grossit.
3. **Données homepage** : requête Prisma côté serveur sur les posts communauté ; prévoir cache/revalidation pour absorber les pics de trafic.

Recommandations perf :

- Activer une stratégie explicite de cache/revalidation des sections dynamiques (ISR/revalidate/tag cache).
- Contrôler le budget JS par route (bundle analyzer) et isoler les blocs client-only.
- Mettre en place un suivi Core Web Vitals réel (RUM : INP, LCP, CLS).

### SEO technique

Forces :

- Présence de métadonnées `title` et `description` sur plusieurs pages.
- `lang="fr"` au niveau HTML.
- Sitemap présent.

Points d'amélioration importants :

1. **Métadonnées enrichies** : ajouter Open Graph/Twitter Cards, canonical URL, robots explicite.
2. **Sitemap** : éviter d'exposer les routes admin/profil dans le sitemap public ; prioriser pages indexables publiques.
3. **Données structurées** : intégrer JSON-LD (Organization, WebSite, éventuellement Event pour agenda/tournois).
4. **Maillage interne** : harmoniser la navigation interne avec `Link` pour une meilleure cohérence UX/SEO.

### Accessibilité (a11y)

Forces :

- Sémantique globale correcte.
- Présence d'attributs ARIA sur des contrôles importants.
- Contraste visuel probablement travaillé via thème clair/sombre.

Axes d'amélioration :

- Vérifier le focus visible clavier sur tous les composants interactifs (notamment boutons/icônes).
- Ajouter un lien d'évitement « Aller au contenu » en début de page.
- Auditer les intitulés de liens/boutons pour lecteurs d'écran sur toutes les pages.

---

## 4) UX/UI — parcours utilisateur

### Points forts

- Proposition de valeur claire dès l'accueil (explication du trophée).
- Navigation structurée et complète (sections métier bien identifiées).
- Blocs « Accès rapides » pertinents pour réduire le temps d'accès aux pages clés.
- Cohérence visuelle appréciable (thème, arrondis, hiérarchie typographique).

### Points de friction potentiels

- Densité de navigation importante dans le menu : risque de charge cognitive pour nouveaux visiteurs.
- CTA « Inscriptions » dépendant d'outils externes/club : préciser plus tôt le flux attendu peut éviter l'abandon.
- La rubrique « Communauté » peut paraître vide en l'absence de posts ; prévoir un état vide plus orienté action (ex : « comment publier », « rejoindre »).

### Recommandations UX concrètes

- Ajouter un **CTA principal persistant** en haut de page (« S'inscrire à un tournoi »).
- Introduire des micro-contenus explicatifs (FAQ courte sur le fonctionnement du classement).
- Mettre en place un mini tunnel guidé « Nouveau visiteur » (Découvrir → Trouver un tournoi → S'inscrire).

---

## 5) Sécurité & bonnes pratiques

### Constats

- Le site est servi en **HTTPS** (l'URL HTTP redirige vers HTTPS selon l'observation de navigation).
- Configuration Next.js observée sans bloc explicite d'entêtes de sécurité (`Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, etc.) dans `next.config.ts`.
- Authentification présente (next-auth), bonne base pour la gestion des espaces privés/admin.

### Recommandations prioritaires sécurité

1. **Définir des security headers** côté plateforme/reverse proxy ou via config Next :
   - `Content-Security-Policy`
   - `Strict-Transport-Security`
   - `X-Content-Type-Options`
   - `X-Frame-Options` / `frame-ancestors`
   - `Referrer-Policy`
2. **Durcir CSP** en tenant compte du script inline de thème (nonce/hash).
3. **Revue permissions & rôles** : valider l'isolation stricte des routes/admin APIs.
4. **Journalisation sécurité** : centraliser erreurs auth, tentatives d'accès non autorisées.
5. **Pipeline dépendances** : scan régulier vulnérabilités (`npm audit`, SCA CI/CD).

---

## 6) Critique de code apparent & optimisation assets

### Qualité de code (apparent)

Points positifs :

- Base de code lisible et structurée.
- Nommage clair des composants/pages.
- Usage de TypeScript et Prisma : bon signal de robustesse.
- CSS organisé autour de tokens/thèmes, cohérent avec une design system légère.

Améliorations possibles :

- Factoriser certaines classes utilitaires répétitives en composants UI communs pour réduire le bruit JSX.
- Uniformiser l'usage des liens internes Next (`Link`).
- Revoir certaines routes dans le sitemap (admin/profil) pour éviter indexation indésirable.

### Optimisation des assets

- Bonne pratique : configuration `images.remotePatterns` pour domaines autorisés.
- Vérifier que toutes les images critiques passent par `next/image` avec dimensions explicites.
- Contrôler compression et formats modernes (WebP/AVIF) pour les futurs médias communautaires.

---

## 7) Synthèse (état général du projet)

### Niveau global estimé

- **Maturité technique : bonne** (stack moderne, base propre, responsive travaillé).
- **Maturité produit/UX : intermédiaire à bonne** (parcours déjà clair, mais optimisation conversion possible).
- **Maturité SEO & sécurité : intermédiaire** (fondations présentes, durcissement recommandé).

### Conclusion

Le projet `v2.tropheefg.fr` présente une base solide et professionnelle pour un site associatif/événementiel régional : architecture moderne, design cohérent, navigation fonctionnelle et code globalement propre.

Les gains les plus rentables à court terme sont :

1. **SEO avancé** (Open Graph, canonical, sitemap filtré).
2. **Durcissement sécurité HTTP/CSP**.
3. **Optimisation UX conversion** autour du parcours d'inscription.
4. **Instrumentation performance réelle** (Core Web Vitals en production).

Avec ces améliorations, le site peut passer d'un très bon socle technique à une plateforme plus robuste, mieux référencée et mieux orientée conversion utilisateur.

---

## 8) Plan d'action « aujourd'hui » (priorisé, concret)

Si l'objectif est d'avancer **dès aujourd'hui** avec un maximum d'impact, je recommande de traiter ces 4 chantiers dans cet ordre :

### A. Quick wins SEO (2h à 4h)

1. Ajouter `openGraph` + `twitter` + `metadataBase` + `alternates.canonical` dans `app/layout.tsx`.
2. Vérifier/compléter les `title` et `description` des pages métier principales.
3. Corriger le sitemap pour retirer les routes non publiques (admin/profil/utilisateur).

**Résultat attendu aujourd'hui :** meilleur partage social, signaux SEO plus propres, indexation plus saine.

### B. Durcissement sécurité HTTP (2h à 3h)

1. Ajouter des security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors).
2. Ajuster la CSP pour supporter le script thème inline avec nonce/hash.
3. Vérifier les en-têtes effectifs en production (curl + outil d'audit headers).

**Résultat attendu aujourd'hui :** réduction rapide de la surface de risque côté navigateur.

### C. Conversion UX sur inscription (2h à 5h)

1. Ajouter un CTA primaire persistant « S'inscrire à un tournoi » (header/home/sidebar).
2. Clarifier le flux d'inscription (interne/externe club) par un texte court au-dessus du CTA.
3. Ajouter un état vide orienté action dans la section communauté.

**Résultat attendu aujourd'hui :** parcours plus compréhensible, baisse du risque d'abandon.

### D. Baseline performance mesurable (1h à 2h)

1. Lancer un premier Lighthouse (mobile + desktop) sur home + pages clés.
2. Noter 3 KPI initiaux : LCP, INP, CLS.
3. Créer une mini check-list hebdo de suivi des vitals.

**Résultat attendu aujourd'hui :** base chiffrée pour piloter les optimisations au lieu d'estimations.

### Proposition de découpage en 1 journée (exemple)

- **Matin (9h-12h)** : SEO metadata + sitemap.
- **Début d'après-midi (13h30-15h30)** : headers sécurité + vérification.
- **Fin d'après-midi (15h30-18h)** : CTA inscription + état vide communauté + premier Lighthouse.

### Livrables de fin de journée

- PR 1 : SEO metadata + sitemap propre.
- PR 2 : security headers + note de validation.
- PR 3 : amélioration UX inscription.
- Fichier de suivi KPI perf initial (LCP/INP/CLS).
