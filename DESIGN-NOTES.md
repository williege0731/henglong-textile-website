# Effect fidelity notes (Henglong vs Etro Textiles)

Reference: https://etrotextiles.etro.com/ (public pages only).
Original CSS/JS + licensed fabric photos in `images/web/`. No Etro assets/logos/fonts/code.

| Etro effect | Henglong polish (v7 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~920vh scrub; subtle pin scale |
| Hero wipe | Soft mask wipe + luminous edge + longer feather |
| Giant DISCOVER headline | 「探索 / 新面料」 rises, holds longer, splits as cards scrub |
| Tilted cards crossing type | 10 solid polaroids (opaque); type peeks between cards |
| Smooth scrub | Always-on RAF + velocity-aware critically-damped-ish lerp + spin |

QA: `frame-hero|midwipe|wipe|cards.html`, `?shot=`
