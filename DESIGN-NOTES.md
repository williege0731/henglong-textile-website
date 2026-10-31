# Effect fidelity notes (Henglong vs Etro Textiles)

Reference: https://etrotextiles.etro.com/ (public pages only).
Original CSS/JS + licensed fabric photos. No Etro assets/logos/fonts/code.

| Etro effect | Henglong polish (v9 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~1040vh scrub |
| Hero wipe | Soft mask wipe + longer feather + stronger lift/parallax |
| Giant DISCOVER headline | 「探索 / 新面料」 rises centered, holds, splits; mid-band kept clear |
| Tilted cards crossing type | High/low stagger around type band; wider gaps; enter scale |
| Smooth scrub | Delta-time exponential lerp; snappier wipe; softer card scrub |

QA: `frame-hero|midwipe|wipe|cards.html`
