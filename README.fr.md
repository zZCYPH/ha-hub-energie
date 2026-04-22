[English](README.md) · **Français**

# Hub Énergie

**Home Assistant · intégration personnalisée** — tarifs, tranches horaires, coûts, réseau / solaire / batteries, avec des diagnostics **lisibles** même quand les données sont imparfaites.

[![Home Assistant minimum](https://img.shields.io/badge/Home%20Assistant-%E2%89%A52024.10.0-41BDF5?logo=home-assistant&logoColor=white)](https://github.com/home-assistant/core/releases)
[![Structure type HACS](https://img.shields.io/badge/structure-composant%20personnalis%C3%A9%20HACS-1D1D1D?logo=github)](https://hacs.xyz/docs/publish/start/)

| | |
| :--- | :--- |
| **Découvrir (sans installer)** | **[Vitrine + simulateur du flux de config](https://hub-energie.ts-devops.com/showcase)** |
| **Documentation complète** | **[hub-energie.ts-devops.com](https://hub-energie.ts-devops.com)** · [Installation & aide](https://hub-energie.ts-devops.com/doc/setup-help) |
| **Tickets** | [GitLab](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/issues) |
| **Releases** | [GitHub](https://github.com/zZCYPH/ha-hub-energie/releases) (miroir, HACS) · [GitLab](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/releases) (amont) |

> Les sujets avancés (SSOT vs compteurs, états de santé, reconstructions recorder, limites) sont sur le **site** — ce README reste un **court guide** (prise en main + installation).

---

## En bref

| Volet | Rôle de Hub Énergie |
| :--- | :--- |
| **Tarifs** | EDF ou fournisseur perso · forfait, HP/HC, multi-créneaux, Tempo (RTE / API / capteur). Abonnement + prix → **coût du jour (€)** et détail par tranche dans les attributs. |
| **Énergie** | Deltas positifs sur compteurs `total_increasing` → journée « Paris », stats long terme, totaux **SSOT** alignés avec la compta interne. |
| **Matériel** | Réseau monophasé ou triphasé · export & solaire optionnels · **0…N** batteries · estimation PV « clear-sky » optionnelle + ligne revente. |
| **Diagnostics** | Santé / confiance, obsolescence, bucket inconnu, indices de rebuild — champ **`cause`** **explicite**, pas seulement un voyant vert. |
| **UI** | Carte **Lovelace** + carte flux live · bundles dans `frontend/dist/`, servis par HA sous **`/hub_energie/`** (pas de Node sur l’appareil pour une install classique). |

**Expérimental / au mieux** (si activé) : attribution batteries par graphe de puissance, modèle PV, indices type coût d’opportunité — voir changelog & site pour les limites.

---

## Installation

**Prérequis :** Home Assistant **2024.10** ou plus récent (`manifest.json`).

1. Déployer l’arborescence `custom_components/hub_energie/` sur votre instance (voir ci-dessous).
2. **Redémarrer** Home Assistant (redémarrage complet).
3. **Paramètres → Appareils et services → Ajouter une intégration → Hub Énergie**.

### HACS (dépôt personnalisé)

HACS → ⋮ → **Dépôts personnalisés** → URL : **`https://github.com/zZCYPH/ha-hub-energie`** → catégorie **Intégration**, puis installation depuis l’interface.  
*(L’entrée dans le catalogue HACS par défaut est une démarche distincte — voir [HACS publish / include](https://hacs.dev/docs/publish/include).)*

### ZIP (GitHub ou GitLab)

Téléchargez l’archive d’une release et décompressez-la à la **racine** du dossier de configuration HA (à côté de `configuration.yaml`) pour obtenir :

`config/custom_components/hub_energie/manifest.json`

Ne copiez **pas** `site/`, `tests/` ni `scripts/` dans `config/` — seul le paquet `custom_components/hub_energie/`.

### Icônes de marque (Home Assistant 2026.3+)

Les visuels sont fournis dans **`custom_components/hub_energie/brand/`** (marques locales — plus besoin de PR sur `home-assistant/brands` pour un nouveau custom).

---

## Lovelace (minimal)

En mode stockage, la ressource module est en général ajoutée automatiquement ; en **YAML**, pointez vers l’URL **boot** :

```yaml
resources:
  - url: /hub_energie/hub-energie-card-boot.js
    type: module
```

```yaml
type: custom:hub-energie-card
```

```yaml
type: custom:hub-energie-flow-card
```

Options d’éditeur, cache-busting, migration d’anciennes URL → **[doc sur le site](https://hub-energie.ts-devops.com)**.

---

## Services

| Service | Rôle |
| :--- | :--- |
| `hub_energie.refresh` | Forcer un rafraîchissement du coordinateur |
| `hub_energie.refresh_tariffs` | Re-télécharger les tarifs EDF (mode auto) |

---

## Arborescence du dépôt (contributeurs)

| Chemin | Rôle |
| :--- | :--- |
| `custom_components/hub_energie/` | Intégration chargée par Home Assistant |
| `site/` | Site vitrine / doc Vite (GitLab Pages — **hors** install HA) |
| `.github/workflows/` | GitHub Actions (vérifs branche `hacs`, releases taguées) |
| `.gitlab-ci.yml` | GitLab CI (pages, releases, contrôles catalogue) |

---

## Licence

L’usage et la redistribution sont régis par le ou les fichiers de licence fournis avec ce dépôt.
