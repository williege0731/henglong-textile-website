# Effect fidelity notes (Henglong vs Etro Textiles)

Reference observed: https://etrotextiles.etro.com/ (public pages only).
Henglong uses original CSS/JS + licensed fabric photos in `images/web/`. No Etro assets, logos, IvyMode fonts, or proprietary code.

| Etro effect | Henglong polish (v5 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~780vh scrub |
| Hero wipe | Bottom clip-path wipe + luminous wipe edge + scale lift |
| Giant DISCOVER headline | 「探索 / 新面料」 rises with wipe; held before cards; splits on scrub |
| Tilted cards crossing type | 8 licensed polaroids, denser track, stronger bob after type hold |
| Smooth scrub | Always-on RAF lerp on --hp/--fp |

QA frames: `frame-midwipe.html`, `frame-wipe.html`, `frame-cards.html`, `?shot=hero|midwipe|wipe|cards`

Still different: no hero video; no paid IvyMode; no wheel-hijack; no Etro wishlist/distributors.
