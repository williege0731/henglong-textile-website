# Effect fidelity notes (Henglong vs Etro Textiles)

Reference observed: https://etrotextiles.etro.com/ (public pages only).
Henglong uses original CSS/JS + licensed fabric photos in `images/web/`. No Etro assets, logos, IvyMode fonts, or proprietary code.

| Etro effect | Henglong polish (v4 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~700vh scrub |
| Hero wipe | Bottom clip-path wipe revealing cream + type |
| Giant DISCOVER headline | 「探索 / 新面料」 Bodoni, rises with wipe, splits on scrub |
| Tilted cards crossing type | 8 licensed polaroids, bob+tilt, track scrub after wipe |
| Smooth wheel scrub | Continuous RAF lerp on --hp/--fp |
| Header chrome | Transparent on hero → solid after wipe; hide on down-scroll |

QA frames: `?shot=hero|wipe|cards`

Still different: no hero video; no paid IvyMode; no wheel-hijack; no Etro wishlist/distributors.
