# Effect fidelity notes (Henglong vs Etro Textiles)

Reference observed: https://etrotextiles.etro.com/ (public pages only).
Henglong uses original CSS/JS + licensed fabric photos in `images/web/`. No Etro assets, logos, IvyMode fonts, or proprietary code.

| Etro effect | Henglong polish (v6 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~860vh scrub |
| Hero wipe | Soft mask + clip-path wipe, luminous edge, scale lift |
| Giant DISCOVER headline | 「探索 / 新面料」 rises with wipe; held; splits + fades as cards scrub |
| Tilted cards crossing type | 10 licensed polaroids, denser track, perspective bob/Z |
| Smooth scrub | Always-on RAF + velocity-aware lerp |

QA frames: `frame-hero|midwipe|wipe|cards.html`, `?shot=`

Still different: no hero video; no paid IvyMode; no wheel-hijack; no Etro wishlist/distributors.
